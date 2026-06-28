import uuid
import time
import io
import zipfile
import json
import bcrypt
import jwt
import traceback
import subprocess
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, status, Depends, Header, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, EmailStr

import asyncio
from config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, CORS_ORIGINS, ENV
from database import db_manager
from redis_manager import redis_manager
from security import SecurityHeadersMiddleware, RequestTracingMiddleware, CSRFMiddleware, RedisRateLimitMiddleware
from generation import generate_website_schema, generate_schema_edit
from worker import worker_loop, handle_generate_ai_site

# Setup logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s")
logger = logging.getLogger("qevora.api")

app = FastAPI(
    title="Qevora API Gateway",
    description="Core backend orchestrator, database bridge, and AI compilation engine for Qevora",
    version="1.0.0"
)

# Ingress CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Hardened Security Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestTracingMiddleware)
app.add_middleware(CSRFMiddleware)
app.add_middleware(RedisRateLimitMiddleware)

# --- Pydantic Data Models ---
class SignupRequest(BaseModel):
    email: EmailStr
    fullName: str
    password: str = Field(..., min_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    userId: str

class ProjectCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    userId: str
    name: str
    description: Optional[str]
    status: str
    createdAt: str
    updatedAt: str

class GenerateRequest(BaseModel):
    projectId: str
    prompt: str = Field(..., min_length=5, max_length=1000)

class EditRequest(BaseModel):
    projectId: str
    instruction: str = Field(..., min_length=3, max_length=1000)

class DomainRequest(BaseModel):
    domainName: str = Field(..., min_length=4)

# --- Authentication Helpers ---
def create_access_token(user_id: str) -> str:
    expires = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expires, "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    expires = datetime.utcnow() + timedelta(days=7)
    payload = {"sub": user_id, "exp": expires, "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user_id(request: Request) -> str:
    # First check HTTP-only cookie if available
    token = request.cookies.get("access_token")
    
    # Fallback to Authorization Header
    if not token:
        authorization = request.headers.get("Authorization")
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization session token missing")
        token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        
        # Verify user exists in active session store (Redis)
        session_user = redis_manager.verify_session(token)
        if not session_user:
            # Session expired in Redis, require validation or user lookup
            user_exists = await db_manager.get_user_by_id(payload["sub"])
            if not user_exists:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User session invalid")
            # Cache session in Redis
            redis_manager.store_session(payload["sub"], token, expire_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60)
            
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")

worker_task = None

# --- Startup/Shutdown Lifecycles ---
@app.on_event("startup")
async def startup():
    global worker_task
    logger.info("========== FASTAPI STARTUP ==========")
    try:
        await db_manager.connect()
        logger.info("Successfully established connection pool to PostgreSQL.")
    except Exception as e:
        logger.critical(f"Fatal: Could not connect to PostgreSQL database: {e}")
        
    try:
        redis_manager.connect()
        logger.info("Successfully initialized connection client to Redis.")
    except Exception as e:
        logger.critical(f"Fatal: Could not connect to Redis server: {e}")

    try:
        logger.info("========== WORKER TASK CREATED ==========")
        worker_task = asyncio.create_task(worker_loop())
        logger.info("Successfully started background task worker loop in API process.")
    except Exception as e:
        logger.error(f"Failed to start background task worker: {e}")

@app.on_event("shutdown")
async def shutdown():
    global worker_task
    if worker_task:
        worker_task.cancel()
    await db_manager.disconnect()
    redis_manager.disconnect()
    logger.info("Monorepo API services shut down cleanly.")

# --- Monitoring & Probe Endpoints ---
@app.get("/health")
async def get_health():
    db_status = "CONNECTED" if (db_manager.pool and not db_manager.pool.is_closing()) else "OFFLINE"
    return {
        "status": "OK",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status
    }

@app.get("/health/ready")
async def get_readiness():
    try:
        # Test DB connection
        await db_manager.connect()
        async with db_manager.pool.acquire() as conn:
            await conn.execute("SELECT 1")
            
        # Test Redis ping
        if not redis_manager.ping():
            raise Exception("Redis check failed")
        
        return {
            "status": "ready",
            "postgres": "healthy",
            "redis": "healthy",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service not ready: {str(e)}"
        )

@app.get("/health/live")
async def get_liveness():
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}

# --- Task Status Checking ---
@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str, user_id: str = Depends(get_current_user_id)):
    status_data = redis_manager.get_cache(f"task:status:{task_id}")
    if not status_data:
        status_data = await db_manager.get_task_status(task_id)
    if not status_data:
        return {"status": "pending", "message": "Task queued in background loop"}
    return status_data

# --- 009.1 Authentication System ---
@app.post("/auth/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest, response: Response):
    try:
        existing = await db_manager.get_user_by_email(payload.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email is already registered")
        
        # Hash password
        pwd_bytes = payload.password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')
        
        user = await db_manager.create_user(payload.email, payload.fullName, hashed)
        
        # Create access and refresh tokens
        access_token = create_access_token(user["id"])
        refresh_token = create_refresh_token(user["id"])
        
        # Set short-lived access token in cookie and HTTP-only refresh token
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=ENV == "production",
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=ENV == "production",
            samesite="strict",
            max_age=7 * 24 * 60 * 60 # 7 days
        )
        
        # Cache active session in Redis
        redis_manager.store_session(user["id"], access_token, expire_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        
        # Queue welcome and verification emails via Redis worker queue
        redis_manager.push_task("default", {
            "task_id": f"welcome-{user['id']}",
            "type": "dispatch_email",
            "payload": {
                "email_type": "welcome",
                "to_email": user["email"],
                "full_name": user["fullName"]
            }
        })
        
        redis_manager.push_task("default", {
            "task_id": f"verify-{user['id']}",
            "type": "dispatch_email",
            "payload": {
                "email_type": "verification",
                "to_email": user["email"],
                "token": uuid.uuid4().hex
            }
        })

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            userId=user["id"]
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database signup fail: {str(e)}")

@app.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest, response: Response):
    user = await db_manager.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password hash
    async with db_manager.pool.acquire() as conn:
        acc = await conn.fetchrow('SELECT "passwordHash" FROM "AuthAccount" WHERE "userId" = $1 AND provider = \'email\'', user["id"])
        if not acc:
            raise HTTPException(status_code=401, detail="Account requires OAuth provider login")
        
        pwd_bytes = payload.password.encode('utf-8')
        hash_bytes = acc["passwordHash"].encode('utf-8')
        if not bcrypt.checkpw(pwd_bytes, hash_bytes):
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
    access_token = create_access_token(user["id"])
    refresh_token = create_refresh_token(user["id"])
    
    # Set tokens in cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=ENV == "production",
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=ENV == "production",
        samesite="strict",
        max_age=7 * 24 * 60 * 60
    )
    
    redis_manager.store_session(user["id"], access_token, expire_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        userId=user["id"]
    )

@app.post("/auth/refresh", response_model=TokenResponse)
async def refresh_session(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh session cookie missing")
        
    try:
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
            
        user_id = payload["sub"]
        access_token = create_access_token(user_id)
        
        # Update access token cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=ENV == "production",
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        redis_manager.store_session(user_id, access_token, expire_seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            userId=user_id
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or invalid")

@app.post("/auth/logout")
async def logout(request: Request, response: Response):
    access_token = request.cookies.get("access_token")
    if access_token:
        redis_manager.delete_session(access_token)
        
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"success": True, "message": "Logged out successfully"}

@app.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user_id)):
    user = await db_manager.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user["id"],
        "email": user["email"],
        "fullName": user["fullName"],
        "planId": user["planId"]
    }

# --- 009.2 Project Management ---
@app.post("/projects", response_model=ProjectResponse)
async def create_project(payload: ProjectCreateRequest, user_id: str = Depends(get_current_user_id)):
    quota_info = await db_manager.check_quota(user_id)
    if not quota_info["allowed"]:
        raise HTTPException(status_code=403, detail=quota_info["reason"])
    
    quota = quota_info["quota"]
    if quota["projectsCreated"] >= quota["maxProjects"]:
        raise HTTPException(status_code=403, detail="Maximum project limit reached for this subscription plan.")
        
    project = await db_manager.create_project(user_id, payload.name, payload.description)
    return ProjectResponse(
        id=project["id"],
        userId=project["userId"],
        name=project["name"],
        description=project["description"],
        status=project["status"],
        createdAt=project["createdAt"].isoformat(),
        updatedAt=project["updatedAt"].isoformat()
    )

@app.get("/projects", response_model=List[ProjectResponse])
async def list_projects(user_id: str = Depends(get_current_user_id)):
    rows = await db_manager.get_user_projects(user_id)
    return [
        ProjectResponse(
            id=r["id"],
            userId=r["userId"],
            name=r["name"],
            description=r["description"],
            status=r["status"],
            createdAt=r["createdAt"].isoformat(),
            updatedAt=r["updatedAt"].isoformat()
        ) for r in rows
    ]

class ProjectUpdateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None

@app.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project_route(project_id: str, payload: ProjectUpdateRequest, user_id: str = Depends(get_current_user_id)):
    async with db_manager.pool.acquire() as conn:
        row = await conn.fetchrow('SELECT "userId" FROM "Project" WHERE id = $1', project_id)
        if not row or row["userId"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized project access")
            
    project = await db_manager.update_project(project_id, payload.name, payload.description)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return ProjectResponse(
        id=project["id"],
        userId=project["userId"],
        name=project["name"],
        description=project["description"],
        status=project["status"],
        createdAt=project["createdAt"].isoformat(),
        updatedAt=project["updatedAt"].isoformat()
    )

@app.post("/projects/{project_id}/duplicate", response_model=ProjectResponse)
async def duplicate_project_route(project_id: str, user_id: str = Depends(get_current_user_id)):
    async with db_manager.pool.acquire() as conn:
        row = await conn.fetchrow('SELECT * FROM "Project" WHERE id = $1 AND "deletedAt" IS NULL', project_id)
        if not row or row["userId"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized project access")
            
        new_name = f"{row['name']} (Copy)"
        new_project = await db_manager.create_project(user_id, new_name, row['description'])
        
        schema = await db_manager.get_latest_project_schema(project_id)
        if schema:
            schema["projectId"] = new_project["id"]
            await db_manager.save_schema_version(new_project["id"], schema, created_by="duplicate")
            
        return ProjectResponse(
            id=new_project["id"],
            userId=new_project["userId"],
            name=new_project["name"],
            description=new_project["description"],
            status=new_project["status"],
            createdAt=new_project["createdAt"].isoformat(),
            updatedAt=new_project["updatedAt"].isoformat()
        )

@app.delete("/projects/{project_id}")
async def delete_project(project_id: str, user_id: str = Depends(get_current_user_id)):
    async with db_manager.pool.acquire() as conn:
        row = await conn.fetchrow('SELECT "userId" FROM "Project" WHERE id = $1', project_id)
        if not row or row["userId"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized project access")
            
    success = await db_manager.delete_project(project_id)
    return {"success": success}

# --- 009.4 & 009.5 Site Schema Generation ---
@app.post("/projects/{project_id}/generate")
async def generate_site(project_id: str, payload: GenerateRequest, user_id: str = Depends(get_current_user_id)):
    # Check cache for similar generated prompts
    cache_key = f"generation_prompt:{hash(payload.prompt)}"
    cached_schema = redis_manager.get_cache(cache_key)
    if cached_schema:
        logger.info("Serving schema from Redis cache for duplicate prompt.")
        cached_schema["projectId"] = project_id
        await db_manager.save_schema_version(project_id, cached_schema, created_by="ai_cache")
        return {"success": True, "schema": cached_schema, "cached": True}

    quota_info = await db_manager.check_quota(user_id)
    if not quota_info["allowed"]:
        raise HTTPException(status_code=403, detail=quota_info["reason"])
        
    # Queue task for background execution
    task_id = f"gen-{uuid.uuid4().hex[:12]}"
    task_payload = {
        "task_id": task_id,
        "type": "generate_ai_site",
        "payload": {
            "projectId": project_id,
            "prompt": payload.prompt,
            "userId": user_id
        }
    }
    # Initialize pending status cache and DB persistence
    init_status = {"status": "pending", "message": "Generation task queued"}
    redis_manager.set_cache(f"task:status:{task_id}", init_status, expire_seconds=300)
    await db_manager.set_task_status(task_id, init_status)
    redis_manager.push_task("default", task_payload)
    asyncio.create_task(handle_generate_ai_site(task_id, task_payload["payload"]))
    return {"success": True, "taskId": task_id, "message": "Generation task successfully queued in background worker."}

# --- 009.7 AI Editing Engine ---
@app.post("/projects/{project_id}/edit")
async def edit_site(project_id: str, payload: EditRequest, user_id: str = Depends(get_current_user_id)):
    quota_info = await db_manager.check_quota(user_id)
    if not quota_info["allowed"]:
        raise HTTPException(status_code=403, detail=quota_info["reason"])
        
    start_time = datetime.utcnow()
    try:
        current_schema = await db_manager.get_latest_project_schema(project_id)
        if not current_schema:
            raise HTTPException(status_code=404, detail="No base schema found. Generate a site first.")
            
        updated_schema = generate_schema_edit(current_schema, payload.instruction)
        
        await db_manager.save_schema_version(project_id, updated_schema, created_by="ai")
        
        duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await db_manager.record_usage(user_id, 2000, "edit", duration)
        
        return {
            "success": True,
            "schema": updated_schema,
            "tokensConsumed": 2000,
            "latencyMs": duration
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Schema edit failed: {str(e)}")

@app.get("/projects/{project_id}/schema")
async def get_project_schema(project_id: str, user_id: str = Depends(get_current_user_id)):
    # Cache layer check
    cache_key = f"project_schema:{project_id}"
    cached_schema = redis_manager.get_cache(cache_key)
    if cached_schema:
        return cached_schema

    schema = await db_manager.get_latest_project_schema(project_id)
    if not schema:
        raise HTTPException(status_code=404, detail="No schema found for this project")
        
    redis_manager.set_cache(cache_key, schema, expire_seconds=300)
    return schema

@app.post("/projects/{project_id}/schema")
async def save_project_schema(project_id: str, payload: Dict[str, Any], user_id: str = Depends(get_current_user_id)):
    async with db_manager.pool.acquire() as conn:
        row = await conn.fetchrow('SELECT "userId" FROM "Project" WHERE id = $1', project_id)
        if not row or row["userId"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized project access")
            
    version = await db_manager.save_schema_version(project_id, payload, created_by="user")
    
    # Invalidate caches
    redis_manager.invalidate_cache(f"project_schema:{project_id}")
    return {"success": True, "versionNumber": version["versionNumber"]}

# --- 009.10 Publishing Engine ---
@app.post("/projects/{project_id}/publish")
async def publish_site(project_id: str, mode: str = "production", user_id: str = Depends(get_current_user_id)):
    schema = await db_manager.get_latest_project_schema(project_id)
    if not schema:
        raise HTTPException(status_code=404, detail="No schema found to publish. Generate first.")

    # Queue publishing task to Background Worker
    task_id = f"pub-{uuid.uuid4().hex[:12]}"
    task_payload = {
        "task_id": task_id,
        "type": "publish_site",
        "payload": {
            "projectId": project_id,
            "mode": mode
        }
    }
    redis_manager.push_task("default", task_payload)
    return {"success": True, "taskId": task_id, "message": "Publish task successfully queued in background worker."}

# --- 009.11 Custom Domains ---
@app.post("/projects/{project_id}/domain")
async def connect_domain(project_id: str, payload: DomainRequest, user_id: str = Depends(get_current_user_id)):
    async with db_manager.pool.acquire() as conn:
        pub = await conn.fetchrow('SELECT id FROM "PublishedSite" WHERE "projectId" = $1', project_id)
        if not pub:
            raise HTTPException(status_code=400, detail="Site must be published before mapping a custom domain")
            
        domain = await db_manager.add_custom_domain(project_id, pub["id"], payload.domainName)
        return {
            "success": True,
            "domainId": domain["id"],
            "domainName": domain["domainName"],
            "verificationTxt": domain["verificationTxt"],
            "isVerified": domain["isVerified"],
            "sslStatus": domain["sslStatus"]
        }

@app.post("/projects/{project_id}/domain/verify")
async def verify_domain(project_id: str, user_id: str = Depends(get_current_user_id)):
    # Queue verification task to Background Worker
    task_id = f"dom-{uuid.uuid4().hex[:12]}"
    task_payload = {
        "task_id": task_id,
        "type": "verify_custom_domain",
        "payload": {
            "projectId": project_id
        }
    }
    redis_manager.push_task("default", task_payload)
    return {"success": True, "taskId": task_id, "message": "Domain verification task successfully queued."}

# --- 009.12 Project Export ---
@app.get("/projects/{project_id}/export/{format}")
async def export_project(project_id: str, format: str, user_id: str = Depends(get_current_user_id)):
    if format not in ["static", "react", "nextjs"]:
        raise HTTPException(status_code=400, detail="Unsupported export format. Choose: static, react, nextjs")

    schema = await db_manager.get_latest_project_schema(project_id)
    if not schema:
        raise HTTPException(status_code=404, detail="No schema found to export. Generate first.")

    try:
        from config import RENDERER_CLI_PATH
        proc = subprocess.Popen(
            ["node", RENDERER_CLI_PATH],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = proc.communicate(input=json.dumps(schema), timeout=15)
        result = None
        for line in reversed(stdout.splitlines()):
            line_str = line.strip()
            if line_str.startswith("{") and line_str.endswith("}"):
                try:
                    result = json.loads(line_str)
                    break
                except Exception:
                    continue
        if result is None:
            result = json.loads(stdout.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compiler invocation failed: {str(e)} | stdout: {stdout[:500] if 'stdout' in locals() else 'N/A'} | stderr: {stderr[:500] if 'stderr' in locals() else 'N/A'}")

    if not result.get("success"):
        raise HTTPException(status_code=400, detail={"message": "Export failed validation checks", "errors": result.get("errors")})

    files = result.get("files", {})

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        if format == "static":
            for filename, content in files.items():
                if not filename.startswith("exports/"):
                    zip_file.writestr(filename, content)
        elif format == "nextjs":
            for filename, content in files.items():
                if filename.startswith("exports/nextjs/"):
                    rel_path = filename.replace("exports/nextjs/", "")
                    zip_file.writestr(rel_path, content)
        elif format == "react":
            for filename, content in files.items():
                if filename.startswith("exports/react/"):
                    rel_path = filename.replace("exports/react/", "")
                    zip_file.writestr(rel_path, content)

    zip_buffer.seek(0)
    
    headers = {
        "Content-Disposition": f"attachment; filename=qevora-export-{project_id[:8]}-{format}.zip"
    }
    return StreamingResponse(zip_buffer, media_type="application/zip", headers=headers)

# --- AI Streaming & Version Control Endpoints ---
@app.post("/projects/{project_id}/generate/stream")
async def generate_site_stream(project_id: str, payload: GenerateRequest, user_id: str = Depends(get_current_user_id)):
    quota_info = await db_manager.check_quota(user_id)
    if not quota_info["allowed"]:
        raise HTTPException(status_code=403, detail=quota_info["reason"])
    
    from fastapi.responses import StreamingResponse
    from generation import stream_website_generation
    
    return StreamingResponse(
        stream_website_generation(project_id, payload.prompt, user_id),
        media_type="text/event-stream"
    )

@app.get("/projects/{project_id}/versions")
async def list_project_versions(project_id: str, user_id: str = Depends(get_current_user_id)):
    async with db_manager.pool.acquire() as conn:
        row = await conn.fetchrow('SELECT "userId" FROM "Project" WHERE id = $1', project_id)
        if not row or row["userId"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized project access")
            
    versions = await db_manager.get_project_versions(project_id)
    return versions

@app.get("/projects/{project_id}/versions/{version_number}")
async def get_project_version_schema(project_id: str, version_number: int, user_id: str = Depends(get_current_user_id)):
    async with db_manager.pool.acquire() as conn:
        row = await conn.fetchrow('SELECT "userId" FROM "Project" WHERE id = $1', project_id)
        if not row or row["userId"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized project access")
            
    schema = await db_manager.get_project_schema_by_version(project_id, version_number)
    if not schema:
        raise HTTPException(status_code=404, detail="Version not found")
    return schema

@app.post("/projects/{project_id}/versions/{version_number}/restore")
async def restore_project_version_route(project_id: str, version_number: int, user_id: str = Depends(get_current_user_id)):
    async with db_manager.pool.acquire() as conn:
        row = await conn.fetchrow('SELECT "userId" FROM "Project" WHERE id = $1', project_id)
        if not row or row["userId"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized project access")
            
    schema = await db_manager.get_project_schema_by_version(project_id, version_number)
    if not schema:
        raise HTTPException(status_code=404, detail="Version not found")
        
    version_row = await db_manager.save_schema_version(project_id, schema, created_by="restore")
    redis_manager.invalidate_cache(f"project_schema:{project_id}")
    return {"success": True, "versionNumber": version_row["versionNumber"], "schema": schema}

# --- Cloudinary Asset Management Endpoints ---
from fastapi import UploadFile, File
from cloudinary_manager import upload_image, delete_image, optimize_url

@app.post("/assets/upload")
async def upload_asset(
    file: UploadFile = File(...),
    projectId: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    try:
        content = await file.read()
        result = upload_image(content, file.filename, project_id=projectId)
        return {
            "success": True,
            "publicId": result["public_id"],
            "url": result["secure_url"],
            "optimizedUrl": optimize_url(result["public_id"], width=800)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@app.delete("/assets/{public_id:path}")
async def delete_asset(public_id: str, user_id: str = Depends(get_current_user_id)):
    success = delete_image(public_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete image from Cloudinary")
    return {"success": True}


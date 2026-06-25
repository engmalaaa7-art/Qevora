from fastapi import FastAPI, HTTPException, status, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Any, Optional
import uuid
import jwt
from datetime import datetime, timedelta
import bcrypt
import traceback

from config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from database import db_manager
from generation import generate_website_schema, generate_schema_edit

app = FastAPI(
    title="Qevora API Gateway",
    description="Core backend orchestrator, database bridge, and AI compilation engine for Qevora",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    payload = {"sub": user_id, "exp": expires}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing")
    
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")

# --- Startup/Shutdown Lifecycles ---
@app.on_event("startup")
async def startup():
    try:
        await db_manager.connect()
    except Exception as e:
        print(f"Warning: Could not connect to database at startup: {e}")

@app.on_event("shutdown")
async def shutdown():
    await db_manager.disconnect()

# --- Health check ---
@app.get("/health")
async def get_health():
    db_status = "CONNECTED" if db_manager.pool else "OFFLINE"
    return {
        "status": "OK",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status
    }

# --- 009.1 Authentication System ---
@app.post("/auth/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest):
    try:
        existing = await db_manager.get_user_by_email(payload.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email is already registered")
        
        # Hash password
        pwd_bytes = payload.password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')
        
        user = await db_manager.create_user(payload.email, payload.fullName, hashed)
        token = create_access_token(user["id"])
        
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            userId=user["id"]
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database signup fail: {str(e)}")

@app.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await db_manager.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Get hash
    async with db_manager.pool.acquire() as conn:
        acc = await conn.fetchrow('SELECT "passwordHash" FROM "AuthAccount" WHERE "userId" = $1 AND provider = \'email\'', user["id"])
        if not acc:
            raise HTTPException(status_code=401, detail="Account requires OAuth provider login")
        
        pwd_bytes = payload.password.encode('utf-8')
        hash_bytes = acc["passwordHash"].encode('utf-8')
        if not bcrypt.checkpw(pwd_bytes, hash_bytes):
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
    token = create_access_token(user["id"])
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        userId=user["id"]
    )

# --- 009.2 Project Management ---
@app.post("/projects", response_model=ProjectResponse)
async def create_project(payload: ProjectCreateRequest, user_id: str = Depends(get_current_user_id)):
    # Check project limit quota
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

@app.delete("/projects/{project_id}")
async def delete_project(project_id: str, user_id: str = Depends(get_current_user_id)):
    # Validate ownership
    async with db_manager.pool.acquire() as conn:
        row = await conn.fetchrow('SELECT "userId" FROM "Project" WHERE id = $1', project_id)
        if not row or row["userId"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized project access")
            
    success = await db_manager.delete_project(project_id)
    return {"success": success}

# --- 009.4 & 009.5 Site Schema Generation ---
@app.post("/projects/{project_id}/generate")
async def generate_site(project_id: str, payload: GenerateRequest, user_id: str = Depends(get_current_user_id)):
    # Verify quota limit
    quota_info = await db_manager.check_quota(user_id)
    if not quota_info["allowed"]:
        raise HTTPException(status_code=403, detail=quota_info["reason"])
        
    start_time = datetime.utcnow()
    try:
        schema = generate_website_schema(payload.prompt)
        schema["projectId"] = project_id
        
        # Save version snapshot
        await db_manager.save_schema_version(project_id, schema, created_by="ai")
        
        duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        # Record usage & consume token quota
        await db_manager.record_usage(user_id, 4500, "generation", duration)
        
        return {
            "success": True,
            "schema": schema,
            "tokensConsumed": 4500,
            "latencyMs": duration
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

# --- 009.7 AI Editing Engine ---
@app.post("/projects/{project_id}/edit")
async def edit_site(project_id: str, payload: EditRequest, user_id: str = Depends(get_current_user_id)):
    quota_info = await db_manager.check_quota(user_id)
    if not quota_info["allowed"]:
        raise HTTPException(status_code=403, detail=quota_info["reason"])
        
    start_time = datetime.utcnow()
    try:
        # Load latest active schema
        current_schema = await db_manager.get_latest_project_schema(project_id)
        if not current_schema:
            raise HTTPException(status_code=404, detail="No base schema found. Generate a site first.")
            
        updated_schema = generate_schema_edit(current_schema, payload.instruction)
        
        # Save version snapshot
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
    schema = await db_manager.get_latest_project_schema(project_id)
    if not schema:
        raise HTTPException(status_code=404, detail="No schema found for this project")
    return schema

# --- 009.10 Publishing Engine ---
@app.post("/projects/{project_id}/publish")
async def publish_site(project_id: str, user_id: str = Depends(get_current_user_id)):
    schema = await db_manager.get_latest_project_schema(project_id)
    if not schema:
        raise HTTPException(status_code=404, detail="No schema found to publish. Generate first.")
        
    subdomain = f"site-{project_id[:8]}.qevora.site"
    cf_url = f"https://{subdomain}"
    s3_prefix = f"published/{project_id}"
    
    # Save published records
    published = await db_manager.publish_site(project_id, subdomain, cf_url, s3_prefix)
    
    # Update project status
    async with db_manager.pool.acquire() as conn:
        await conn.execute('UPDATE "Project" SET status = \'published\', "updatedAt" = NOW() WHERE id = $1', project_id)
        
    return {
        "success": True,
        "subdomain": subdomain,
        "url": cf_url,
        "publishedAt": datetime.utcnow().isoformat()
    }

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

import asyncio
import json
import logging
import time
import subprocess
from datetime import datetime
from typing import Dict, Any, Optional

from config import DATABASE_URL
from database import db_manager
from redis_manager import redis_manager
from email_service import EmailService
from generation import generate_website_schema, generate_schema_edit

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s")
logger = logging.getLogger("qevora.worker")

async def handle_generate_ai_site(task_id: str, payload: Dict[str, Any]):
    project_id = payload["projectId"]
    prompt = payload["prompt"]
    user_id = payload["userId"]
    logger.info(f"Task {task_id}: Processing AI generation for project {project_id}")

    # Set status to running immediately upon job pick up
    run_status = {"status": "running", "message": "AI Generation in progress"}
    redis_manager.set_cache(f"task:status:{task_id}", run_status, expire_seconds=300)
    await db_manager.set_task_status(task_id, run_status)

    try:
        start_time = datetime.utcnow()
        # Perform generator call on separate thread to prevent event loop blocking
        schema = await asyncio.to_thread(generate_website_schema, prompt)
        
        # Save version snapshot
        await db_manager.save_schema_version(project_id, schema, created_by="ai")
        
        duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await db_manager.record_usage(user_id, 4500, "generate", duration)

        status_payload = {
            "status": "completed",
            "schema": schema,
            "tokensConsumed": 4500,
            "latencyMs": duration
        }
        redis_manager.set_cache(f"task:status:{task_id}", status_payload, expire_seconds=600)
        await db_manager.set_task_status(task_id, status_payload)
        logger.info(f"Task {task_id}: AI generation finished successfully.")
    except Exception as e:
        logger.error(f"Task {task_id}: AI generation failed: {e}")
        status_payload = {"status": "failed", "error": str(e)}
        redis_manager.set_cache(f"task:status:{task_id}", status_payload, expire_seconds=600)
        await db_manager.set_task_status(task_id, status_payload)

async def handle_publish_site(task_id: str, payload: Dict[str, Any]):
    project_id = payload["projectId"]
    mode = payload.get("mode", "production")
    logger.info(f"Task {task_id}: Publishing project {project_id}")

    try:
        schema = await db_manager.get_latest_project_schema(project_id)
        if not schema:
            raise ValueError("No schema found to publish. Generate first.")

        # Invoke headless compiler
        start_time = time.time()
        from config import RENDERER_CLI_PATH
        proc = subprocess.Popen(
            ["node", RENDERER_CLI_PATH],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = proc.communicate(input=json.dumps(schema), timeout=15)
        duration_ms = int((time.time() - start_time) * 1000)

        result = json.loads(stdout)
        if not result.get("success"):
            errors = result.get("errors", ["Unknown compilation error"])
            warnings = result.get("warnings", [])
            raise ValueError(f"Quality Gate Validation failed: {errors}")

        files = result.get("files", {})
        total_size = sum(len(content.encode('utf-8')) for content in files.values())
        subdomain = f"site-{project_id[:8]}.qevora.site"
        cf_url = f"https://{subdomain}"
        s3_prefix = f"published/{project_id}/{mode}"

        # Save published records and update status in database
        await db_manager.publish_site(project_id, subdomain, cf_url, s3_prefix)
        
        async with db_manager.pool.acquire() as conn:
            await conn.execute('UPDATE "Project" SET status = \'published\', "updatedAt" = NOW() WHERE id = $1', project_id)

        # Trigger project published email notification in the background
        # Get user email
        user_email = None
        async with db_manager.pool.acquire() as conn:
            user_row = await conn.fetchrow(
                'SELECT u.email FROM "Project" p JOIN "User" u ON p."userId" = u.id WHERE p.id = $1',
                project_id
            )
            if user_row:
                user_email = user_row["email"]

        if user_email:
            redis_manager.push_task("default", {
                "task_id": f"email-{task_id}",
                "type": "dispatch_email",
                "payload": {
                    "email_type": "project_published",
                    "to_email": user_email,
                    "project_name": schema.get("metadata", {}).get("siteName", {}).get("en", "Your Qevora Project"),
                    "live_url": cf_url
                }
            })

        status_payload = {
            "status": "completed",
            "subdomain": subdomain,
            "url": cf_url,
            "warnings": result.get("warnings", []),
            "metrics": {
                "buildDurationMs": duration_ms,
                "validationStatus": "passed",
                "fileCount": len(files),
                "totalSizeBytes": total_size
            }
        }
        redis_manager.set_cache(f"task:status:{task_id}", status_payload, expire_seconds=600)
        logger.info(f"Task {task_id}: Publishing finished successfully.")
    except Exception as e:
        logger.error(f"Task {task_id}: Publishing failed: {e}")
        status_payload = {"status": "failed", "error": str(e)}
        redis_manager.set_cache(f"task:status:{task_id}", status_payload, expire_seconds=600)

async def handle_verify_custom_domain(task_id: str, payload: Dict[str, Any]):
    project_id = payload["projectId"]
    logger.info(f"Task {task_id}: Verifying custom domain for project {project_id}")

    try:
        async with db_manager.pool.acquire() as conn:
            row = await conn.fetchrow('SELECT * FROM "CustomDomain" WHERE "projectId" = $1', project_id)
            if not row:
                raise ValueError("No custom domain configured for this project")

            # Simulate lookup validation delay
            await asyncio.sleep(2)

            await conn.execute(
                'UPDATE "CustomDomain" SET "isVerified" = true, "sslStatus" = \'issued\', "updatedAt" = NOW() WHERE "projectId" = $1',
                project_id
            )
            
            status_payload = {
                "status": "completed",
                "domainName": row["domainName"],
                "isVerified": True,
                "sslStatus": "issued",
                "verifiedAt": datetime.utcnow().isoformat()
            }
            redis_manager.set_cache(f"task:status:{task_id}", status_payload, expire_seconds=600)
            logger.info(f"Task {task_id}: Domain verification completed successfully.")
    except Exception as e:
        logger.error(f"Task {task_id}: Domain verification failed: {e}")
        status_payload = {"status": "failed", "error": str(e)}
        redis_manager.set_cache(f"task:status:{task_id}", status_payload, expire_seconds=600)

async def handle_dispatch_email(task_id: str, payload: Dict[str, Any]):
    email_type = payload["email_type"]
    to_email = payload["to_email"]
    logger.info(f"Task {task_id}: Dispatching email of type {email_type} to {to_email}")

    try:
        if email_type == "verification":
            await EmailService.send_verification_email(to_email, payload["token"])
        elif email_type == "password_reset":
            await EmailService.send_password_reset_email(to_email, payload["token"])
        elif email_type == "welcome":
            await EmailService.send_welcome_email(to_email, payload["full_name"])
        elif email_type == "project_published":
            await EmailService.send_project_published_email(to_email, payload["project_name"], payload["live_url"])
        else:
            raise ValueError(f"Unknown email type: {email_type}")

        status_payload = {"status": "completed"}
        redis_manager.set_cache(f"task:status:{task_id}", status_payload, expire_seconds=300)
        logger.info(f"Task {task_id}: Email dispatch finished successfully.")
    except Exception as e:
        logger.error(f"Task {task_id}: Email dispatch failed: {e}")
        status_payload = {"status": "failed", "error": str(e)}
        redis_manager.set_cache(f"task:status:{task_id}", status_payload, expire_seconds=300)

async def worker_loop():
    logger.info("Initializing Qevora background task worker...")
    await db_manager.connect()
    redis_manager.connect()
    
    logger.info("Worker active. Listening to Redis task queue 'queue:default'...")
    
    try:
        while True:
            try:
                task = await asyncio.to_thread(redis_manager.pop_task, "default", 3)
                if not task:
                    await asyncio.sleep(0.5)
                    continue

                task_id = task.get("task_id")
                task_type = task.get("type")
                payload = task.get("payload", {})
                logger.info(f"Dequeued task {task_id} of type {task_type}")

                if task_type == "generate_ai_site":
                    await handle_generate_ai_site(task_id, payload)
                elif task_type == "publish_site":
                    await handle_publish_site(task_id, payload)
                elif task_type == "verify_custom_domain":
                    await handle_verify_custom_domain(task_id, payload)
                elif task_type == "dispatch_email":
                    await handle_dispatch_email(task_id, payload)
                else:
                    logger.error(f"Unknown task type: {task_type}")
                    redis_manager.set_cache(f"task:status:{task_id}", {"status": "failed", "error": "Unknown task type"}, expire_seconds=300)
            except asyncio.CancelledError:
                raise
            except Exception as loop_err:
                logger.error(f"Error processing task cycle: {loop_err}. Retrying loop in 1s...")
                await asyncio.sleep(1.0)

    except asyncio.CancelledError:
        logger.info("Background task worker loop cancelled cleanly.")
    except KeyboardInterrupt:
        logger.info("Shutting down worker loop due to manual interrupt.")
    except Exception as e:
        logger.critical(f"Worker crashed with exception: {e}", exc_info=True)
    finally:
        logger.info("Worker loop finished processing.")

if __name__ == "__main__":
    asyncio.run(worker_loop())

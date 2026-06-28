import asyncpg
from typing import Dict, Any, Optional, List
import json
from config import DATABASE_URL

class DatabaseManager:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        if not self.pool:
            clean_url = DATABASE_URL.split("?")[0]
            self.pool = await asyncpg.create_pool(clean_url)
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS "TaskStatus" (
                        id VARCHAR(255) PRIMARY KEY,
                        status VARCHAR(50) NOT NULL,
                        payload JSONB,
                        "updatedAt" TIMESTAMP DEFAULT NOW()
                    )
                """)

    async def set_task_status(self, task_id: str, data: Dict[str, Any]):
        await self.connect()
        status_val = data.get("status", "pending")
        async with self.pool.acquire() as conn:
            await conn.execute(
                'INSERT INTO "TaskStatus" (id, status, payload, "updatedAt") VALUES ($1, $2, $3, NOW()) '
                'ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payload = EXCLUDED.payload, "updatedAt" = NOW()',
                task_id, status_val, json.dumps(data)
            )

    async def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        await self.connect()
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow('SELECT payload FROM "TaskStatus" WHERE id = $1', task_id)
            if row and row["payload"]:
                return json.loads(row["payload"]) if isinstance(row["payload"], str) else dict(row["payload"])
            return None

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            self.pool = None

    # --- Authentication Queries ---
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        await self.connect()
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow('SELECT * FROM "User" WHERE email = $1 AND "deletedAt" IS NULL', email)
            return dict(row) if row else None

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        await self.connect()
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow('SELECT * FROM "User" WHERE id = $1 AND "deletedAt" IS NULL', user_id)
            return dict(row) if row else None

    async def create_user(self, email: str, full_name: str, password_hash: str, provider: str = "email") -> Dict[str, Any]:
        await self.connect()
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                # Fetch default Free Plan ID
                plan_row = await conn.fetchrow('SELECT id FROM "SubscriptionPlan" WHERE slug = \'free\'')
                if not plan_row:
                    # Fallback fallback insert plan
                    plan_id = str(uuid.uuid4())
                    await conn.execute(
                        'INSERT INTO "SubscriptionPlan" (id, name, slug, "priceMonthly", "priceYearly", "maxProjects", "maxPagesPerSite", "aiTokensPerMonth", "customDomains") VALUES ($1, $2, $3, 0, 0, 1, 3, 50000, false)',
                        plan_id, "Free Trial", "free"
                    )
                else:
                    plan_id = plan_row["id"]

                user_id = str(uuid.uuid4())
                user = await conn.fetchrow(
                    'INSERT INTO "User" (id, email, "fullName", "planId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
                    user_id, email, full_name, plan_id
                )
                
                await conn.execute(
                    'INSERT INTO "AuthAccount" (id, "userId", provider, "passwordHash", "createdAt") VALUES ($1, $2, $3, $4, NOW())',
                    str(uuid.uuid4()), user_id, provider, password_hash
                )
                
                # Setup quota snapshot
                await conn.execute(
                    'INSERT INTO "QuotaSnapshot" (id, "userId", "tokensConsumed", "projectsCreated", "pagesCreated", "lastResetAt") VALUES ($1, $2, 0, 0, 0, NOW())',
                    str(uuid.uuid4()), user_id
                )
                return dict(user)

    # --- Project Management Queries ---
    async def get_user_projects(self, user_id: str) -> List[Dict[str, Any]]:
        await self.connect()
        async with self.pool.acquire() as conn:
            rows = await conn.fetch('SELECT * FROM "Project" WHERE "userId" = $1 AND "deletedAt" IS NULL', user_id)
            return [dict(r) for r in rows]

    async def create_project(self, user_id: str, name: str, description: Optional[str]) -> Dict[str, Any]:
        await self.connect()
        async with self.pool.acquire() as conn:
            project_id = str(uuid.uuid4())
            row = await conn.fetchrow(
                'INSERT INTO "Project" (id, "userId", name, description, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, \'draft\', NOW(), NOW()) RETURNING *',
                project_id, user_id, name, description
            )
            
            # Increment quota count
            await conn.execute(
                'UPDATE "QuotaSnapshot" SET "projectsCreated" = "projectsCreated" + 1 WHERE "userId" = $1',
                user_id
            )
            return dict(row)

    async def update_project(self, project_id: str, name: str, description: Optional[str]) -> Optional[Dict[str, Any]]:
        await self.connect()
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'UPDATE "Project" SET name = $1, description = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *',
                name, description, project_id
            )
            return dict(row) if row else None

    async def delete_project(self, project_id: str) -> bool:
        await self.connect()
        async with self.pool.acquire() as conn:
            result = await conn.execute('UPDATE "Project" SET "deletedAt" = NOW() WHERE id = $1', project_id)
            return "UPDATE 1" in result

    # --- Quota and Usage Tracking ---
    async def check_quota(self, user_id: str) -> Dict[str, Any]:
        await self.connect()
        async with self.pool.acquire() as conn:
            quota = await conn.fetchrow(
                'SELECT q.*, p."aiTokensPerMonth", p."maxProjects" FROM "QuotaSnapshot" q JOIN "User" u ON q."userId" = u.id JOIN "SubscriptionPlan" p ON u."planId" = p.id WHERE q."userId" = $1',
                user_id
            )
            if not quota:
                return {"allowed": False, "reason": "No quota snapshots found"}
            
            if quota["tokensConsumed"] >= quota["aiTokensPerMonth"]:
                return {"allowed": False, "reason": "AI Generation token limits reached for current billing cycle"}
            
            return {"allowed": True, "quota": dict(quota)}

    async def record_usage(self, user_id: str, tokens_cost: int, action: str, latency: int):
        await self.connect()
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                # Insert audit usage log
                await conn.execute(
                    'INSERT INTO "UsageRecord" (id, "userId", "tokenCost", "actionType", "promptLength", "latencyMs", "createdAt") VALUES ($1, $2, $3, $4, 0, $5, NOW())',
                    str(uuid.uuid4()), user_id, tokens_cost, action, latency
                )
                # Increment quota consumption
                await conn.execute(
                    'UPDATE "QuotaSnapshot" SET "tokensConsumed" = "tokensConsumed" + $1 WHERE "userId" = $2',
                    tokens_cost, user_id
                )

    # --- Schema & Version Tracking ---
    async def save_schema_version(self, project_id: str, schema_payload: Dict[str, Any], created_by: str = "ai") -> Dict[str, Any]:
        await self.connect()
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                # Ensure project exists
                proj = await conn.fetchrow('SELECT id FROM "Project" WHERE id = $1', project_id)
                if not proj:
                    user_row = await conn.fetchrow('SELECT id FROM "User" LIMIT 1')
                    if user_row:
                        await conn.execute(
                            'INSERT INTO "Project" (id, "userId", name, description, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
                            project_id, user_row["id"], "Demo Project", "Automatically created demo project", "draft"
                        )
                schema_id = str(uuid.uuid4())
                await conn.execute(
                    'INSERT INTO "WebsiteSchema" (id, "siteId", "schemaVersion", payload, "createdAt") VALUES ($1, $2, $3, $4, NOW())',
                    schema_id, uuid.UUID(schema_payload.get("siteId", str(uuid.uuid4()))), "1.0", json.dumps(schema_payload)
                )

                # Get latest version number
                latest_ver = await conn.fetchval(
                    'SELECT COALESCE(MAX("versionNumber"), 0) FROM "ProjectVersion" WHERE "projectId" = $1',
                    project_id
                )
                new_version = latest_ver + 1

                version_row = await conn.fetchrow(
                    'INSERT INTO "ProjectVersion" (id, "projectId", "versionNumber", "schemaId", "createdBy", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
                    str(uuid.uuid4()), project_id, new_version, schema_id, created_by
                )
                return dict(version_row)

    async def get_latest_project_schema(self, project_id: str) -> Optional[Dict[str, Any]]:
        await self.connect()
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'SELECT s.payload FROM "ProjectVersion" v JOIN "WebsiteSchema" s ON v."schemaId" = s.id WHERE v."projectId" = $1 ORDER BY v."versionNumber" DESC LIMIT 1',
                project_id
            )
            return json.loads(row["payload"]) if row else None

    # --- Published Sites & Domains ---
    async def publish_site(self, project_id: str, subdomain: str, cf_url: str, s3_prefix: str) -> Dict[str, Any]:
        await self.connect()
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'INSERT INTO "PublishedSite" (id, "projectId", subdomain, "cfPageUrl", "s3Prefix", status, "createdAt", "updatedAt") '
                'VALUES ($1, $2, $3, $4, $5, \'active\', NOW(), NOW()) '
                'ON CONFLICT (subdomain) DO UPDATE SET "cfPageUrl" = EXCLUDED."cfPageUrl", "updatedAt" = NOW() RETURNING *',
                str(uuid.uuid4()), project_id, subdomain, cf_url, s3_prefix
            )
            return dict(row)

    async def add_custom_domain(self, project_id: str, published_site_id: str, domain_name: str) -> Dict[str, Any]:
        await self.connect()
        async with self.pool.acquire() as conn:
            domain_id = str(uuid.uuid4())
            verification_token = f"qevora-verification-token-{uuid.uuid4().hex[:12]}"
            row = await conn.fetchrow(
                'INSERT INTO "CustomDomain" (id, "projectId", "publishedSiteId", "domainName", "verificationTxt", "isVerified", "sslStatus", "createdAt", "updatedAt") '
                'VALUES ($1, $2, $3, $4, $5, false, \'pending\', NOW(), NOW()) RETURNING *',
                domain_id, project_id, published_site_id, domain_name, verification_token
            )
            return dict(row)

    async def get_project_versions(self, project_id: str) -> List[Dict[str, Any]]:
        await self.connect()
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                'SELECT "versionNumber", "createdBy", "createdAt" FROM "ProjectVersion" WHERE "projectId" = $1 ORDER BY "versionNumber" DESC',
                project_id
            )
            return [dict(r) for r in rows]

    async def get_project_schema_by_version(self, project_id: str, version_number: int) -> Optional[Dict[str, Any]]:
        await self.connect()
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                'SELECT s.payload FROM "ProjectVersion" v JOIN "WebsiteSchema" s ON v."schemaId" = s.id WHERE v."projectId" = $1 AND v."versionNumber" = $2',
                project_id, version_number
            )
            return json.loads(row["payload"]) if row else None

db_manager = DatabaseManager()
import uuid # Imported inside for safe scope usage

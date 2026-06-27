# Qevora Production Architecture & Deployment Guide

This guide details the system architecture, API specifications, and cloud deployment procedures for Qevora.

---

## 1. System Architecture

The following diagram illustrates the monorepo architecture, including the API Gateway, Redis Queue, Background Worker, PostgreSQL database, and compiler components.

```mermaid
graph TD
    Client[Next.js Client App] -->|HTTPS Requests| API[FastAPI API Gateway]
    Client -->|Event Stream| SSE[SSE Generation Stream]
    
    API -->|Read/Write Session & Cache| Redis[(Redis Server)]
    API -->|Enqueue Heavy Tasks| Redis
    API -->|Audit Logs / Versioning| DB[(PostgreSQL Database)]
    
    Worker[Python Background Worker] -->|BLPOP Tasks| Redis
    Worker -->|Fetch site schema| DB
    Worker -->|Execute compile-cli.js| Compiler[Node.js Static Compiler]
    Worker -->|Dispatch Transactional Emails| SMTP[SMTP Relay Server / Mailhog]
    
    Compiler -->|Validate against SiteSchema| CSS[CSS Hashing & Purging]
    Compiler -->|Output Assets| LocalFS[Cloud Storage Prefix]
```

---

## 2. API Endpoint Specification

### Authentication
* **`POST /auth/signup`**
  * **Description**: Create new account, set access/refresh HTTP-Only cookies, and queue onboarding emails.
  * **Payload**: `{"email": "user@domain.com", "fullName": "Full Name", "password": "password123"}`
* **`POST /auth/login`**
  * **Description**: Validate credentials and issue HTTP-only cookies.
  * **Payload**: `{"email": "user@domain.com", "password": "password123"}`
* **`POST /auth/refresh`**
  * **Description**: Refresh access token cookie using active refresh token.
* **`POST /auth/logout`**
  * **Description**: Clear cookies and purge session from Redis.

### Project & Canvas Operations
* **`GET /projects`**: List current user's projects.
* **`POST /projects`**: Create draft project.
* **`GET /projects/{project_id}/schema`**: Fetch latest layout schema with Redis caching layer.
* **`POST /projects/{project_id}/schema`**: Persist new version layout.

### AI Generation & Publishing (Queued)
* **`POST /projects/{project_id}/generate`**
  * **Description**: Queue a new prompt-based generation task.
  * **Returns**: `{"success": true, "taskId": "gen-xxxx"}`
* **`POST /projects/{project_id}/publish`**
  * **Description**: Queue a production static compile task.
  * **Returns**: `{"success": true, "taskId": "pub-xxxx"}`
* **`GET /tasks/{task_id}`**
  * **Description**: Retrieve current state of background operations (returns pending, completed, or failed).

---

## 3. Production Deployment Guide

### Deployment Checklist

1. **Environment Variables Config (`.env`)**:
   ```ini
   ENV=production
   DATABASE_URL=postgresql://db_user:secure_pwd@qevora-db.postgres.database.azure.com:5432/qevora
   REDIS_URL=rediss://default:redis_secure_pwd@qevora-redis.cache.windows.net:6380/0
   JWT_SECRET=YOUR_SECURE_JWT_SECRET_STRING_32_BYTES_OR_MORE
   ANTHROPIC_API_KEY=sk-ant-xxx
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxx
   CORS_ORIGINS=https://qevora.com,https://app.qevora.com
   ```

2. **Docker Orchestration Commands**:
   * Build and run the entire production cluster:
     ```bash
     docker-compose -f docker-compose.prod.yml up --build -d
     ```
   * View live health status:
     ```bash
     docker-compose -f docker-compose.prod.yml ps
     ```

3. **Background Worker Monitoring**:
   * Read background runner logs:
     ```bash
     docker logs qevora-worker -f --tail=100
     ```
   * Monitor Redis task list lengths:
     ```bash
     docker exec -it qevora-redis redis-cli LLEN queue:default
     ```

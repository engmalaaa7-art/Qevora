import pytest
import sys
import os
import json
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

# Add parent directory to path so imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set test environment variables
os.environ["ENV"] = "testing"
os.environ["JWT_SECRET"] = "testing_secret_key_minimum_32_bytes_long"
os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"

# Mock db_manager and redis_manager BEFORE importing main
mock_db = MagicMock()
mock_db.pool = MagicMock()
mock_db.connect = AsyncMock()
mock_db.disconnect = AsyncMock()
mock_db.get_user_by_email = AsyncMock()
mock_db.get_user_by_id = AsyncMock()
mock_db.create_user = AsyncMock()
mock_db.check_quota = AsyncMock()
mock_db.create_project = MagicMock() # Changed to MagicMock to support sync wrapper
mock_db.create_project = AsyncMock()
mock_db.get_user_projects = AsyncMock()
mock_db.update_project = AsyncMock()
mock_db.delete_project = AsyncMock()
mock_db.get_latest_project_schema = AsyncMock()
mock_db.save_schema_version = AsyncMock()
mock_db.add_custom_domain = AsyncMock()
mock_db.publish_site = AsyncMock()

mock_redis = MagicMock()
mock_redis.connect = MagicMock()
mock_redis.disconnect = MagicMock()
mock_redis.client = MagicMock()
mock_redis.store_session = MagicMock()
mock_redis.verify_session = MagicMock()
mock_redis.delete_session = MagicMock()
mock_redis.set_cache = MagicMock()
mock_redis.get_cache = MagicMock()
mock_redis.invalidate_cache = MagicMock()
mock_redis.check_rate_limit = MagicMock(return_value=(True, 59))
mock_redis.push_task = MagicMock()
mock_redis.pop_task = MagicMock()

with patch('database.db_manager', mock_db), patch('redis_manager.redis_manager', mock_redis):
    from main import app, create_access_token

from fastapi.testclient import TestClient
client = TestClient(app)

def test_health_endpoint():
    mock_db.pool = MagicMock()
    mock_db.pool.is_closing.return_value = False
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "OK"
    assert response.json()["database"] == "CONNECTED"

def test_liveness_endpoint():
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json()["status"] == "alive"

@pytest.mark.asyncio
async def test_readiness_endpoint():
    mock_db.pool = MagicMock()
    mock_db.pool.acquire = MagicMock()
    
    # Mock connection execute SELECT 1
    mock_conn = AsyncMock()
    mock_db.pool.acquire.return_value.__aenter__.return_value = mock_conn
    mock_conn.execute = AsyncMock()
    
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"

def test_get_task_status_pending():
    client.cookies.clear()
    token = create_access_token("user-123")
    mock_redis.verify_session.return_value = "user-123"
    mock_redis.get_cache.return_value = None
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/tasks/task-123", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "pending"

def test_get_task_status_completed():
    client.cookies.clear()
    token = create_access_token("user-123")
    mock_redis.verify_session.return_value = "user-123"
    mock_redis.get_cache.return_value = {"status": "completed", "url": "https://site.com"}
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/tasks/task-123", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "completed"

def test_signup_user():
    client.cookies.clear()
    mock_db.get_user_by_email.return_value = None
    mock_db.create_user.return_value = {
        "id": "user-123",
        "email": "test@qevora.com",
        "fullName": "Test User"
    }
    
    payload = {
        "email": "test@qevora.com",
        "fullName": "Test User",
        "password": "strongpassword123"
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["userId"] == "user-123"

def test_signup_existing_email():
    client.cookies.clear()
    mock_db.get_user_by_email.return_value = {"id": "existing-123"}
    payload = {
        "email": "test@qevora.com",
        "fullName": "Test User",
        "password": "strongpassword123"
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email is already registered"

def test_login_invalid_user():
    client.cookies.clear()
    mock_db.get_user_by_email.return_value = None
    payload = {
        "email": "nonexistent@qevora.com",
        "password": "password"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401

def test_create_project_unauthorized():
    client.cookies.clear()
    payload = {
        "name": "My New Site",
        "description": "Bilingual landing page"
    }
    response = client.post("/projects", json=payload)
    assert response.status_code == 401

def test_create_project_authorized():
    client.cookies.clear()
    token = create_access_token("user-123")
    mock_redis.verify_session.return_value = "user-123"
    mock_db.check_quota.return_value = {
        "allowed": True,
        "quota": {
            "projectsCreated": 0,
            "maxProjects": 5
        }
    }
    mock_db.create_project.return_value = {
        "id": "proj-123",
        "userId": "user-123",
        "name": "My New Site",
        "description": "Desc",
        "status": "draft",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "My New Site",
        "description": "Desc"
    }
    response = client.post("/projects", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == "proj-123"

def test_generate_site_queued():
    client.cookies.clear()
    token = create_access_token("user-123")
    mock_redis.verify_session.return_value = "user-123"
    mock_redis.get_cache.return_value = None # No cache hit
    mock_db.check_quota.return_value = {"allowed": True}
    
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "projectId": "proj-123",
        "prompt": "Create an elegant real estate website in Arabic and English"
    }
    response = client.post("/projects/proj-123/generate", json=payload, headers=headers)
    assert response.status_code == 200
    assert "taskId" in response.json()
    assert "queued" in response.json()["message"]

def test_publish_site_queued():
    client.cookies.clear()
    token = create_access_token("user-123")
    mock_redis.verify_session.return_value = "user-123"
    mock_db.get_latest_project_schema.return_value = {"siteId": "site-123"}
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/projects/proj-123/publish", headers=headers)
    assert response.status_code == 200
    assert "taskId" in response.json()
    assert "queued" in response.json()["message"]

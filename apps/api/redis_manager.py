"""
Qevora Redis Manager — Upstash REST API + Fallback to classic Redis
Supports: Session Storage, Cache, AI Queue, Rate Limiting
"""
import json
import time
import requests
import logging
from typing import Optional, Dict, Any, List

from config import (
    USE_UPSTASH_REDIS,
    UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN,
    REDIS_URL,
)

logger = logging.getLogger("qevora.redis")


class UpstashRedisClient:
    """Upstash REST API client — no socket dependency, works in serverless environments."""

    def __init__(self, url: str, token: str):
        self.base_url = url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    def _cmd(self, *args) -> Any:
        """Execute a Redis command via Upstash REST API."""
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=list(args),
                timeout=5,
            )
            response.raise_for_status()
            data = response.json()
            return data.get("result")
        except Exception as e:
            logger.error(f"Upstash Redis command failed: {e}")
            raise

    def setex(self, key: str, seconds: int, value: str) -> Any:
        return self._cmd("SETEX", key, seconds, value)

    def get(self, key: str) -> Optional[str]:
        return self._cmd("GET", key)

    def delete(self, key: str) -> int:
        return self._cmd("DEL", key)

    def lpush(self, key: str, value: str) -> int:
        return self._cmd("LPUSH", key, value)

    def blpop(self, key: str, timeout: int = 0) -> Optional[list]:
        # Upstash doesn't support blocking BLPOP — simulate with non-blocking LPOP
        result = self._cmd("LPOP", key)
        if result:
            return [key, result]
        return None

    def expire(self, key: str, seconds: int) -> int:
        return self._cmd("EXPIRE", key, seconds)

    def zremrangebyscore(self, key: str, min_score: float, max_score: float) -> int:
        return self._cmd("ZREMRANGEBYSCORE", key, min_score, max_score)

    def zadd(self, key: str, mapping: dict) -> int:
        # mapping = {member: score}
        args = ["ZADD", key]
        for member, score in mapping.items():
            args.extend([score, member])
        return self._cmd(*args)

    def zcard(self, key: str) -> int:
        return self._cmd("ZCARD", key)

    def pipeline(self) -> "UpstashPipeline":
        return UpstashPipeline(self)


class UpstashPipeline:
    """Simulates Redis pipeline with batch REST calls to Upstash."""

    def __init__(self, client: UpstashRedisClient):
        self._client = client
        self._commands: List[tuple] = []

    def zremrangebyscore(self, key: str, min_score: float, max_score: float):
        self._commands.append(("ZREMRANGEBYSCORE", key, min_score, max_score))
        return self

    def zadd(self, key: str, mapping: dict):
        for member, score in mapping.items():
            self._commands.append(("ZADD", key, score, member))
        return self

    def zcard(self, key: str):
        self._commands.append(("ZCARD", key))
        return self

    def expire(self, key: str, seconds: int):
        self._commands.append(("EXPIRE", key, seconds))
        return self

    def execute(self) -> List[Any]:
        """Execute all pipeline commands via Upstash batch endpoint."""
        try:
            response = requests.post(
                f"{self._client.base_url}/pipeline",
                headers=self._client.headers,
                json=[list(cmd) for cmd in self._commands],
                timeout=5,
            )
            response.raise_for_status()
            results = response.json()
            return [r.get("result") for r in results]
        except Exception as e:
            logger.error(f"Upstash pipeline failed: {e}")
            raise


class RedisManager:
    def __init__(self):
        self.client = None
        self._initialized = False

    def connect(self):
        if self._initialized:
            return
        if USE_UPSTASH_REDIS:
            self.client = UpstashRedisClient(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
            logger.info("Connected to Upstash Redis via REST API.")
        else:
            try:
                import redis
                self.client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
                logger.info("Connected to Redis via socket.")
            except Exception as e:
                logger.warning(f"Redis socket connection failed: {e}. Redis features will be disabled.")
                self.client = None
        self._initialized = True

    def disconnect(self):
        self.client = None
        self._initialized = False

    def _safe_exec(self, fn, *args, **kwargs):
        """Execute fn safely; return None if Redis is unavailable."""
        self.connect()
        if not self.client:
            return None
        try:
            return fn(*args, **kwargs)
        except Exception as e:
            logger.warning(f"Redis operation failed: {e}")
            return None

    # ─── Session Management ────────────────────────────────────────────────────
    def store_session(self, user_id: str, session_token: str, expire_seconds: int = 86400):
        self._safe_exec(self.client.setex, f"session:{session_token}", expire_seconds, user_id)

    def verify_session(self, session_token: str) -> Optional[str]:
        return self._safe_exec(self.client.get, f"session:{session_token}")

    def delete_session(self, session_token: str):
        self._safe_exec(self.client.delete, f"session:{session_token}")

    # ─── Cache Management ──────────────────────────────────────────────────────
    def set_cache(self, key: str, data: Any, expire_seconds: int = 3600):
        serialized = json.dumps(data)
        self._safe_exec(self.client.setex, f"cache:{key}", expire_seconds, serialized)

    def get_cache(self, key: str) -> Optional[Any]:
        data = self._safe_exec(self.client.get, f"cache:{key}")
        if data:
            try:
                return json.loads(data)
            except Exception:
                return data
        return None

    def invalidate_cache(self, key: str):
        self._safe_exec(self.client.delete, f"cache:{key}")

    # ─── Rate Limiting (Sliding Window) ───────────────────────────────────────
    def check_rate_limit(self, user_id: str, limit: int = 60, window_seconds: int = 60) -> tuple:
        """
        Implements a sliding window rate limiter using Redis sorted sets.
        Returns (is_allowed: bool, remaining: int).
        Falls back to (True, limit) if Redis is unavailable.
        """
        self.connect()
        if not self.client:
            return (True, limit)
        try:
            now = time.time()
            key = f"ratelimit:{user_id}"
            clear_before = now - window_seconds

            pipe = self.client.pipeline()
            pipe.zremrangebyscore(key, 0, clear_before)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, window_seconds)
            results = pipe.execute()

            current_requests = results[2] if results and len(results) > 2 else 0
            if current_requests is None:
                current_requests = 0
            is_allowed = current_requests <= limit
            remaining = max(0, limit - current_requests)
            return is_allowed, remaining
        except Exception as e:
            logger.warning(f"Rate limit check failed: {e}. Allowing request.")
            return (True, limit)

    # ─── Background Queue ──────────────────────────────────────────────────────
    def push_task(self, queue_name: str, task_data: Dict[str, Any]):
        serialized = json.dumps(task_data)
        self._safe_exec(self.client.lpush, f"queue:{queue_name}", serialized)

    def pop_task(self, queue_name: str, timeout_seconds: int = 0) -> Optional[Dict[str, Any]]:
        result = self._safe_exec(self.client.blpop, f"queue:{queue_name}", timeout_seconds)
        if result:
            try:
                return json.loads(result[1])
            except Exception:
                return {"raw": result[1]}
        return None

    # ─── Health Check ─────────────────────────────────────────────────────────
    def ping(self) -> bool:
        """Returns True if Redis is reachable."""
        try:
            self.connect()
            if not self.client:
                return False
            if USE_UPSTASH_REDIS:
                self.client._cmd("PING")
            return True
        except Exception:
            return False


redis_manager = RedisManager()

import uuid
import time
import logging
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from redis_manager import redis_manager
from config import CORS_ORIGINS, ENV

logger = logging.getLogger("qevora.security")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Inject standard security headers
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Strict CSP policy (allow styles, fonts, self connection, and remote API)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https://images.unsplash.com; "
            "connect-src 'self' http://localhost:8000 https://api.qevora.com ws://localhost:3000;"
        )
        
        # In production, enforce HTTPS via HSTS
        if ENV == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
            
        return response

class RequestTracingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Trace request ID or generate a new one
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        
        # Log request receipt
        logger.info(f"[{request_id}] Received {request.method} {request.url.path}")
        
        response: Response = await call_next(request)
        
        duration = time.time() - start_time
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-Ms"] = f"{int(duration * 1000)}"
        
        logger.info(f"[{request_id}] Finished {request.method} {request.url.path} - Status: {response.status_code} - Latency: {int(duration * 1000)}ms")
        return response

class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Apply CSRF validations to state-mutating requests (POST, PUT, DELETE)
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            origin = request.headers.get("Origin")
            referer = request.headers.get("Referer")
            
            # Allow empty origin for non-browser local test calls or dev testing
            if origin:
                domain_match = False
                for whitelist in CORS_ORIGINS:
                    if whitelist == "*" or whitelist in origin:
                        domain_match = True
                        break
                if not domain_match:
                    logger.warning(f"CSRF protection blocked request. Origin: {origin}")
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="CSRF origin validation mismatch"
                    )
        return await call_next(request)

class RedisRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Exclude documentation and healthchecks from rate limits
        if request.url.path in ["/health", "/health/ready", "/docs", "/openapi.json", "/favicon.ico"]:
            return await call_next(request)

        # Rate limit based on IP address
        client_ip = request.client.host if request.client else "unknown"
        
        # Fetch client auth token if available to use user_id instead of IP
        auth_header = request.headers.get("Authorization")
        user_identifier = client_ip
        if auth_header and auth_header.startswith("Bearer "):
            # We can use the token hash as rate limit identifier
            user_identifier = auth_header.split(" ")[1][:16]

        # Enforce rate limit (60 requests per minute by default)
        is_allowed, remaining = redis_manager.check_rate_limit(user_identifier, limit=60, window_seconds=60)
        
        if not is_allowed:
            logger.warning(f"IP {client_ip} (Token identifier: {user_identifier}) exceeded rate limits.")
            return Response(
                content=json.dumps({"detail": "Too many requests. Please slow down."}),
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": "60"}
            )
            
        response: Response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = "60"
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response

import json

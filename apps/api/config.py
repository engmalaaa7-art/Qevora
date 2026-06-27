import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Setup logger for startup configuration validation
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("qevora.config")

ENV = os.getenv("ENV", "development")

# Database URL — Neon PostgreSQL in production
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/qevora"
)

# Redis — Upstash REST API in production, classic Redis URL in dev
UPSTASH_REDIS_REST_URL = os.getenv("UPSTASH_REDIS_REST_URL", "")
UPSTASH_REDIS_REST_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Determine if we are using Upstash (REST) or classic Redis
USE_UPSTASH_REDIS = bool(UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN)

# AI Provider
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://router.bynara.id")

# Cloudinary
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

# Auth Secrets & Config
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_qevora_key_123")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Unsplash Integration
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")

# SMTP Configuration
SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
SMTP_PORT = int(os.getenv("SMTP_PORT", "1025"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@qevora.com")

# CORS settings
CORS_ORIGINS = [orig.strip() for orig in os.getenv("CORS_ORIGINS", "*").split(",") if orig.strip()]

# Production Secret Strength Verification
if ENV == "production":
    if JWT_SECRET == "super_secret_qevora_key_123":
        logger.error("CRITICAL SECURITY ALERT: Default JWT_SECRET detected in production environment! System will halt.")
        raise ValueError("Production requires a strong, unique, environment-defined JWT_SECRET")

    if not ANTHROPIC_API_KEY:
        logger.warning("PROD WARNING: ANTHROPIC_API_KEY is empty. AI generation features will fail.")

    if not USE_UPSTASH_REDIS:
        logger.warning("PROD WARNING: Upstash Redis not configured. Falling back to local Redis.")

    if not CLOUDINARY_CLOUD_NAME:
        logger.warning("PROD WARNING: Cloudinary not configured. Image uploads will fail.")

    if not SMTP_USER or not SMTP_PASS:
        logger.warning("PROD WARNING: SMTP credentials are not configured. Transactional email sending will be disabled.")
else:
    logger.info("Configuration validated for Qevora under development mode.")

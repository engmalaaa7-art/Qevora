# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0-rc.1] - 2026-06-27

### Features
- **AI-Powered Website Generation:** Complete engine to generate website schemas dynamically from natural language.
- **Bilingual Support:** Core architecture natively supports English and Arabic (LTR/RTL context switching).
- **Authentication:** JWT-based secure authentication pipeline with access/refresh tokens.
- **User Dashboard & Project Management:** Fully functional multi-project workspace support.
- **Visual Editor Interface:** Comprehensive editor for manipulating and previewing generated interfaces.
- **Template System:** Extensive 200+ curated templates with categorized browsing.

### Architecture
- **Monorepo Implementation:** Transitioned to Turborepo spanning `apps` and `packages`.
- **Zod Schemas as Source of Truth:** Unifying validation boundaries between Frontend (TypeScript) and Backend (Python).
- **Decoupled Renderer:** `@qevora/renderer` established as a standalone package to translate JSON schemas into React AST.

### Frontend (Next.js)
- Implemented robust `app` router structure.
- Pre-rendered static landing, pricing, and template pages for peak SEO and performance.
- Integrated Tailwind CSS with a strict `@qevora/design-system` package.

### Backend (FastAPI)
- Established async Python microservice architecture.
- Integrated PostgreSQL via Prisma and Redis caching via Upstash.
- Cloudinary asset management integration.
- SSE Streaming implemented for real-time AI generation status reporting.

### AI Engine
- Dynamic multi-model routing capability (Anthropic Claude 3.5, Mistral).
- Resilient 3-pass self-repair mechanism ensuring strict JSON compliance.

### Deployment Readiness
- Strict environment configurations standardized across the entire workspace (`.env.example`).
- Sensitive values expunged; ready for 1-click deployments on Vercel and Docker-compatible hosts.

### Known Limitations
- Internal deprecation warnings in FastAPI regarding `datetime.utcnow()` remain and require migration to timezone-aware UTC objects.
- High-traffic AI loads may experience transient provider timeouts until enterprise API tiers are unlocked.

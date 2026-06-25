# Qevora — System Architecture
**Version:** 1.0 | **Date:** 2026-06-25 | **Status:** Draft

---

## 1. High-Level Architecture

Qevora is composed of five logical tiers:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT TIER                          │
│         Next.js Web App (Browser)                       │
│   Landing · Auth · Dashboard · Editor · Preview         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS / WebSocket
┌───────────────────────▼─────────────────────────────────┐
│                   API GATEWAY TIER                      │
│              (AWS API Gateway + WAF)                    │
│         REST endpoints · WebSocket channels             │
└──────┬──────────────────────────┬───────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│  APP TIER   │          │   AI ORCH TIER  │
│  (Node.js   │◄────────►│  (Python)       │
│   Services) │          │  Claude · Jobs  │
└──────┬──────┘          └────────┬────────┘
       │                          │
┌──────▼──────────────────────────▼───────────────────────┐
│                    DATA TIER                            │
│   PostgreSQL · Redis · S3 (assets) · S3 (published)    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. System Components

### 2.1 Frontend — Next.js Application

| Component | Responsibility |
|---|---|
| Landing Page | Marketing, pricing, CTA |
| Auth Module | Sign in / sign up / OAuth flows |
| Dashboard | Project list, new project creation |
| Template Gallery | Browse and select templates |
| Prompt Input | Capture user description + file uploads |
| Generation Screen | Real-time progress display via WebSocket |
| Editor Dashboard | Three-panel layout (Chat / Preview / Code) |
| Component Renderer | Client-side JSON → HTML renderer (React) |
| Code Viewer | Read-only syntax-highlighted code display |
| Publish Modal | Subdomain selection + domain configuration |
| Account Settings | Profile, billing, plan management |

---

### 2.2 Backend — Application Services (Node.js)

All services are stateless and independently deployable. Communication between services is via internal REST or a message queue.

| Service | Responsibility |
|---|---|
| **Auth Service** | JWT issuance, OAuth flows (Google, GitHub, Apple), session management |
| **Project Service** | CRUD for projects, metadata, state management |
| **Generation Service** | Accepts generation requests, enqueues jobs, streams status back |
| **Chat Service** | Receives chat messages, sends to AI orchestration, applies diffs |
| **Asset Service** | Manages image uploads, stock image library queries |
| **Publish Service** | Triggers rendering pipeline, uploads to S3, manages CDN invalidation |
| **Domain Service** | Custom domain verification, SSL provisioning via AWS ACM |
| **Billing Service** | Plan enforcement, usage tracking, Stripe integration (post-MVP) |

---

### 2.3 AI Orchestration Layer (Python)

A dedicated Python service handles all AI interactions. Node.js services call this layer via internal API — they never call Claude directly.

| Component | Responsibility |
|---|---|
| **Prompt Builder** | Assembles context-aware prompts from project schema + user message |
| **Generation Orchestrator** | Runs the multi-step generation pipeline (analyze → plan → content → layout → code) |
| **Edit Orchestrator** | Handles single-turn and multi-turn chat edits, returns JSON diffs |
| **Schema Validator** | Validates AI output against the JSON Site Schema before returning |
| **Retry Handler** | If Claude returns invalid JSON, retries with a correction prompt (max 3 attempts) |
| **RTL Processor** | Post-processes schema to enforce RTL flags when language is Arabic |
| **Stock Image Resolver** | Maps content context (e.g., "restaurant hero") to curated stock image URLs |

---

### 2.4 Component Renderer

The renderer is a shared library used in two contexts:

| Context | Usage |
|---|---|
| **Browser (Preview)** | React-based renderer runs client-side, receives JSON schema, renders live preview |
| **Server (Publish)** | Node.js server-side renderer converts JSON schema to static HTML/CSS/JS files for CDN upload |

The renderer owns all visual output. It handles:
- Component library (Hero, Navbar, Features, Testimonials, CTA, Footer, Product Grid, Cart, Contact Form, etc.)
- Design token application (colors, typography, spacing)
- RTL / LTR direction based on schema `language` field
- Mobile-responsive layouts
- Arabic font loading (Cairo, Tajawal) vs. Latin fonts (Inter, Plus Jakarta Sans)

---

### 2.5 Data Stores

| Store | Technology | Purpose |
|---|---|---|
| **Primary Database** | PostgreSQL (AWS RDS) | Users, projects, project versions, domains, billing |
| **Cache** | Redis (AWS ElastiCache) | Session tokens, generation job status, rate limiting |
| **Asset Storage** | AWS S3 (private bucket) | User-uploaded images, generated JSON schemas, stock image index |
| **Published Sites** | AWS S3 (public bucket) | Rendered static files for all published websites |
| **Job Queue** | AWS SQS | Generation job queue, publish job queue |
| **CDN** | AWS CloudFront | Serves published websites globally with low latency |

---

### 2.6 Infrastructure Services

| Service | Provider | Purpose |
|---|---|---|
| DNS | AWS Route 53 | Wildcard `*.qevora.site` CNAME to CloudFront |
| SSL — Platform | AWS ACM | Certificate for `*.qevora.site` |
| SSL — Custom Domains | AWS ACM (per-domain) | Provisioned automatically after DNS verification |
| Email | AWS SES | Transactional emails (verification, password reset, publish confirmation) |
| Secrets | AWS Secrets Manager | API keys, DB credentials, Claude API key |
| Monitoring | AWS CloudWatch + Datadog | Logs, metrics, alerts |
| CI/CD | GitHub Actions | Automated test, build, and deploy pipelines |

---

## 3. Request Flow

### Standard API Request

```
Browser
  → API Gateway (auth check, rate limit)
    → Load Balancer
      → App Service (Node.js)
        → PostgreSQL / Redis / S3
          → Response
```

### WebSocket (Generation / Edit Progress)

```
Browser opens WebSocket connection
  → API Gateway WebSocket
    → Connection ID stored in Redis
      → Job queued in SQS
        → AI Orchestration picks up job
          → Streams progress events back via WebSocket connection ID
            → Browser receives real-time status updates
```

---

## 4. Generation Flow

```
User submits prompt
  │
  ▼
Generation Service
  → Creates project record (state: GENERATING)
  → Enqueues job in SQS
  → Returns job ID to browser
  │
  ▼
AI Orchestration Service picks up job
  │
  ├─ Step 1: ANALYZING
  │    Prompt Builder assembles: system prompt + user prompt + template context
  │    Claude analyzes intent, language, industry, required pages
  │    Output: structured intent object
  │
  ├─ Step 2: PLANNING_STRUCTURE
  │    Claude generates page list and section outline
  │    Output: pages[] with section types per page
  │
  ├─ Step 3: GENERATING_CONTENT
  │    Claude generates all copy, headings, descriptions
  │    Respects detected language (Arabic RTL / English LTR)
  │    Output: content fills sections
  │
  ├─ Step 4: DESIGNING_LAYOUT
  │    Claude selects design tokens: colors, fonts, spacing scale
  │    Output: designTokens object added to schema
  │
  ├─ Step 5: RESOLVING_IMAGES
  │    Stock Image Resolver maps each section to a stock image URL
  │    Output: imageUrl added to each relevant section
  │
  ├─ Step 6: ASSEMBLING_SCHEMA
  │    All outputs merged into a single JSON Site Schema document
  │    Schema Validator checks structure
  │    If invalid → Retry Handler sends correction prompt to Claude
  │
  ├─ Step 7: FINALIZING
  │    RTL Processor enforces direction flags for Arabic content
  │    Schema stored in S3 (assets bucket)
  │    Project state updated to READY
  │
  └─ WebSocket event sent to browser: generation complete
       Browser loads schema → Component Renderer → Live Preview
```

---

## 5. Rendering Pipeline

The Component Renderer converts a JSON Site Schema into visual output. It operates in two modes:

### 5.1 Preview Mode (Client-Side, Real-Time)

```
JSON Site Schema
  → React Component Renderer (browser)
    → Selects component per section type
    → Applies design tokens (CSS custom properties)
    → Sets dir="rtl" or dir="ltr" on root element
    → Loads appropriate font (Cairo for Arabic, Inter for English)
    → Renders full page tree in iframe
      → User sees live preview
```

**Latency target:** < 500ms from schema update to visible preview change.

### 5.2 Publish Mode (Server-Side, Static Output)

```
JSON Site Schema
  → Server-Side Renderer (Node.js)
    → Renders each page to complete HTML string
    → Extracts all CSS to a single stylesheet
    → Extracts all JS to a single script file
    → Generates sitemap.xml and robots.txt
    → Output: folder of static files (index.html, about.html, style.css, script.js, ...)
      → Passed to Publishing Pipeline
```

---

## 6. Publishing Pipeline

```
User clicks Publish
  │
  ▼
Publish Service
  → Validates project is in READY or EDITING state
  → Creates publish job in SQS
  → Updates project state to PUBLISHING
  │
  ▼
Publish Worker picks up job
  │
  ├─ Fetch JSON schema from S3 (assets bucket)
  ├─ Run Server-Side Renderer → generate static file set
  ├─ Upload files to S3 staging prefix:
  │    s3://qevora-sites/staging/{projectId}/...
  ├─ Validate upload integrity (all files present)
  ├─ Atomic copy: staging prefix → live prefix:
  │    s3://qevora-sites/live/{subdomain}/...
  ├─ Trigger CloudFront cache invalidation for /{subdomain}/*
  ├─ Update project record: state = PUBLISHED, publishedUrl = subdomain
  │
  └─ WebSocket event → browser: publish complete + live URL
```

### Subdomain Routing

CloudFront uses a single wildcard distribution for `*.qevora.site`. The origin is the S3 live bucket. CloudFront functions route requests based on the subdomain to the correct S3 prefix:

```
nova.qevora.site → s3://qevora-sites/live/nova/index.html
```

---

## 7. Versioning Strategy

Every time a generation completes or an AI edit is confirmed, a new version snapshot is created.

### Version Object

Each version stores:
- Version number (incremental integer)
- Timestamp
- Trigger (initial generation / chat edit / regeneration)
- The full JSON Site Schema at that point
- The chat message that caused this version (if edit-triggered)

### Storage

Versions are stored as individual JSON files in S3:
```
s3://qevora-assets/{userId}/{projectId}/versions/v1.json
s3://qevora-assets/{userId}/{projectId}/versions/v2.json
s3://qevora-assets/{userId}/{projectId}/versions/current.json  ← symlink to latest
```

### Version Operations (MVP scope)

| Operation | Description |
|---|---|
| Auto-save | New version created after every confirmed AI edit |
| Undo last edit | Revert `current.json` to previous version |
| View history | List all versions with timestamps and triggers |

### Version Operations (Post-MVP)

| Operation | Description |
|---|---|
| Restore version | Set any past version as current |
| Named versions | User labels a version ("Before rebrand") |
| Branch | Fork from a version into a new project |

---

## 8. Preview Architecture

### Challenge

The live preview must:
1. Show the exact final output of the generated website
2. Update in < 500ms after any AI edit
3. Support RTL and bilingual switching
4. Support device viewport switching (desktop / tablet / mobile)
5. Not require file uploads on every edit

### Solution: In-Browser Component Renderer in Sandboxed iframe

```
Editor Dashboard
  │
  ├─ AI Chat Panel
  │    User sends message → Chat Service → AI Orchestration
  │    AI returns JSON diff (changed sections only)
  │    Diff applied to current schema in memory
  │
  └─ Preview Panel
       Hosts a sandboxed iframe
       iframe receives schema updates via postMessage
       Component Renderer inside iframe re-renders on schema change
       Device frame applied by outer panel (CSS viewport simulation)
```

### Why a Sandboxed iframe

- Complete style isolation (no Qevora CSS leaks into preview)
- Security sandbox (generated scripts cannot access platform cookies/storage)
- Accurate viewport simulation for mobile/tablet preview
- Matches exactly what the server-side renderer will produce at publish time

---

## 9. AI Chat Edit Flow

```
User sends message in Chat Panel
  │
  ▼
Chat Service
  → Assembles context package:
      - Current JSON Site Schema (full)
      - Project metadata (name, language, pages)
      - Last 10 chat messages
      - User's new message
  │
  ▼
AI Orchestration — Edit Orchestrator
  → Builds edit prompt: "Given this schema and this instruction, return only the changed JSON properties as a diff object"
  → Sends to Claude
  → Claude returns a partial JSON diff (not the full schema)
  → Schema Validator validates the diff structure
  → Diff is merged into current schema
  → New version snapshot created in S3
  │
  ▼
Response sent back to Chat Service
  → New schema version sent to browser via WebSocket
  → Browser Component Renderer re-renders preview
  → Code Viewer updates to show new rendered code
  → Chat message appended to conversation history
```

**Partial diff strategy** is critical: Claude returns only the changed portions of the schema (not the full document), which keeps response tokens minimal and merge logic clean.

---

## 10. Deployment Architecture

### Environments

| Environment | Purpose |
|---|---|
| `development` | Local developer machines |
| `staging` | Internal QA and testing (mirrors production) |
| `production` | Live platform |

### Compute

All backend services run on **AWS ECS (Fargate)** — serverless containers. No EC2 instances to manage.

| Service | Scaling Strategy |
|---|---|
| Auth, Project, Chat, Asset Services | Horizontal auto-scaling based on CPU/request count |
| Generation Service | Scale-out based on SQS queue depth |
| AI Orchestration Service | Scale-out based on SQS queue depth |
| Publish Service | Scale-out based on SQS queue depth |
| Component Renderer (SSR) | Scale-out based on SQS queue depth |

### CI/CD Pipeline

```
Developer pushes to GitHub
  → GitHub Actions: lint + unit tests
    → On merge to main:
      → Build Docker images
      → Push to AWS ECR
      → Deploy to ECS (blue/green deployment)
      → Run smoke tests against staging
        → On pass: promote to production
```

---

## 11. Recommended Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) | SSR for landing/auth, CSR for editor dashboard |
| **Frontend Language** | TypeScript | Type safety across large codebase |
| **UI Component Base** | Radix UI primitives | Accessible, unstyled — full design control |
| **Styling** | CSS Modules + CSS custom properties | No Tailwind dependency, full RTL control |
| **State Management** | Zustand | Lightweight, sufficient for editor state |
| **WebSocket Client** | native WebSocket API | No library needed for simple pub/sub |
| **Backend Runtime** | Node.js 20 (LTS) | Consistent language with frontend team |
| **Backend Framework** | Fastify | High performance, schema validation built-in |
| **AI Orchestration** | Python 3.12 + FastAPI | Best Anthropic SDK, async-native |
| **AI Client** | Anthropic SDK (Python) | Official Claude client |
| **Job Queue** | AWS SQS + BullMQ (Redis-backed) | SQS for durability, BullMQ for local dev |
| **Primary Database** | PostgreSQL 16 (AWS RDS) | Relational, battle-tested |
| **ORM** | Prisma (Node) / SQLAlchemy (Python) | Type-safe queries |
| **Cache / Sessions** | Redis 7 (AWS ElastiCache) | Fast session store and rate limiter |
| **Object Storage** | AWS S3 | Assets, schemas, published sites |
| **CDN** | AWS CloudFront | Global delivery of published websites |
| **DNS** | AWS Route 53 | Wildcard domain management |
| **Container Orchestration** | AWS ECS Fargate | Serverless containers |
| **Container Registry** | AWS ECR | Docker image storage |
| **CI/CD** | GitHub Actions | Automated pipelines |
| **Monitoring** | AWS CloudWatch + Datadog | Logs, metrics, APM |
| **Error Tracking** | Sentry | Frontend and backend error capture |
| **Email** | AWS SES | Transactional email |
| **Auth Provider** | Auth.js (NextAuth) | OAuth + email/password, session handling |
| **Payments** | Stripe (post-MVP) | Subscription billing |

---

## 12. Risk Register

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| Claude API rate limits during peak generation | High | Medium | SQS queue + exponential backoff + queue depth monitoring |
| Claude returns invalid JSON schema | High | Medium | Schema Validator + Retry Handler (max 3 attempts) + fallback error state |
| Component Renderer and SSR produce different output | High | Low | Single shared renderer codebase; SSR uses same logic as browser renderer |
| CloudFront cache not invalidated after republish | High | Low | Explicit invalidation call in publish pipeline; integration tests verify |
| RTL layout broken for some component types | Medium | Medium | Comprehensive RTL test suite; design tokens enforce directionality |
| S3 atomic copy fails mid-transfer | Medium | Low | Staging prefix strategy ensures live prefix only updated on full success |
| AI edit "rot" over many edits | Medium | Medium | Versioning + undo; partial diff strategy minimizes schema corruption risk |
| SQS job processed twice (duplicate generation) | Medium | Low | Idempotency keys on all job records; project state machine prevents double-processing |

---

## 13. Future Scalability Notes

| Area | Future Consideration |
|---|---|
| **Multi-region** | CloudFront already global; replicate RDS to read replicas in EU/APAC as user base grows |
| **AI model routing** | Add a model router in AI Orchestration to switch between Claude, GPT-4o, Gemini based on task type or cost |
| **Real-time collaboration** | WebSocket infrastructure already in place; add CRDT-based JSON merging for multi-user editing |
| **Visual editor** | JSON schema's structured nature makes a drag-and-drop visual editor a natural future layer on top of the renderer |
| **Plugin system** | Component Renderer can accept custom component plugins; enables a marketplace model |
| **Generated site analytics** | Inject a lightweight analytics script during publish (similar to Google Analytics snippet) |
| **Edge rendering** | CloudFront Functions or Lambda@Edge can handle dynamic personalization on published sites |
| **AI fine-tuning** | Collect schema quality ratings from users; use to fine-tune a domain-specific generation model |

---

*Document maintained by: Antigravity AI*
*Prerequisite for: Task 004 — Database Schema Design*

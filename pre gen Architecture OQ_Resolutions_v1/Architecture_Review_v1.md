# Qevora — Architecture Review & Hardening
**Version:** 1.0 | **Date:** 2026-06-25 | **Task:** 003.5
**Reviews:** System_Architecture_v1.md
**Status:** Critical Review — Pre-Database Design

---

## Executive Summary

System_Architecture_v1 is a solid **target-state architecture** for a funded, fully-staffed team. As an MVP blueprint for a startup — especially a solo or small founding team — it has **three critical problems**:

1. **Over-engineered for MVP:** AWS ECS Fargate + SQS + RDS + ElastiCache + CloudFront is a 6–10 week infrastructure setup before a single line of product code is written. This will kill momentum.
2. **Missing cost control layer entirely:** There is no token tracking, quota enforcement, or abuse prevention. A single user sending 1,000 chat messages will cost hundreds of dollars in Claude API fees.
3. **Template system is underdefined:** Templates are referenced throughout the PRD and architecture but have no system of record. They are currently a gap, not a component.

Eight additional missing components are identified. Nine architectural changes are recommended before database design begins.

**Current architecture score: 6.5 / 10**
**Post-hardening score: 8.5 / 10**

---

## 1. Missing Components

The following systems are referenced implicitly by the architecture but have no defined home, owner, or design.

---

### 1.1 Template Registry ❌ Missing

Templates are the #1 product differentiator for non-AI users. There is no defined system for:
- Storing template source schemas
- Versioning templates as the renderer evolves
- Categorizing and tagging templates
- Associating templates with specific plan tiers
- Previewing templates before selection

**Impact if unresolved:** Template gallery is a hardcoded UI list with no database backing. Adding or editing templates requires a code deployment.

---

### 1.2 Usage & Quota Tracking ❌ Missing

The architecture has a Billing Service but no Usage Tracking service. There is no mechanism to:
- Count AI generation calls per user per billing period
- Count chat edit messages per user
- Enforce Free tier limits (3 projects, 50 AI edits/month)
- Block users who exceed their quota before the AI call is made

**Impact if unresolved:** Free users can make unlimited Claude API calls. This is a direct financial risk.

---

### 1.3 Feature Flag System ❌ Missing

A SaaS platform that ships features progressively (P0 → P1 → P2) requires a feature flag system to:
- Enable features per plan (e.g., custom domains on Pro only)
- Run A/B tests on generation prompts
- Safely release experimental components in the renderer
- Kill switches for broken AI behavior in production

**Impact if unresolved:** Enabling/disabling features requires code deployments. Impossible to do safe gradual rollouts.

---

### 1.4 Audit Log System ❌ Missing

For enterprise readiness and debugging, every meaningful event must be logged:
- User generated a website
- User published a site
- User connected a custom domain
- Admin accessed a user's project

**Impact if unresolved:** No debugging trail for failed generations. No compliance story for enterprise clients.

---

### 1.5 Notification System ❌ Missing

The architecture references WebSocket for real-time updates but has no strategy for asynchronous notifications:
- Generation complete (user closed tab)
- Publish complete
- Domain verification successful
- Plan limit approaching (80% of quota used)

**Impact if unresolved:** If a user closes their browser during a 2-minute generation, they receive no notification that their website is ready.

---

### 1.6 Stock Image Library Registry ❌ Missing

The Stock Image Resolver is mentioned in the AI Orchestration layer but has no backing system. There is no defined:
- How stock images are stored (S3 paths? External CDN URLs?)
- How images are categorized (industry × section type)
- How the resolver maps context to an image
- Who manages the image library
- Licensing model for images used in published sites

**Impact if unresolved:** Generation either fails on the image step or produces generic/irrelevant placeholder images that embarrass the product.

---

### 1.7 Content Moderation Layer ❌ Missing

Users can submit any prompt. There is no mechanism to:
- Reject prompts that request harmful or illegal content
- Prevent AI from generating inappropriate website content
- Flag and review generated sites that violate terms

**Impact if unresolved:** Claude can be prompted to generate inappropriate content that gets published publicly on `*.qevora.site`. Legal and reputational risk.

---

### 1.8 Admin Panel ❌ Missing

The PRD defines a Platform Admin role but there is no admin interface to:
- View all users and projects
- Manually trigger or cancel generation jobs
- Manage templates
- Manage the stock image library
- View platform-wide usage and cost metrics
- Suspend abusive accounts

**Impact if unresolved:** All admin operations require direct database queries. Unsustainable beyond 100 users.

---

## 2. Cost Control Review

> [!CAUTION]
> This is the most critical missing layer. Without it, a viral moment could cost thousands of dollars in a single day.

### 2.1 The Risk

**Claude claude-sonnet-4-5 pricing (approximate):**
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

A single website generation (7 steps, each sending context + receiving content) uses roughly:
- **Input:** ~8,000 tokens × 7 steps = ~56,000 tokens = **$0.17**
- **Output:** ~3,000 tokens × 7 steps = ~21,000 tokens = **$0.32**
- **Total per generation: ~$0.50**

A single chat edit (send schema + receive diff):
- **Input:** ~6,000 tokens = $0.018
- **Output:** ~500 tokens = $0.0075
- **Total per edit: ~$0.025**

**Free user doing 50 edits/month + 1 generation:**
- Cost to Qevora: ~$0.50 + (50 × $0.025) = **~$1.75/user/month**

At 1,000 free users: **$1,750/month in Claude costs alone**, with zero revenue.

---

### 2.2 Recommended Cost Control Architecture

**Layer 1 — Quota Enforcement (before AI call)**

Every AI call must pass through a Quota Gate:

```
User Request → Quota Gate → (if within limits) → AI Orchestration
                          → (if exceeded) → 429 Quota Exceeded response
```

The Quota Gate checks Redis for current period usage before forwarding the request.

**Layer 2 — Token Budget per Request**

Each Claude API call must set explicit `max_tokens` limits:

| Request Type | Max Output Tokens |
|---|---|
| Full generation | 4,000 tokens per step |
| Chat edit (diff only) | 1,500 tokens |
| Image resolution | 200 tokens |

This prevents runaway responses from inflating costs.

**Layer 3 — Plan Quotas**

| Quota | Free | Pro | Agency |
|---|---|---|---|
| Generations per month | 3 | 30 | 100 |
| Chat edits per month | 50 | 500 | 2,000 |
| Published sites | 1 | 10 | 50 |
| Max prompt length | 1,000 chars | 3,000 chars | 5,000 chars |

**Layer 4 — Abuse Prevention**

- Rate limit: max 5 generation requests per hour per user
- Rate limit: max 20 chat messages per 10 minutes per user
- Prompt length hard cap (reject before AI call)
- Suspicious pattern detection: same user making 100 requests in 1 hour → auto-suspend + alert

**Layer 5 — Cost Monitoring**

- Daily budget alert: if Claude API spend > $X/day, send alert to admin
- Per-user cost tracking: log token usage per request in database
- Weekly cost-per-user report: identify top consumers for plan enforcement review

---

## 3. Template System Review

### 3.1 Current State

Templates are mentioned in the PRD and architecture but have no system of record. They are a UI concept without a backing architecture.

### 3.2 Template Registry Design

Templates must be a **first-class system** with the following components:

**Template Document (stored as JSON in S3, indexed in DB):**

```
template
├── id
├── name (bilingual: en + ar)
├── description (bilingual)
├── category (business, restaurant, real estate, etc.)
├── tags []
├── previewImageUrl
├── planTier (free | pro | agency)
├── schemaVersion
├── defaultSchema (JSON Site Schema pre-filled with sample content)
├── isActive
├── createdAt
├── updatedAt
└── version (for template evolution tracking)
```

**Template Categories (minimum 12 for MVP):**
Business, Real Estate, Restaurant, Medical, Law Firm, Agency, Portfolio, Ecommerce, Education, Nonprofit, Event, Blog

**Template Storage:**
- Template schemas stored in S3: `s3://qevora-assets/templates/{templateId}/schema.json`
- Preview images stored in S3: `s3://qevora-assets/templates/{templateId}/preview.jpg`
- Template metadata indexed in PostgreSQL for filtering and search

**Template Versioning:**
- Templates carry a version number
- When the JSON Site Schema format changes (e.g., v1 → v2), a migration script updates all template schemas
- Projects remember which template version they were created from

**Template Generation Flow:**
```
User selects template
  → Template Registry returns defaultSchema
  → User adds customization prompt ("make it green, add Arabic")
  → AI Orchestration receives: defaultSchema + customization prompt
  → Claude modifies only the specified properties (not a full regeneration)
  → Modified schema passed to renderer → preview
```

This is significantly faster than full generation from scratch and produces more consistent output.

---

## 4. Schema Evolution Review

### 4.1 The Problem

The JSON Site Schema is the core data format of Qevora. It will evolve as:
- New component types are added to the renderer
- Design token structures change
- Ecommerce properties are added
- RTL properties are refined
- New layout options emerge

Without a versioning strategy, existing user projects can break silently when the renderer is updated.

### 4.2 Recommended Schema Versioning Strategy

**Step 1 — Version Field (Day One)**

Every JSON Site Schema must carry a top-level version field:
```
{ "schemaVersion": "1.0", ... }
```

This field is set by the AI Orchestration layer at generation time and must be present before database design begins.

**Step 2 — Renderer Version Compatibility**

The Component Renderer maintains a compatibility matrix:

| Renderer Version | Supports Schema Versions |
|---|---|
| 1.0 | 1.0 |
| 1.1 | 1.0, 1.1 |
| 2.0 | 1.x (via migration), 2.0 |

**Step 3 — Migration Pipeline**

When a user opens a project with an old schema version:
```
Load schema (v1.0)
  → Renderer detects schemaVersion < current
  → Migration pipeline runs: v1.0 → v1.1 → v2.0 (chained migrations)
  → Migrated schema saved back to S3 as current version
  → User sees updated preview
```

**Step 4 — Backward Compatibility Rules**

- **Additive changes only** in minor versions (1.0 → 1.1): add new optional fields, new component types
- **Breaking changes only in major versions** (1.x → 2.0): require migration scripts
- **Never remove a field** without a deprecation period of at least one major version
- All migration scripts are tested against all live user schemas before renderer deployment

**Step 5 — Schema Registry**

A Schema Registry (a simple JSON file in the codebase) documents every schema version, its changelog, and its migration script reference. This is the contract between AI Orchestration and the Renderer.

---

## 5. AI Workflow Review

### 5.1 Option A — Single Claude Workflow (Current)

One Claude call per generation step. The same model handles analysis, structure planning, content writing, design selection, and final assembly — with the context accumulated across steps.

**Pros:**
- Simple to implement and debug
- Low orchestration overhead
- Consistent voice and style across all generated content
- Fastest path to MVP

**Cons:**
- Each step must carry full context of all previous steps (growing input tokens)
- If one step fails, the whole pipeline fails
- Cannot parallelize steps that are independent

---

### 5.2 Option B — Multi-Agent Workflow

Specialized agents for each role:
- **Planner Agent:** Understands intent, produces structure plan
- **Content Agent:** Receives structure, writes all copy
- **Design Agent:** Receives structure, selects design tokens
- **Image Agent:** Resolves stock images per section
- **Assembler Agent:** Combines all outputs into final schema

**Pros:**
- Each agent is optimized for its task (smaller, focused prompts)
- Independent agents can run in parallel (content + design simultaneously)
- Failure in one agent is isolated

**Cons:**
- Significantly more complex orchestration
- Risk of inconsistency between agents (Content Agent and Design Agent may conflict)
- 3–4× more Claude API calls per generation
- Harder to debug across agents
- Higher cost per generation at current scale

---

### 5.3 Recommendation

**MVP: Option A — Single Claude Workflow**

For MVP with < 10,000 users, the single workflow is the correct choice. It ships faster, costs less, is easier to debug, and produces more consistent output.

**Production (post-MVP): Hybrid approach**

- Keep a single orchestrator that calls Claude sequentially
- Parallelize only truly independent steps (content writing + design token selection can run simultaneously as they do not depend on each other)
- Reserve full multi-agent architecture for a future "Claude-as-specialized-model" scenario where fine-tuned models exist for each task

**Key addition to the current single-workflow design:**

Add a **schema assembly validation step** after all Claude steps complete. Before saving the schema, run it through the Schema Validator. If validation fails, the Assembler makes one correction pass with a targeted prompt ("Fix only these specific validation errors: ..."). This dramatically improves generation success rates without the full complexity of multi-agent architecture.

---

## 6. Infrastructure Reality Check

### 6.1 Honest Assessment of System_Architecture_v1

The current architecture (AWS ECS Fargate + SQS + RDS + ElastiCache + CloudFront + Route 53 + ACM + SES + Secrets Manager) is appropriate for a **Series A company with a DevOps engineer**. For a solo founder or small team at MVP:

| AWS Service | Monthly Estimate | MVP Reality |
|---|---|---|
| ECS Fargate (8 services) | $200–400 | Overkill for 100 users |
| RDS PostgreSQL | $50–150 | Can use free tier briefly |
| ElastiCache Redis | $15–50 | Unnecessary until scale |
| CloudFront | $5–20 | Needed for published sites |
| SQS | ~$0 | Minimal cost |
| Route 53 | $1 + $0.40/hosted zone | Fine |
| S3 | $2–10 | Needed |
| **Total** | **~$280–650/month** | Before product/market fit |

This is a significant fixed cost before a single paying customer.

---

### 6.2 Three-Stage Infrastructure Plan

---

**Stage 1 — MVP (Weeks 1–12, 0–500 users)**

Target cost: **< $50/month**

| Component | MVP Choice | Reason |
|---|---|---|
| Frontend | Vercel (free tier) | Zero-config Next.js deployment |
| Backend API | Vercel Serverless Functions or Railway | No server management |
| AI Orchestration | Railway or Render (Python) | Simple container hosting |
| Database | Supabase (free tier PostgreSQL) | Free for MVP scale, PostgREST API bonus |
| Cache / Queue | Upstash Redis (serverless, free tier) | Pay-per-request, near-zero at low scale |
| Job Queue | Inngest or Trigger.dev | Serverless job queue, generous free tier |
| Published Sites | Cloudflare Pages (free tier) | Free hosting + CDN for static sites |
| DNS | Cloudflare (free) | Free DNS + wildcard support |
| Email | Resend (free tier) | 3,000 emails/month free |
| Monitoring | Sentry (free tier) | Error tracking |

**MVP infrastructure cost: ~$0–30/month**

---

**Stage 2 — Growth (Months 3–12, 500–10,000 users)**

Target cost: **$200–500/month**

| Component | Growth Choice |
|---|---|
| Frontend | Vercel Pro |
| Backend | AWS ECS Fargate (2–3 services) |
| Database | AWS RDS PostgreSQL (db.t4g.small) |
| Cache | Upstash Redis (paid tier) |
| Job Queue | AWS SQS |
| Published Sites | AWS S3 + CloudFront |
| AI Orchestration | AWS ECS Fargate (dedicated service) |

Migrate from Stage 1 infrastructure incrementally as each bottleneck is hit. **Do not migrate everything at once.**

---

**Stage 3 — Production (12+ months, 10,000+ users)**

The full architecture as defined in System_Architecture_v1. At this stage:
- Revenue exists to justify infrastructure cost
- Team exists to manage it
- Traffic patterns are understood

---

## 7. Risk Register

### Critical Risks

| # | Risk | Why Critical | Mitigation |
|---|---|---|---|
| R-01 | **No cost control = runaway Claude API spend** | One viral day can cost $5,000+ with no safeguards | Build quota gate before first user onboards |
| R-02 | **Template gallery has no backing system** | Templates are the #1 onboarding tool. Without a registry they cannot be managed or updated without code deploys | Define Template Registry before DB schema |
| R-03 | **JSON schema has no version field** | Any renderer update can silently break existing projects | Add `schemaVersion` to schema spec before first generation |

---

### High Risks

| # | Risk | Why High | Mitigation |
|---|---|---|---|
| R-04 | **No content moderation** | Inappropriate content published on `*.qevora.site` creates legal exposure | Add prompt screening via Claude's moderation capabilities or AWS Comprehend |
| R-05 | **MVP infrastructure too complex to ship fast** | 8-service AWS architecture delays first user by 6–10 weeks | Start on Vercel + Supabase; migrate to AWS at Stage 2 |
| R-06 | **Component Renderer and Server-Side Renderer diverge** | Published site looks different from the preview — destroys user trust | Single shared renderer codebase; automated visual regression tests |
| R-07 | **Claude API becomes unavailable (outage)** | Platform is 100% dependent on Anthropic | Circuit breaker pattern; graceful degradation with queued retry |

---

### Medium Risks

| # | Risk | Why Medium | Mitigation |
|---|---|---|---|
| R-08 | **RTL renderer coverage incomplete at launch** | Some components look broken in Arabic mode | Pre-launch RTL audit across all 15+ component types |
| R-09 | **No notification system for async generation** | Users who close the tab during generation never know it completed | Email notification at generation complete (AWS SES / Resend) |
| R-10 | **Stock image library too generic** | Real estate site shows a restaurant image — looks like a broken product | Curate minimum 200 images across 12 categories × 5 section types |

---

### Low Risks

| # | Risk | Why Low | Mitigation |
|---|---|---|---|
| R-11 | **Prisma ORM migration conflicts in team** | Multiple developers running conflicting migrations | Strict migration review process; single migration owner |
| R-12 | **Custom domain SSL provisioning delays** | AWS ACM can take 30–60 minutes for domain validation | Show user a "pending" state with clear instructions; email when ready |

---

## 8. Recommended Changes to System_Architecture_v1

The following 9 changes must be incorporated before database design begins:

| # | Change | Priority |
|---|---|---|
| RC-01 | **Add Usage Tracking Service** to backend services | Critical |
| RC-02 | **Add Quota Gate** as middleware in AI Orchestration | Critical |
| RC-03 | **Add Template Registry** as a first-class module with S3 + DB backing | Critical |
| RC-04 | **Add `schemaVersion` field** to the JSON Site Schema spec | Critical |
| RC-05 | **Add Schema Migration Pipeline** component to AI Orchestration layer | High |
| RC-06 | **Replace Stage 1 infrastructure** with Vercel + Supabase + Cloudflare Pages | High |
| RC-07 | **Add Content Moderation layer** as a pre-flight check in Generation Service | High |
| RC-08 | **Add Notification Service** (async email at generation complete, publish complete) | Medium |
| RC-09 | **Add Admin Panel** as an internal Next.js app route group (`/admin/*`) | Medium |

---

## 9. Final Architecture Score

### System_Architecture_v1 — Before Hardening

| Dimension | Score | Notes |
|---|---|---|
| Structural correctness | 8/10 | Well-organized tiers, correct separation of concerns |
| MVP feasibility | 4/10 | AWS stack too heavy for startup stage |
| Cost control | 2/10 | No quota enforcement, no token tracking |
| Template system | 3/10 | Mentioned but not designed |
| Schema evolution | 4/10 | No versioning strategy |
| AI workflow | 7/10 | Single-model correct for MVP; partial diff is a good call |
| Risk awareness | 6/10 | Risks noted but content moderation and cost are unaddressed |
| Missing components | 5/10 | 8 significant gaps identified |

**Overall: 6.5 / 10**

---

### System Architecture — After Applying RC-01 through RC-09

| Dimension | Score | Notes |
|---|---|---|
| Structural correctness | 8/10 | Unchanged |
| MVP feasibility | 8/10 | Vercel + Supabase stack is fast to ship |
| Cost control | 8/10 | Quota gate + token budgets + plan limits defined |
| Template system | 8/10 | First-class registry with versioning |
| Schema evolution | 8/10 | `schemaVersion` + migration pipeline |
| AI workflow | 7/10 | Unchanged; single-model with validation step |
| Risk awareness | 9/10 | All critical and high risks mitigated |
| Missing components | 8/10 | 7 of 8 gaps addressed (Admin Panel is medium priority) |

**Overall: 8.5 / 10**

---

*Document maintained by: Antigravity AI*
*Prerequisite for: Task 004 — Database Schema Design*
*Depends on: System_Architecture_v1.md*

# Qevora Master Audit — Part 2 of 2
**Continued from Part 1. All facts from direct code inspection.**

---

## Phase 7 — Frontend Infrastructure Checklist

| Infrastructure Item | Status | Evidence |
|---|---|---|
| API Client (`lib/api.ts`) | **MISSING** | No `lib/` folder in `apps/web/src/` |
| Axios | **MISSING** | Not in `apps/web/package.json` |
| Fetch wrappers | **MISSING** | Only raw `fetch()` in `signup/page.tsx` |
| `middleware.ts` | **MISSING** | File does not exist |
| Auth Provider / Context | **MISSING** | No auth context exists |
| Theme Provider | **MISSING** | Dark mode is set statically via `className="dark"` in `layout.tsx` |
| Language Provider | **EXISTS** | `LanguageContext.tsx` — but only used in 5 of 7 pages |
| `loading.tsx` | **MISSING** | File does not exist |
| `error.tsx` | **MISSING** | File does not exist |
| `not-found.tsx` | **MISSING** | File does not exist |
| Protected Routes | **MISSING** | No middleware, no redirect logic |
| Server Components | **MISSING** | Every file begins with `"use client"` — 11 files confirmed |
| Client Components | **EXISTS** | All 11 page/component files |
| `next/image` | **MISSING** | All images use raw `<img>` tag (Unsplash URLs in `templates/page.tsx`) |
| Suspense | **MISSING** | Not used anywhere |
| React Query / SWR | **MISSING** | Not in `package.json` |
| Zustand | **MISSING** | Not in `package.json` |
| `NEXT_PUBLIC_API_URL` | **MISSING** | `.env` contains only `DATABASE_URL` and `ANTHROPIC_API_KEY` |
| `posthog-js` | **INSTALLED, UNUSED** | In `package.json`; zero imports in `apps/web/src/` confirmed by grep |
| Rubik font | **EXISTS** | `layout.tsx` lines 2–10: `next/font/google`, subsets `["latin", "arabic"]` |
| RTL root attribute | **PARTIALLY** | `layout.tsx` line 24: `dir="ltr"` is hardcoded — never switches to `rtl` |

**Critical note on RTL:** `layout.tsx` sets `<html lang="en" dir="ltr">` statically. Even though pages use `rtl:` Tailwind prefixes and `LanguageContext` can switch to Arabic, the root `dir` attribute never changes. True RTL layout requires the `dir` attribute to update on the `<html>` element.

---

## Phase 8 — Backend Integration Connection Matrix

Backend API routes verified in `apps/api/main.py`. Frontend connections verified by grep.

| Feature | Backend Route | Backend Status | Frontend Status | Connection |
|---|---|---|---|---|
| Signup | `POST /auth/signup` | ✅ Full bcrypt + DB | Calls `http://localhost:8000/auth/signup` | ⚠️ **Partial** — wired but hardcoded URL + localStorage JWT |
| Login | `POST /auth/login` | ✅ Full bcrypt verify | `window.location.href="/dashboard"` — no fetch | ❌ **Not connected** |
| List Projects | `GET /projects` | ✅ Full DB query | `useState([hardcoded data])` | ❌ **Not connected** |
| Create Project | `POST /projects` | ✅ Quota check + DB write | No UI for this action | ❌ **Not connected** |
| Delete Project | `DELETE /projects/{id}` | ✅ Ownership check + DB | No UI for this action | ❌ **Not connected** |
| Generate Site | `POST /projects/{id}/generate` | ✅ Calls AI + saves schema | `setTimeout` simulation | ❌ **Not connected** |
| Edit Site | `POST /projects/{id}/edit` | ✅ Modifies schema | `setTimeout` simulation | ❌ **Not connected** |
| Get Schema | `GET /projects/{id}/schema` | ✅ Returns latest schema | Not called anywhere | ❌ **Not connected** |
| Publish Site | `POST /projects/{id}/publish` | ✅ Writes subdomain (no real CDN) | Not called anywhere | ❌ **Not connected** |
| Custom Domain | `POST /projects/{id}/domain` | ✅ DB record created | Not called anywhere | ❌ **Not connected** |
| Health Check | `GET /health` | ✅ DB status | Not called anywhere | ❌ **Not connected** |

**Summary: 1 of 11 API endpoints is called from the frontend, and that one call has security issues.**

---

## Phase 9 — Technical Debt Registry

### 🔴 Critical (Causes Broken Behavior)

| Item | Location | Reason | Fix |
|---|---|---|---|
| `dashboard/page.tsx` uses tokens that produce no CSS | `dashboard/page.tsx`, all lines | Token names like `bg-background-alt`, `text-text` not in `tailwind.config.js`. Dashboard renders with no color styling. | Rewrite against Stitch tokens |
| Login form does not authenticate | `login/page.tsx:19` | `window.location.href="/dashboard"` with no API call. Any click logs in. | Wire to `POST /auth/login` |
| JWT stored in `localStorage` | `signup/page.tsx:35-36` | XSS vulnerability. Token can be stolen by injected scripts. | Move to `httpOnly` cookie via Next.js API route |
| API URL hardcoded | `signup/page.tsx:20` | `fetch("http://localhost:8000/auth/signup")` breaks in all non-local environments | Use `process.env.NEXT_PUBLIC_API_URL` |
| No `middleware.ts` | `apps/web/src/` | `/dashboard` and `/editor` accessible without authentication | Create middleware to verify JWT and redirect |
| `dir="ltr"` never changes | `layout.tsx:24` | Arabic language switch has no effect on layout directionality | Update `dir` attribute dynamically via `LanguageContext` |

### 🟠 High (Degrades Quality)

| Item | Location | Reason | Fix |
|---|---|---|---|
| `signup/page.tsx` uses legacy design | `signup/page.tsx` | 13 `gray-*` classes, 2 hardcoded hex, no shared components, no RTL | Full rewrite matching login page pattern |
| `editor/page.tsx` is 559 lines | `editor/page.tsx` | Single component — untestable, unmaintainable | Split into `EditorToolbar`, `EditorLeftPanel`, `EditorCanvas`, `EditorRightPanel`, `EditorStatusBar` |
| `page.tsx` (landing) is 442 lines | `page.tsx` | Single component | Split into section components |
| `pt(en, ar)` duplicated in 4 files | `login/`, `editor/`, `templates/`, `pricing/` | Same function defined 4 times | Expand `LanguageContext` dictionary; use `t()` |
| `posthog-js` installed but unused | `apps/web/package.json` | Dead dependency | Remove or wire up analytics |
| 9 application routes not built | `apps/web/src/app/` | Settings, Profile, Analytics, Billing, Domains, History, 404, Wizard, Loading State missing | Build from Stitch exports |
| No `loading.tsx`, `error.tsx`, `not-found.tsx` | `apps/web/src/app/` | Users see blank screens on errors or slow loads | Create Next.js special files |

### 🟡 Medium (Technical Debt)

| Item | Location | Reason | Fix |
|---|---|---|---|
| All pages are `"use client"` | 11 files | Landing, Pricing, Templates are fully static but disable SSR | Remove `"use client"` from static pages |
| `<img>` tags throughout | `templates/page.tsx`, `page.tsx` | No lazy loading, no LCP optimization | Replace with `next/image` |
| `<AmbientBackground>` not extracted | 5 page files | Wrapper div copy-pasted: `<div className="fixed inset-0 z-0 pointer-events-none opacity-XX">` | Extract component |
| `<LanguageToggle>` not extracted | `Navbar.tsx`, `login/page.tsx`, `editor/page.tsx` | 3 separate implementations | Extract component |
| Translations inside `LanguageContext.tsx` | `LanguageContext.tsx` (236 lines) | Unmaintainable as strings grow | Extract to `/src/locales/en.ts` and `/src/locales/ar.ts` |
| `Footer.tsx` English-only | `Footer.tsx` | No `LanguageContext` import | Add bilingual support |

### 🟢 Low (Cleanup)

| Item | Location | Fix |
|---|---|---|
| `design_md_base64.txt` | repo root | Delete |
| `design_md_base64_clean.txt` | repo root | Delete |
| `parse_ds.js` | repo root | Delete |
| `update_ds_payload.js` | repo root | Delete |
| `desktop.ini` | repo root | Delete + add to `.gitignore` |
| `packages/renderer/src/e2e-runner.js` | renderer package | Delete or configure test runner |
| `packages/renderer/src/test-runner.js` | renderer package | Delete or configure test runner |
| `public/Qevora logo.png` | `public/` | Delete (unused) or use in Navbar |
| CORS `allow_origins=["*"]` | `apps/api/main.py:24` | Restrict to specific origins |
| `docs/` folder empty | `docs/` | Write setup documentation |

---

## Phase 10 — Master Roadmap

### Milestone 1 — Emergency Fixes
**Goal:** Fix broken behavior. Estimated: 1 day.

| Task | Files | Why |
|---|---|---|
| Fix login to call `POST /auth/login` | `login/page.tsx` | Login button does nothing currently |
| Add `NEXT_PUBLIC_API_URL` to `.env` | `.env`, `signup/page.tsx` | Hardcoded localhost will break in staging |
| Fix `dir="ltr"` to switch dynamically | `layout.tsx`, `LanguageContext.tsx` | RTL layout broken for Arabic users |
| Fix `/login` broken link → `/signup` | `login/page.tsx:217` | Broken navigation |
| Delete 5 dead root-level files | root | Repository hygiene |

### Milestone 2 — UI Completion
**Goal:** All existing pages pass Stitch verification. Estimated: 3 days.

| Task | Files | Why |
|---|---|---|
| Rewrite `signup/page.tsx` | `signup/page.tsx` | Only legacy page with no Stitch compliance |
| Rewrite `dashboard/page.tsx` | `dashboard/page.tsx` | Legacy tokens produce zero CSS output |
| Create `not-found.tsx` | `apps/web/src/app/not-found.tsx` | Stitch export exists; missing from app |
| Create `loading.tsx` | `apps/web/src/app/loading.tsx` | Blank screen on route transitions |
| Create `error.tsx` | `apps/web/src/app/error.tsx` | Unhandled errors crash silently |

### Milestone 3 — Component Architecture
**Goal:** One shared component for each concern. Estimated: 2 days.

| Task | Files | Why |
|---|---|---|
| Extract `<LanguageToggle />` | New file + 3 consumers | 3 duplicate implementations |
| Extract `<AmbientBackground />` | New file + 5 consumers | 5 duplicate wrappers |
| Split `editor/page.tsx` | 5 new component files | 559 lines unmaintainable |
| Move translations to locale files | New `/src/locales/*.ts` + `LanguageContext.tsx` | Embedded strings block i18n scaling |
| Eliminate `pt()` duplicates | 4 page files | Use `t()` from context |

### Milestone 4 — API Infrastructure
**Goal:** Frontend can talk to backend securely. Estimated: 2 days.

| Task | Files | Why |
|---|---|---|
| Create `lib/api.ts` Axios client | New file | No HTTP client exists |
| Create `middleware.ts` auth guard | New file | Dashboard/Editor publicly accessible |
| Move JWT to `httpOnly` cookie | `signup/page.tsx` + new API route | XSS vulnerability |
| Wire dashboard to `GET /projects` | `dashboard/page.tsx` | Hardcoded mock data |
| Wire editor to `POST /projects/{id}/edit` | `editor/page.tsx` | `setTimeout` simulation |

### Milestone 5 — Missing Application Routes
**Goal:** All Stitch exports have corresponding Next.js pages. Estimated: 5 days.

Build from Stitch exports in order:
1. `/settings` — from `settings_qevora_ai_1`
2. `/profile` — from `user_profile_qevora_ai_1`
3. `/billing` — from `billing_qevora_ai`
4. `/domains` — from `domains_qevora_dashboard`
5. `/analytics` — from `analytics_dashboard_qevora_ai`
6. `/history` — from `ai_generation_history_qevora`
7. Generation wizard flow — from `qevora_ai_generation_wizard`
8. Generation loading state — from `qevora_ai_generating_your_vision`

### Milestone 6 — Performance & SSR
**Goal:** Static pages use Server Components. Estimated: 1 day.

| Task | Why |
|---|---|
| Remove `"use client"` from Landing, Pricing, Templates | Enables SSR and SEO |
| Replace all `<img>` with `next/image` | LCP optimization |
| Add `React.Suspense` to data-loading routes | Better loading UX |

### Milestone 7 — Publishing Pipeline
**Goal:** End-to-end site generation and publishing works. Estimated: 3 days.

The backend has `POST /projects/{id}/publish` which writes a subdomain record but has no real CDN upload. This requires:
1. Integrate `packages/renderer` to compile schema to HTML
2. Upload compiled HTML to S3 or Cloudflare Pages
3. Update frontend Publish button to call the real API

### Milestone 8 — Security & Production Hardening
**Goal:** Ready for public deployment. Estimated: 1 day.

| Task | Files |
|---|---|
| Restrict CORS from `["*"]` | `apps/api/main.py:24` |
| Add rate limiting to auth routes | `apps/api/main.py` |
| Add TypeScript strict mode | `apps/web/tsconfig.json` |
| Wire `posthog-js` or remove it | `apps/web/package.json` |
| Write `docs/` setup guide | `docs/` |

---

## Safe-to-Delete Files (Verified Unused)
1. `/design_md_base64.txt`
2. `/design_md_base64_clean.txt`
3. `/parse_ds.js`
4. `/update_ds_payload.js`
5. `/desktop.ini`
6. `public/Qevora logo.png`
7. `packages/renderer/src/e2e-runner.js`
8. `packages/renderer/src/test-runner.js`

## Must-Keep Files (Required by Application)
- All `apps/web/src/` files
- All `apps/api/*.py` files
- All `packages/*/src/` files (referenced in `next.config.js` `transpilePackages`)
- `infrastructure/database/schema.prisma`
- `infrastructure/docker/docker-compose.yml`
- `design/stitch/` — Source for 9 unbuilt pages
- `DESIGN.md` — Design specification
- `turbo.json`, `package.json`, `.gitignore`

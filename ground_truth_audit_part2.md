# Qevora Ground Truth Verification — Part 2 of 2
**Continued from Part 1. All facts from direct file inspection.**

---

## Phase 6 — Stitch Folder Audit

The `design/stitch/` directory contains the following entries (verified by `list_dir`):

| Stitch Export Folder | Matching Next.js Route | Status |
|---|---|---|
| `qevora_ai_website_builder` | `/` (`page.tsx`) | ✅ Route exists. Custom-coded, not directly lifted. |
| `qevora_ai_website_builder_v2` | `/` | Duplicate export. Route exists. |
| `login_qevora_ai_1` | `/login` | ✅ Route exists. Custom-coded. |
| `login_qevora_ai_2` | `/login` | Duplicate export. Route exists. |
| `pricing_qevora_ai` | `/pricing` | ✅ Route exists. Custom-coded. |
| `templates_marketplace_qevora` | `/templates` | ✅ Route exists. Custom-coded. |
| `qevora_editor_professional_web_builder` | `/editor` | ✅ Route exists. Custom-coded. |
| `qevora_professional_website_editor` | `/editor` | Duplicate export. Route exists. |
| `qevora_dashboard` | `/dashboard` | ⚠️ Route exists but is a 95-line stub with hardcoded data. |
| `settings_qevora_ai_1` | `/settings` | 🔴 **NO ROUTE EXISTS** |
| `settings_qevora_ai_2` | `/settings` | 🔴 **NO ROUTE EXISTS** (Duplicate export) |
| `analytics_dashboard_qevora_ai` | `/analytics` | 🔴 **NO ROUTE EXISTS** |
| `billing_qevora_ai` | `/billing` | 🔴 **NO ROUTE EXISTS** |
| `domains_qevora_dashboard` | `/domains` | 🔴 **NO ROUTE EXISTS** |
| `user_profile_qevora_ai_1` | `/profile` | 🔴 **NO ROUTE EXISTS** |
| `user_profile_qevora_ai_2` | `/profile` | 🔴 **NO ROUTE EXISTS** (Duplicate export) |
| `ai_generation_history_qevora` | `/history` | 🔴 **NO ROUTE EXISTS** |
| `404_page_not_found_qevora` | `not-found.tsx` | 🔴 **FILE DOES NOT EXIST** |
| `qevora_ai_generation_wizard` | No mapped route | 🔴 **NO ROUTE EXISTS** |
| `qevora_ai_generating_your_vision` | No mapped route | 🔴 **NO ROUTE EXISTS** |
| `aetheric_intelligence` | No mapped route | NOT VERIFIED — unknown purpose |
| `qevora` | No mapped route | NOT VERIFIED — unknown purpose |
| `qevora_digital_ether` | No mapped route | NOT VERIFIED — unknown purpose |
| `shader_1/2/3/4` | No mapped route | WebGL/visual exploration. No route needed. |
| `three.js` | No mapped route | Three.js exploration. No route needed. |
| `qevora_logo.png` | `public/` | NOT VERIFIED — appears to be a design asset folder |

**Summary:**
- Total Stitch export folders: 29
- Routes with Stitch export AND implementation: 7 (all custom-coded, none directly lifted)
- Routes with Stitch export but NO implementation: 9 distinct missing pages
- Duplicate exports (multiple versions of same screen): 5 pairs

---

## Phase 7 — Backend Integration Verification

### What the Frontend Actually Calls (verified by grep)

**`signup/page.tsx` line 20:**
```
fetch("http://localhost:8000/auth/signup", { method: "POST", ... })
```
- ✅ Calls real backend
- 🔴 URL is hardcoded — no environment variable
- 🔴 JWT stored in `localStorage` on success (lines 35–36)
- 🔴 No `NEXT_PUBLIC_API_URL` in `.env` (verified: `.env` contains only `DATABASE_URL` and `ANTHROPIC_API_KEY`)

**`login/page.tsx` line 19:**
```
window.location.href = "/dashboard"
```
- 🔴 No API call — `handleSubmit` redirects without authentication
- 🔴 Form is completely decoupled from `POST /auth/login`

**`dashboard/page.tsx` lines 7–10:**
```javascript
const [projects, setProjects] = useState([
  { id: "1", name: "Nova Realty", ... },
  { id: "2", name: "Gourmet Bakery", ... }
]);
```
- 🔴 Hardcoded mock data — does not call `GET /projects`

**`editor/page.tsx` lines 77–108:**
```javascript
setTimeout(() => { // simulates AI response
  setHeadlineColor("...");
}, 1200);
```
- 🔴 All AI editing is a `setTimeout` simulation — does not call `POST /projects/{id}/edit`

**Backend API (verified in `apps/api/main.py`):**
- `POST /auth/signup` — Fully implemented, bcrypt hashing, DB write
- `POST /auth/login` — Fully implemented, bcrypt verify
- `GET /projects` — Fully implemented, requires `Authorization` header
- `POST /projects/{id}/generate` — Fully implemented, calls AI, saves schema
- `POST /projects/{id}/edit` — Fully implemented, modifies schema
- `POST /projects/{id}/publish` — Implemented but writes fake `subdomain` (no real CDN)
- CORS: `allow_origins=["*"]` — wildcard, insecure for production

**Integration Status by Feature:**
| Feature | Backend | Frontend | Connected? |
|---|---|---|---|
| Signup | ✅ Complete | ✅ Calls API | ⚠️ Partial (wrong token storage) |
| Login | ✅ Complete | 🔴 No API call | 🔴 **NOT CONNECTED** |
| List Projects | ✅ Complete | 🔴 Hardcoded | 🔴 **NOT CONNECTED** |
| Create Project | ✅ Complete | 🔴 Not present | 🔴 **NOT CONNECTED** |
| Generate Site | ✅ Complete | 🔴 Mocked | 🔴 **NOT CONNECTED** |
| Edit Site | ✅ Complete | 🔴 Mocked | 🔴 **NOT CONNECTED** |
| Publish Site | ✅ Partial | 🔴 Not present | 🔴 **NOT CONNECTED** |

---

## Phase 8 — Production Readiness Checklist

| Item | Status | Evidence |
|---|---|---|
| TypeScript strict mode | NOT VERIFIED — `tsconfig.json` not inspected in detail | — |
| Next.js build | NOT VERIFIED — no build run | — |
| Lint | NOT VERIFIED — no lint run | — |
| SSR | 🔴 FAIL | Every page and component has `"use client"` — 11 files total |
| `next/image` | 🔴 FAIL | All images use `<img>` tag with Unsplash CDN URLs |
| `middleware.ts` | 🔴 MISSING | File does not exist in `apps/web/src/` |
| Auth guard on `/dashboard` | 🔴 MISSING | No middleware, route is publicly accessible |
| Auth guard on `/editor` | 🔴 MISSING | No middleware, route is publicly accessible |
| `not-found.tsx` | 🔴 MISSING | File does not exist |
| `loading.tsx` | 🔴 MISSING | File does not exist |
| `error.tsx` | 🔴 MISSING | File does not exist |
| `NEXT_PUBLIC_API_URL` env var | 🔴 MISSING | `.env` does not contain this variable |
| API client (`lib/api.ts`) | 🔴 MISSING | No `lib/` folder exists in `apps/web/src/` |
| JWT in httpOnly cookie | 🔴 FAIL | `localStorage` used in `signup/page.tsx` |
| CORS restricted | 🔴 FAIL | `allow_origins=["*"]` in `apps/api/main.py` line 24 |
| Unused npm packages | ⚠️ WARNING | `posthog-js` in `package.json` — no usage found in `src/` |

---

## Phase 9 — Final Scores

| Category | Score | Basis |
|---|---|---|
| **UI** | **66 / 100** | 5 of 7 routes pass Stitch verification. 2 routes (`/signup`, `/dashboard`) completely fail. |
| **Architecture** | **52 / 100** | Monorepo structure is correct. Pages are monolithic (editor: 559L, landing: 442L). No state management. No `lib/` layer. |
| **Maintainability** | **55 / 100** | 4 duplicate `pt()` helpers. 2 separate design token systems. No locales files. Translations embedded inline. |
| **Performance** | **45 / 100** | 100% Client Components. No `next/image`. No SSR. |
| **Scalability** | **50 / 100** | No global state. No API client. No auth middleware. Cannot add real features without infrastructure. |
| **Production Readiness** | **12 / 100** | No auth guards. JWT in localStorage. Hardcoded `localhost` URL. No 404/error/loading pages. Login does not authenticate. |
| **Backend Integration** | **10 / 100** | Only `POST /auth/signup` is wired. Login, Dashboard, Editor are all mocked. |
| **OVERALL** | **43 / 100** | — |

---

## Phase 10 — Roadmap

### 🔴 Critical

**C1: Rewrite `signup/page.tsx`**
- Reason: Uses 13 raw gray Tailwind classes, 2 hardcoded hex values, invalid tokens (`primary-dark`, `text-inverse`), no shared components, no RTL, no LanguageContext. Visually inconsistent with rest of app.
- Files: `apps/web/src/app/signup/page.tsx`
- Difficulty: Low — pattern exists in `login/page.tsx`
- Estimated hours: 3h
- Dependencies: None
- Impact: Eliminates the only page with raw gray classes and hardcoded hex backgrounds

**C2: Rewrite `dashboard/page.tsx`**
- Reason: Uses 12+ legacy token names that produce no styling output (`text-text`, `bg-surface-elevated`, `border-border`). No glassmorphism. No shared components. No RTL. Hardcoded project data.
- Files: `apps/web/src/app/dashboard/page.tsx`
- Difficulty: Medium — must design new layout
- Estimated hours: 4h
- Dependencies: C1 (pattern)
- Impact: Eliminates all legacy `@qevora/design-system` token references from active pages

**C3: Create `middleware.ts`**
- Reason: `/dashboard` and `/editor` are accessible without a valid session. Any unauthenticated user can navigate to either URL.
- Files: Create `apps/web/src/middleware.ts`
- Difficulty: Low
- Estimated hours: 1h
- Dependencies: C5 (need a token to validate)
- Impact: Security — closes public access to protected routes

**C4: Add `NEXT_PUBLIC_API_URL` to `.env`**
- Reason: `signup/page.tsx` line 20 hardcodes `http://localhost:8000`. This will break in any non-local environment.
- Files: `.env`, `signup/page.tsx`
- Difficulty: Trivial
- Estimated hours: 15min
- Dependencies: None
- Impact: Makes API base URL configurable

**C5: Move JWT from `localStorage` to `httpOnly` cookie**
- Reason: `localStorage` is readable by any JavaScript, making JWT vulnerable to XSS attacks.
- Files: `signup/page.tsx`, create `apps/web/src/app/api/auth/callback/route.ts`
- Difficulty: Medium
- Estimated hours: 3h
- Dependencies: C4
- Impact: Security — eliminates XSS token theft vector

### 🟠 High

**H1: Wire login form to `POST /auth/login`**
- Reason: `login/page.tsx` line 19 calls `window.location.href = "/dashboard"` without any API call. The login button does nothing.
- Files: `apps/web/src/app/login/page.tsx`
- Difficulty: Low
- Estimated hours: 2h
- Dependencies: C4, C5

**H2: Wire dashboard to `GET /projects`**
- Reason: Dashboard uses hardcoded mock array. `GET /projects` endpoint is fully built and awaiting integration.
- Files: `apps/web/src/app/dashboard/page.tsx`
- Difficulty: Low
- Estimated hours: 2h
- Dependencies: H1, C3

**H3: Create `not-found.tsx`, `loading.tsx`, `error.tsx`**
- Reason: These Next.js special files are missing. Stitch export `404_page_not_found_qevora` exists. Missing `loading.tsx` means users see blank screens during navigation.
- Files: Create in `apps/web/src/app/`
- Difficulty: Low
- Estimated hours: 2h
- Dependencies: None

**H4: Create `lib/api.ts` API client**
- Reason: No centralized HTTP client exists. Each integration requires manual `fetch` with repeated header boilerplate.
- Files: Create `apps/web/src/lib/api.ts`
- Difficulty: Low
- Estimated hours: 2h
- Dependencies: C4, C5

**H5: Build missing app routes from Stitch exports**
- Reason: 9 distinct routes have Stitch designs but no implementation: `/settings`, `/profile`, `/analytics`, `/billing`, `/domains`, `/history`, generation wizard, generation loading state.
- Files: Create corresponding `apps/web/src/app/*/page.tsx`
- Difficulty: Medium per page
- Estimated hours: 16–24h total
- Dependencies: H4

### 🟡 Medium

**M1: Extract `<LanguageToggle />` component**
- Reason: Language switcher UI implemented three times in Navbar, Login, and Editor.
- Files: Create `components/LanguageToggle.tsx`, update 3 consumers
- Difficulty: Low
- Estimated hours: 1h

**M2: Extract `<AmbientBackground />` component**
- Reason: `<div className="fixed inset-0 z-0 pointer-events-none opacity-XX"><AmbientShader/></div>` copy-pasted in 5 pages.
- Files: Create `components/AmbientBackground.tsx`, update 5 consumers
- Difficulty: Low
- Estimated hours: 1h

**M3: Move translations out of `LanguageContext.tsx`**
- Reason: 236-line file embeds all translation strings inline. Difficult to maintain or hand off to translators.
- Files: Create `src/locales/en.ts`, `src/locales/ar.ts`, update `LanguageContext.tsx`
- Difficulty: Low
- Estimated hours: 2h

**M4: Eliminate 4 duplicate `pt()` helpers**
- Reason: `const pt = (en, ar) => language === "ar" ? ar : en` duplicated in login, editor, templates, pricing. Should use `useLanguage().t()`.
- Files: 4 page files + `LanguageContext.tsx` (expand dictionary)
- Difficulty: Low
- Estimated hours: 2h

**M5: Replace `<img>` with `next/image`**
- Reason: All template/feature images use raw `<img>` tags with Unsplash URLs. No lazy loading, no LCP optimization.
- Files: `templates/page.tsx`, `page.tsx`
- Difficulty: Low
- Estimated hours: 1h

**M6: Decompose `editor/page.tsx`**
- Reason: 559-line single component is untestable and unmaintainable.
- Files: `editor/page.tsx` → `EditorToolbar`, `EditorLeftPanel`, `EditorCanvas`, `EditorRightPanel`, `EditorStatusBar`
- Difficulty: Medium
- Estimated hours: 4h

### 🟢 Low

**L1: Delete dead files**
- Files: `design_md_base64.txt`, `design_md_base64_clean.txt`, `parse_ds.js`, `update_ds_payload.js`, `desktop.ini`
- Estimated hours: 5min

**L2: Remove unused `posthog-js` dependency or wire it**
- Reason: Listed in `package.json` but no import found in `apps/web/src/`
- Estimated hours: 15min

**L3: Restrict CORS in `apps/api/main.py`**
- Reason: `allow_origins=["*"]` is insecure for production
- Files: `apps/api/main.py` line 24
- Estimated hours: 15min

**L4: Remove/configure `packages/renderer/src/e2e-runner.js` and `test-runner.js`**
- Reason: Standalone test scripts with no test runner configured. Dead code.
- Estimated hours: 30min

---

## Files Safe to Delete
Verified unused — serve no application purpose:
1. `/design_md_base64.txt`
2. `/design_md_base64_clean.txt`
3. `/parse_ds.js`
4. `/update_ds_payload.js`
5. `/desktop.ini`
6. `packages/renderer/src/e2e-runner.js` *(no test runner configured)*
7. `packages/renderer/src/test-runner.js` *(no test runner configured)*

## Files That Must Be Kept
Required by the application or build system:
- All `apps/web/src/` files
- `apps/api/*.py`
- All `packages/*/src/` files (even those unused by web — they may be referenced at build time via `next.config.js` `transpilePackages`)
- `design/stitch/` — Required as source for the 9 missing routes
- `DESIGN.md` — Design specification
- `.env` — Required (but must be expanded)

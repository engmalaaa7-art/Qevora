# Qevora Frontend Consolidation & Production Readiness Audit
**Date:** 2026-06-27 | **Type:** Full Technical Audit — Read-Only

---

## Scores Summary

| Category | Score |
|---|---|
| **Overall Frontend** | **54 / 100** |
| Design System Compliance | 71 / 100 |
| Architecture | 58 / 100 |
| UI Consistency | 63 / 100 |
| Production Readiness | 18 / 100 |
| Technical Debt | 42 / 100 *(lower = more debt)* |

---

## Phase 1 — Legacy Verification

### ❌ Legacy Files Still Present

#### 1. `apps/web/src/app/dashboard/page.tsx` — **Critical Legacy**
Uses an entirely different design token vocabulary — the OLD `packages/design-system` token names, not the Stitch/Tailwind config:

| Line | Legacy Token | Correct Stitch Token |
|---|---|---|
| 13 | `bg-background-alt` | `bg-background` |
| 15 | `bg-surface`, `border-border` | `bg-surface`, `border-outline-variant` |
| 21 | `text-text` | `text-on-surface` |
| 24 | `bg-primary-light text-primary` | `bg-primary/10 text-primary` |
| 27 | `text-text-secondary`, `bg-surface-elevated` | `text-on-surface-variant`, `bg-surface-container-high` |
| 35 | `bg-background-alt border-border` | `bg-surface-container border-outline-variant` |
| 51 | `hover:bg-primary-dark text-text-inverse` | `hover:brightness-110 text-background` |
| 59 | `border-border shadow-sm` | `border-outline-variant` |
| 62 | `text-text` | `text-on-surface` |
| **64** | `bg-green-100 text-green-800`, `bg-yellow-100 text-yellow-800` | **`bg-tertiary/10 text-tertiary` / `bg-secondary/10 text-secondary`** |
| 69 | `text-text-secondary` | `text-on-surface-variant` |

**Verdict:** Dashboard is built against a completely different token system. Not one glassmorphism class. Not one `glass` or `glass-card`. No RTL support. No `LanguageContext`. No `AmbientShader`. **This is the primary legacy remnant.**

#### 2. `apps/web/src/app/signup/page.tsx` — **Critical Legacy**

| Line | Problem |
|---|---|
| 46 | `bg-[#0b0f19]` — hardcoded hex |
| 46 | `from-indigo-950` — raw Tailwind, off-token |
| 58 | `text-gray-400` — off-token |
| 71 | `text-gray-300` — off-token |
| 88 | `text-gray-300` — off-token |
| 105 | `text-gray-300` — off-token |
| 121 | `text-gray-500 hover:text-gray-300` — off-token |
| 131 | `hover:bg-primary-dark text-text-inverse` — invalid tokens |
| 138 | `text-gray-400` — off-token |
| 140 | `text-primary-light` — invalid token |
| **All** | No RTL support, no `LanguageContext`, no glassmorphism, no `AmbientShader` |

**Verdict:** Complete legacy file. Structurally isolated from the rest of the design system.

#### 3. `editor/page.tsx` line 540 — **Minor Legacy**
```tsx
bg-yellow-500  // status indicator dot
bg-green-500   // status indicator dot
```
These two raw Tailwind colors should be `bg-warning` (if defined) or `bg-tertiary` / `bg-secondary`.

#### 4. Root-level scratch files — **Dead Artifacts**
- `design_md_base64.txt` — Stitch upload artifact, not source code
- `design_md_base64_clean.txt` — Duplicate of above
- `parse_ds.js` — One-off utility script
- `update_ds_payload.js` — One-off utility script
- `qevora_ui_migration_audit.md` — Audit output, should be in `/docs`

### ✅ Duplicated Systems — Which Survives?

#### Duplicated: Button Component
| Instance | Location | API | Should Survive? |
|---|---|---|---|
| `Button` (web-app) | `apps/web/src/components/ui.tsx` | `variant: glow/outline/ghost` | ✅ **YES — Primary** |
| `Button` (package) | `packages/ui/src/index.tsx` | `variant: primary/secondary/outline/gradient` | 🔴 Used only by renderer sections |

**Recommendation:** The web-app `Button` (in `components/ui.tsx`) is the Stitch-compliant version. The `packages/ui` Button is for the website renderer (end-user websites), not for the Qevora app UI itself. They serve **different purposes** and should NOT be merged — but they must be clearly documented as separate concerns.

#### Duplicated: Language Helper `pt(en, ar)`
Inline function `const pt = (en, ar) => language === "ar" ? ar : en` appears in:
- `editor/page.tsx` line 50
- `login/page.tsx` line 14
- `pricing/page.tsx` line 21
- `templates/page.tsx` line 17

The `LanguageContext` already provides `t(key)`. The `pt()` inline pattern exists because these pages use inline English/Arabic pairs that aren't in the translation dictionary. **Recommendation:** Expand the translation dictionary in `LanguageContext.tsx` and eliminate all inline `pt()` duplications.

#### Duplicated: Language Toggle UI
Three separate implementations:
1. `Navbar.tsx` — desktop pill toggle
2. `login/page.tsx` — top-right corner toggle
3. `editor/page.tsx` — right panel footer toggle

**Recommendation:** Extract a `<LanguageToggle />` component.

#### Duplicated: AmbientShader Wrapper
Copy-pasted `<div className="fixed inset-0 z-0 pointer-events-none opacity-XX">` in every page. **Recommendation:** Create `<AmbientBackground opacity={0.4} />` layout component.

---

## Phase 2 — Design System Compliance

### Token Usage by Page

| Page | Rubik | Stitch Colors | Glass | RTL | Spacing | Score |
|---|---|---|---|---|---|---|
| Landing `/` | ✅ | ✅ | ✅ | ✅ | ✅ | **96/100** |
| Login `/login` | ✅ | ✅ | ✅ | ✅ | ✅ | **92/100** |
| **Signup `/signup`** | 🟡 | 🔴 | 🟡 | 🔴 | 🔴 | **28/100** |
| **Dashboard `/dashboard`** | 🟡 | 🔴 | 🔴 | 🔴 | 🔴 | **22/100** |
| Editor `/editor` | ✅ | ✅ | ✅ | ✅ | ✅ | **88/100** |
| Pricing `/pricing` | ✅ | ✅ | ✅ | ✅ | ✅ | **91/100** |
| Templates `/templates` | ✅ | ✅ | ✅ | ✅ | ✅ | **90/100** |

### Violations List

| # | File | Line | Violation | Fix |
|---|---|---|---|---|
| 1 | `signup/page.tsx` | 46 | `bg-[#0b0f19]` hardcoded | `bg-background` |
| 2 | `signup/page.tsx` | 46 | `from-indigo-950` | Remove gradient; use AmbientShader |
| 3 | `signup/page.tsx` | 58,71,88,105,121,138 | `text-gray-*` | `text-on-surface-variant` |
| 4 | `signup/page.tsx` | 131 | `text-text-inverse` | `text-background` |
| 5 | `signup/page.tsx` | 140 | `text-primary-light` | `text-primary/70` |
| 6 | `signup/page.tsx` | 131 | `hover:bg-primary-dark` | `hover:brightness-110` |
| 7 | `dashboard/page.tsx` | 13 | `bg-background-alt` | `bg-background` |
| 8 | `dashboard/page.tsx` | 15 | `border-border` | `border-outline-variant` |
| 9 | `dashboard/page.tsx` | 21,62 | `text-text` | `text-on-surface` |
| 10 | `dashboard/page.tsx` | 27,69 | `text-text-secondary` | `text-on-surface-variant` |
| 11 | `dashboard/page.tsx` | 27 | `bg-surface-elevated` | `bg-surface-container-high` |
| 12 | `dashboard/page.tsx` | 51 | `text-text-inverse` | `text-background` |
| 13 | `dashboard/page.tsx` | 64 | `bg-green-100 text-green-800` | `bg-tertiary/10 text-tertiary` |
| 14 | `dashboard/page.tsx` | 64 | `bg-yellow-100 text-yellow-800` | `bg-secondary/10 text-secondary` |
| 15 | `editor/page.tsx` | 540 | `bg-yellow-500 bg-green-500` | `bg-warning`, `bg-tertiary` |
| 16 | `login/page.tsx` | 217 | Link href=`/login` | Should be `/signup` |

---

## Phase 3 — Stitch Consistency

| Page | Stitch Export Exists | Visual Match | Key Gaps |
|---|---|---|---|
| Landing | `qevora_ai_website_builder` | 🟡 75% | Custom-coded, not pixel-perfect from Stitch. Spirit matches. |
| Login | `login_qevora_ai_1/2` | 🟡 70% | Custom-coded. Two Stitch exports were made; neither was directly used. |
| Signup | None | — | Legacy code. No Stitch export exists. Needs to be created. |
| Dashboard | `qevora_dashboard` | 🔴 15% | App dashboard is a 95-line stub; Stitch export is far more complete. |
| Editor | `qevora_editor_professional_web_builder` | 🟡 65% | Strong visual resemblance. Panel layout matches. |
| Pricing | `pricing_qevora_ai` | 🟡 70% | Custom-coded. Structure matches intent. |
| Templates | `templates_marketplace_qevora` | 🟡 72% | Close. Grid layout is consistent. |

### Stitch Screens With Zero Implementation

| Stitch Screen | Missing Route | Priority |
|---|---|---|
| `404_page_not_found_qevora` | `not-found.tsx` | 🔴 Critical |
| `qevora_ai_generating_your_vision` | Generation loading state | 🔴 Critical |
| `qevora_ai_generation_wizard` | Generation wizard flow | 🔴 Critical |
| `settings_qevora_ai_1/2` | `/settings` | 🟠 High |
| `analytics_dashboard_qevora_ai` | `/analytics` | 🟠 High |
| `billing_qevora_ai` | `/billing` | 🟠 High |
| `domains_qevora_dashboard` | `/domains` | 🟠 High |
| `user_profile_qevora_ai_1/2` | `/profile` | 🟡 Medium |
| `ai_generation_history_qevora` | `/history` | 🟡 Medium |

---

## Phase 4 — Component Architecture

### Existing Components

| Component | Location | State | Issues |
|---|---|---|---|
| `Navbar` | `components/Navbar.tsx` | ✅ Reusable | Mobile menu lacks animation |
| `Footer` | `components/Footer.tsx` | ✅ Reusable | English-only, no `LanguageContext` |
| `Button` | `components/ui.tsx` | ✅ Good | 3 variants, href support |
| `GlassCard` | `components/ui.tsx` | ✅ Good | hover prop controls glass-card vs glass |
| `Input` | `components/ui.tsx` | 🟡 Basic | No validation states, no error display |
| `Section` | `components/ui.tsx` | ✅ Good | Consistent padding/max-width |
| `SectionHeading` | `components/ui.tsx` | ✅ Good | Bilingual-ready |
| `StatusBadge` | `components/ui.tsx` | ✅ Good | Pulse animation |
| `FeatureIcon` | `components/ui.tsx` | ✅ Good | 3 color variants |
| `AmbientShader` | `components/AmbientShader.tsx` | ✅ Good | WebGL, two modes |
| `LanguageProvider` | `components/LanguageContext.tsx` | 🟡 Works | Translations embedded inline; too large |

### Missing Components (Critical)

| Component | Used Where Needed | Type |
|---|---|---|
| `AmbientBackground` | Every page | Layout wrapper |
| `LanguageToggle` | Navbar, Auth pages, Editor | UI primitive |
| `ProtectedRoute` | Dashboard, Editor | Auth guard |
| `ApiClient` | Anywhere API is called | Service |
| `LoadingSpinner` / `Skeleton` | All data-loading states | Feedback |
| `Toast` / `Notification` | Form submissions, errors | Feedback |
| `Modal` / `Dialog` | Delete confirmation, etc. | Overlay |
| `ErrorBoundary` | Page-level crash safety | Infrastructure |
| `PageLayout` | Dashboard inner pages | Layout |
| `Sidebar` | Dashboard, Settings | Navigation |
| `Badge` / `Tag` | Status indicators | UI primitive |
| `Dropdown` | Navbar user menu, selects | UI primitive |

### Components That Are Too Large

| File | Lines | Recommendation |
|---|---|---|
| `editor/page.tsx` | 559 | Split into: `EditorToolbar`, `EditorLeftPanel`, `EditorCanvas`, `EditorRightPanel`, `EditorStatusBar` |
| `page.tsx` (landing) | 442 | Split into: `HeroSection`, `FeaturesSection`, `InteractiveSection`, `TemplatesSection`, `PricingSection`, `CTASection` |
| `LanguageContext.tsx` | 236 | Extract translations to `/src/locales/en.ts` and `/src/locales/ar.ts` |

---

## Phase 5 — Routing Audit

| Route | File | Status | Action |
|---|---|---|---|
| `/` | `page.tsx` | ✅ Working | — |
| `/login` | `login/page.tsx` | 🟡 UI only | Wire to API |
| `/signup` | `signup/page.tsx` | 🟡 Partially wired | Rewrite to match design system |
| `/dashboard` | `dashboard/page.tsx` | 🟡 UI only | Rewrite + wire to API |
| `/editor` | `editor/page.tsx` | 🟡 UI only | Wire to API |
| `/pricing` | `pricing/page.tsx` | ✅ Static | — |
| `/templates` | `templates/page.tsx` | ✅ Static | — |
| `/settings` | ❌ Missing | Stitch export exists | Build Phase 3 |
| `/profile` | ❌ Missing | Stitch export exists | Build Phase 3 |
| `/analytics` | ❌ Missing | Stitch export exists | Build Phase 3 |
| `/billing` | ❌ Missing | Stitch export exists | Build Phase 3 |
| `/domains` | ❌ Missing | Stitch export exists | Build Phase 3 |
| `/history` | ❌ Missing | Stitch export exists | Build Phase 4 |
| `not-found.tsx` | ❌ Missing | Stitch export exists | Build Phase 2 |
| `loading.tsx` | ❌ Missing | No export | Build Phase 2 |
| `error.tsx` | ❌ Missing | No export | Build Phase 2 |

**Broken Link Found:** `login/page.tsx` line 217 — "Get Started" links to `/login` instead of `/signup`.

---

## Phase 6 — Backend Integration Readiness

| Concern | Status | Notes |
|---|---|---|
| **API Client** | 🔴 Missing | No Axios instance, no `lib/api.ts`. Each page would need raw fetch. |
| **Auth Token Storage** | 🔴 Insecure | `signup/page.tsx` stores JWT in `localStorage`. Vulnerable to XSS. Must use `httpOnly` cookies. |
| **Auth Guards** | 🔴 Missing | No `middleware.ts` protecting `/dashboard`, `/editor`. Any user can access them. |
| **Environment Variables** | 🔴 Missing (Frontend) | No `NEXT_PUBLIC_API_URL` in `.env`. The signup form hardcodes `http://localhost:8000`. |
| **State Management** | 🔴 Missing | No Zustand, no Redux, no React Query. All state is `useState`. Cannot manage server state. |
| **Loading States** | 🔴 Missing | No skeleton screens, no spinners. Data arrives or the UI is frozen. |
| **Error Handling** | 🟡 Partial | `signup/page.tsx` has a try/catch. Login page has none. |
| **Optimistic UI** | 🔴 Missing | No optimistic updates anywhere. |
| **Streaming** | 🔴 Missing | No SSE or WebSocket hooks. AI generation is a blocking call. |
| **React Query / SWR** | 🔴 Missing | No caching layer for server data. |

**Readiness Score: 5 / 100** — Frontend is structurally unready for backend integration. The API surface exists on the backend, but there is no client infrastructure to consume it.

---

## Phase 7 — Technical Debt (Ranked)

### 🔴 Critical

| # | Problem | Impact | Effort | Fix |
|---|---|---|---|---|
| C1 | `signup/page.tsx` uses legacy token system + hardcoded colors | Design inconsistency, broken on dark mode | 2h | Full page rewrite |
| C2 | `dashboard/page.tsx` uses entirely wrong token vocabulary | Same as above + light-mode badge colors break dark UI | 2h | Full page rewrite |
| C3 | No `NEXT_PUBLIC_API_URL` environment variable | Every API call hardcodes `localhost:8000` | 15min | Add to `.env`, update signup form |
| C4 | JWT stored in `localStorage` | XSS vulnerability — token theft possible | 1h | Switch to httpOnly cookie via API route |
| C5 | No auth middleware (`middleware.ts`) | Dashboard and Editor are publicly accessible without login | 1h | Add Next.js middleware |
| C6 | No API client (`lib/api.ts`) | Each new integration requires raw fetch with no consistency | 2h | Create Axios instance with interceptors |
| C7 | Broken link: Login "Get Started" → `/login` | New users can't navigate to signup | 2min | Change href to `/signup` |
| C8 | `not-found.tsx` missing | Next.js shows default error page | 30min | Create page from Stitch export |

### 🟠 High

| # | Problem | Impact | Effort | Fix |
|---|---|---|---|---|
| H1 | No state management library | Cannot manage complex server state in editor | 1 day | Add Zustand |
| H2 | `LanguageContext.tsx` embeds all translations inline | Unmaintainable as strings grow, no i18n library support | 2h | Extract to `/locales/en.ts` and `/locales/ar.ts` |
| H3 | `editor/page.tsx` is 559 lines in one component | Impossible to unit test, maintain, or extend | 4h | Split into 5 sub-components |
| H4 | `page.tsx` landing is 442 lines in one component | Same as above | 3h | Split into section components |
| H5 | `pt(en, ar)` inline helper duplicated in 4+ pages | Divergence risk — a translation change requires 4 edits | 1h | Expand `LanguageContext` dictionary |
| H6 | No `loading.tsx` or `error.tsx` | No graceful error or loading states at route level | 1h | Create Next.js special files |
| H7 | 8 routes missing (`/settings`, `/profile`, etc.) | Users have nowhere to manage account | 2–3 days | Build from Stitch exports |
| H8 | `Footer.tsx` has no `LanguageContext` — English only | Arabic users see English footer | 30min | Wrap in `useLanguage`, add translations |

### 🟡 Medium

| # | Problem | Impact | Effort | Fix |
|---|---|---|---|---|
| M1 | Duplicate language toggle UI (3 implementations) | Maintenance burden | 1h | Extract `<LanguageToggle />` |
| M2 | Duplicate AmbientShader wrapper in every page | DRY violation | 30min | Extract `<AmbientBackground />` |
| M3 | All `<img>` tags should be `next/image` | No LCP optimization, no lazy loading | 1h | Replace across all pages |
| M4 | No `React.memo` or `useMemo` anywhere | Unnecessary re-renders in large pages | 2h | Profile then memoize |
| M5 | `"use client"` on every page including static ones | Defeats SSR benefits for Landing/Pricing/Templates | 2h | Refactor static pages to Server Components |
| M6 | Mobile menu in Navbar closes without animation | Jarring UX | 30min | Add transition |

### 🟢 Low

| # | Problem | Impact | Effort | Fix |
|---|---|---|---|---|
| L1 | Root-level `design_md_base64.txt`, `parse_ds.js`, etc. | Clutter, confusion | 5min | Delete |
| L2 | `packages/renderer/src/e2e-runner.js` — no test runner | Dead code | 5min | Delete or configure Jest/Playwright |
| L3 | `Play` icon imported but unused in `page.tsx` and `templates/page.tsx` | Minor bundle bloat | 2min | Remove import |
| L4 | `README.md` is 1 line ("Qevora") | No onboarding docs | 1h | Write setup guide |
| L5 | `ANTHROPIC_API_KEY` exposed in `.env` (committed) | Security risk if repo goes public | 5min | Rotate key, add to `.gitignore` verification |
| L6 | `desktop.ini` in repository root | Windows artifact, shouldn't be tracked | 1min | Add to `.gitignore`, remove |

---

## Phase 8 — Refactoring Roadmap

### Step 1: Emergency Fixes (Day 1 — ~3 hours)
*No features. Only correctness.*
1. Fix broken link: `login/page.tsx` → change `/login` to `/signup`
2. Add `NEXT_PUBLIC_API_URL=http://localhost:8000` to `.env`
3. Delete root-level scratch files: `design_md_base64*.txt`, `parse_ds.js`, `update_ds_payload.js`
4. Remove unused `Play` import from `page.tsx` and `templates/page.tsx`
5. Add `desktop.ini` to `.gitignore`

### Step 2: Design System Normalization (Day 1–2 — ~6 hours)
*Eliminate all legacy tokens. No new features.*
1. Rewrite `signup/page.tsx` — match Login page structure, use full Stitch token system, add `LanguageContext` and `AmbientShader`
2. Rewrite `dashboard/page.tsx` — replace all old token vocabulary with Stitch equivalents, add glassmorphism
3. Fix `editor/page.tsx` line 540 — replace `bg-green-500` / `bg-yellow-500`
4. Fix `footer/Footer.tsx` — add `LanguageContext` support

### Step 3: Shared Component Extraction (Day 2–3 — ~5 hours)
*Improve architecture. No new pages.*
1. Create `components/AmbientBackground.tsx` — extract fixed-position shader wrapper
2. Create `components/LanguageToggle.tsx` — single toggle used by Navbar, Auth, Editor
3. Extract translations from `LanguageContext.tsx` → `/src/locales/en.ts` + `/src/locales/ar.ts`
4. Create `components/LoadingSpinner.tsx` and `components/Skeleton.tsx`
5. Create `not-found.tsx` from Stitch export
6. Create `loading.tsx` and `error.tsx` route files

### Step 4: API Infrastructure (Day 3–4 — ~4 hours)
*The foundation for all backend connectivity.*
1. Create `lib/api.ts` — Axios instance with base URL from env, auth header injection
2. Create `lib/auth.ts` — login, signup, logout, token refresh helpers
3. Create `middleware.ts` — protect `/dashboard`, `/editor`, `/settings`, `/profile`
4. Switch JWT from `localStorage` to `httpOnly` cookie via Next.js API route

### Step 5: Component Decomposition (Day 4–5 — ~6 hours)
*Split monoliths before they grow larger.*
1. Split `editor/page.tsx` into: `EditorToolbar`, `EditorLeftPanel`, `EditorCanvas`, `EditorRightPanel`, `EditorStatusBar`
2. Split `page.tsx` (landing) into section components
3. Add Zustand store for editor schema state

### Step 6: Wire Existing Pages to API (Day 5–7)
*Make the existing UI functional.*
1. Login form → `POST /auth/login`
2. Signup form → `POST /auth/signup` (already partially done, needs cookie migration)
3. Dashboard → `GET /projects`
4. New Project button → `POST /projects`

### Step 7: Build Missing Routes (Week 2)
*From Stitch exports.*
1. `/settings` — from `settings_qevora_ai_1/2`
2. `/profile` — from `user_profile_qevora_ai_1/2`
3. `/analytics` — from `analytics_dashboard_qevora_ai`
4. `/billing` — from `billing_qevora_ai`
5. `/domains` — from `domains_qevora_dashboard`

### Step 8: Server Component Optimization (Week 2–3)
*Performance pass.*
1. Remove `"use client"` from Landing, Pricing, Templates
2. Replace all `<img>` with `next/image`
3. Add `React.memo` to heavy components

---

## Deliverables Summary

### Overall Frontend Score: **54 / 100**

| Metric | Score | Reason |
|---|---|---|
| Design System | 71/100 | 5/7 pages are compliant; 2 are broken |
| Architecture | 58/100 | Good package structure; monolithic pages; no state mgmt |
| UI Consistency | 63/100 | 5 pages look the same; 2 look like a different product |
| Production Readiness | 18/100 | No auth guards, no API client, no error handling |
| Technical Debt | 42/100 | 8 critical/high debt items blocking production |

### Remaining Legacy Files (Must Fix Before Production)
1. `apps/web/src/app/signup/page.tsx` — Full rewrite required
2. `apps/web/src/app/dashboard/page.tsx` — Full rewrite required
3. `design_md_base64.txt` + `design_md_base64_clean.txt` — Delete
4. `parse_ds.js` + `update_ds_payload.js` — Delete
5. `desktop.ini` — Delete + gitignore

### Missing Reusable Components (Build Next)
`AmbientBackground`, `LanguageToggle`, `ProtectedRoute`, `ApiClient (lib/api.ts)`, `LoadingSpinner`, `Skeleton`, `Toast`, `Modal`, `ErrorBoundary`, `PageLayout`, `Sidebar`, `Badge`, `Dropdown`

### Missing Production Features
- Auth guards (`middleware.ts`)
- API abstraction layer
- httpOnly cookie JWT storage
- `not-found.tsx` / `loading.tsx` / `error.tsx`
- 8 application routes (Settings, Profile, Analytics, Billing, Domains, History, Generation Wizard, Generation Loading)
- State management (Zustand)
- React Query for server state

### Prioritized Roadmap
1. **Day 1:** Emergency fixes + delete dead files
2. **Day 1–2:** Rewrite Signup + Dashboard to match design system
3. **Day 2–3:** Extract shared components + create route files
4. **Day 3–4:** Build API client infrastructure + auth guards
5. **Day 4–5:** Decompose monolithic page components
6. **Day 5–7:** Wire login, signup, dashboard to real API
7. **Week 2:** Build Settings, Profile, Analytics, Billing, Domains pages
8. **Week 2–3:** Performance pass — Server Components, next/image, memoization

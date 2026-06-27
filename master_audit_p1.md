# Qevora Master Audit — Part 1 of 2
**Date:** 2026-06-27 | Evidence-based only. No assumptions.

---

## Phase 1 — Repository Architecture

```
Qevora/
├── apps/
│   ├── web/                     Next.js 15 frontend (Port 3000)
│   │   ├── src/app/             App Router pages
│   │   ├── src/components/      5 shared components
│   │   ├── tailwind.config.js   Active design token source of truth
│   │   └── package.json         Dependencies: Next 15, React 19, Lucide, posthog-js
│   └── api/                     FastAPI Python backend (Port 8000)
│       ├── main.py              All route handlers (319 lines)
│       ├── database.py          asyncpg raw SQL (10,229 bytes)
│       ├── generation.py        AI generation logic (13,980 bytes)
│       ├── config.py            JWT config
│       └── requirements.txt     Python deps
│
├── packages/
│   ├── design-system/           @qevora/design-system
│   │   └── src/index.ts         Theme tokens + CSS variable generator (372 lines)
│   │                            Status: BUILT but NOT IMPORTED by any web app page
│   ├── schemas/                 @qevora/schemas
│   │   └── src/index.ts         TypeScript type definitions (8,405 bytes)
│   ├── shared/                  @qevora/shared
│   │   └── src/index.ts         Utility functions, checkContrastAA (2,127 bytes)
│   ├── renderer/                @qevora/qevora-renderer
│   │   └── src/index.tsx        React website renderer (6,389 bytes)
│   │       e2e-runner.js        Standalone test script — no test runner configured
│   │       test-runner.js       Standalone test script — no test runner configured
│   ├── ui/                      @qevora/ui
│   │   └── src/index.tsx        UI components for generated websites (20,205 bytes)
│   │                            NOT imported by any apps/web/src page
│   └── ai-engine/               @qevora/ai-engine
│       └── src/index.ts         AI orchestration (11,376 bytes)
│
├── infrastructure/
│   ├── database/
│   │   ├── schema.prisma        Prisma schema (7,718 bytes)
│   │   ├── seed.ts              DB seeder (1,480 bytes)
│   │   └── migrations/          Migration files
│   └── docker/
│       └── docker-compose.yml   Docker config (315 bytes)
│
├── design/
│   └── stitch/                  29 exported Stitch screen folders + 2 .md files
│
├── docs/                        EMPTY DIRECTORY
├── public/
│   ├── Qevora logo.ico          Used as favicon (270,622 bytes)
│   └── Qevora logo.png          NOT referenced in any source file (67,469 bytes)
│
├── .env                         DATABASE_URL + ANTHROPIC_API_KEY only
├── DESIGN.md                    Design specification (9,024 bytes)
├── turbo.json                   Turborepo pipeline config
├── package.json                 Workspace root, npm workspaces
├── design_md_base64.txt         DEAD — migration scratch file
├── design_md_base64_clean.txt   DEAD — migration scratch file
├── parse_ds.js                  DEAD — one-off utility script
├── update_ds_payload.js         DEAD — one-off utility script
└── desktop.ini                  DEAD — Windows artifact
```

---

## Phase 2 — Route Inventory

All routes verified by listing `apps/web/src/app/`:

| Route | File | Exists | UI Finished | Uses Stitch | API Connected | Notes |
|---|---|---|---|---|---|---|
| `/` | `page.tsx` (442L) | ✅ | ✅ | ✅ | ❌ | Fully Stitch-compliant. Form redirects to `/editor` without API call. |
| `/login` | `login/page.tsx` (235L) | ✅ | ✅ | ✅ | ❌ | Form does `window.location.href="/dashboard"`. No `POST /auth/login` call. |
| `/signup` | `signup/page.tsx` (148L) | ✅ | ❌ | ❌ | ⚠️ | Only page calling a real API. But uses legacy UI, no shared components. |
| `/dashboard` | `dashboard/page.tsx` (95L) | ✅ | ❌ | ❌ | ❌ | Legacy tokens. Hardcoded `useState` mock data. |
| `/editor` | `editor/page.tsx` (559L) | ✅ | ✅ | ✅ | ❌ | Stitch-compliant UI. AI calls are `setTimeout` simulation. |
| `/templates` | `templates/page.tsx` (269L) | ✅ | ✅ | ✅ | ❌ | Static gallery. No backend data. |
| `/pricing` | `pricing/page.tsx` (414L) | ✅ | ✅ | ✅ | ❌ | Fully static. |
| `/settings` | — | ❌ | — | — | — | Stitch export exists. Not built. |
| `/profile` | — | ❌ | — | — | — | Stitch export exists. Not built. |
| `/analytics` | — | ❌ | — | — | — | Stitch export exists. Not built. |
| `/billing` | — | ❌ | — | — | — | Stitch export exists. Not built. |
| `/domains` | — | ❌ | — | — | — | Stitch export exists. Not built. |
| `/history` | — | ❌ | — | — | — | Stitch export exists. Not built. |
| `not-found.tsx` | — | ❌ | — | — | — | Stitch export exists. File missing. |
| `loading.tsx` | — | ❌ | — | — | — | No file. |
| `error.tsx` | — | ❌ | — | — | — | No file. |
| `middleware.ts` | — | ❌ | — | — | — | No auth guard on any route. |

---

## Phase 3 — Stitch Verification Per Page

### `/` Landing
| Check | Result | Evidence |
|---|---|---|
| Stitch tokens | PASS | `bg-background`, `text-on-surface`, `text-primary`, `glass` |
| Typography | PASS | `text-display-lg`, `text-headline-md`, `font-rubik` |
| Glassmorphism | PASS | `glass` class and `glass-card` |
| Responsive | PASS | `md:` breakpoints throughout |
| RTL | PASS | `rtl:` prefix used |
| Rubik | PASS | `font-rubik` class |
| Shared components | PASS | `Navbar`, `Footer`, `Button`, `GlassCard`, `Section`, `AmbientShader`, `LanguageProvider` |
| Raw Tailwind colors | WARNING | Line 218–219: `bg-yellow-500/30`, `bg-green-500/30` |
| **Verdict** | **PASS** | — |

### `/login`
| Check | Result | Evidence |
|---|---|---|
| Stitch tokens | PASS | `bg-background`, `glass`, semantic colors throughout |
| Shared components | PASS | `GlassCard`, `Button`, `AmbientShader`, `LanguageProvider` |
| RTL | PASS | `rtl:` prefix |
| Auth behavior | FAIL | Line 19: `window.location.href="/dashboard"` — no API call |
| **Verdict** | **WARNING** — UI passes, auth mocked |

### `/signup`
| Check | Result | Evidence |
|---|---|---|
| Stitch tokens | FAIL | Line 46: `bg-[#0b0f19]`, `from-indigo-950` |
| Shared components | FAIL | Zero shared components imported |
| RTL | FAIL | No `rtl:` prefix |
| Rubik | FAIL | No `font-rubik` |
| LanguageContext | FAIL | Not imported |
| Raw Tailwind | FAIL | `gray-300/400/500` on 12 lines |
| Invalid tokens | FAIL | `hover:bg-primary-dark`, `text-text-inverse` — not in `tailwind.config.js` |
| **Verdict** | **FAIL** |

### `/dashboard`
| Check | Result | Evidence |
|---|---|---|
| Stitch tokens | FAIL | Uses old vocabulary: `bg-background-alt`, `text-text`, `border-border`, `bg-surface-elevated`, `bg-primary-light`, `text-text-secondary`, `text-text-inverse`, `hover:bg-primary-dark` |
| Shared components | FAIL | Zero shared components imported |
| RTL | FAIL | No `rtl:` prefix |
| Glassmorphism | FAIL | No `glass` class |
| Raw Tailwind | FAIL | Line 64: `bg-green-100 text-green-800`, `bg-yellow-100 text-yellow-800` |
| Real data | FAIL | Hardcoded `useState([{...}, {...}])` |
| **Verdict** | **FAIL** |

### `/editor`
| Check | Result | Evidence |
|---|---|---|
| Stitch tokens | PASS | `bg-background`, `text-on-surface`, `glass`, `text-primary` throughout |
| Shared components | PASS | `LanguageProvider`, `AmbientShader` |
| RTL | PASS | `rtl:` prefix used |
| Raw Tailwind | WARNING | Line 540: `bg-yellow-500`, `bg-green-500` status dots |
| Hardcoded hex | WARNING | Line 283: `bg-[#090b11]` canvas background |
| AI integration | FAIL | Lines 77–108: all AI responses are `setTimeout` simulation |
| **Verdict** | **WARNING** — UI mostly compliant |

### `/templates` and `/pricing`
| Check | Result |
|---|---|
| Stitch tokens | PASS |
| Shared components | PASS |
| RTL | PASS |
| Raw Tailwind | PASS (none found) |
| **Verdict** | **PASS** |

---

## Phase 4 — Missing Screens (Stitch Folder vs Next.js)

Stitch folder verified by `list_dir`. 29 entries total.

| Stitch Export | Next.js Route | Status |
|---|---|---|
| `qevora_ai_website_builder` | `/` | Implemented (custom-coded) |
| `qevora_ai_website_builder_v2` | `/` | Duplicate — Implemented |
| `login_qevora_ai_1` | `/login` | Implemented (custom-coded) |
| `login_qevora_ai_2` | `/login` | Duplicate — Implemented |
| `qevora_editor_professional_web_builder` | `/editor` | Implemented (custom-coded) |
| `qevora_professional_website_editor` | `/editor` | Duplicate — Implemented |
| `pricing_qevora_ai` | `/pricing` | Implemented (custom-coded) |
| `templates_marketplace_qevora` | `/templates` | Implemented (custom-coded) |
| `qevora_dashboard` | `/dashboard` | **Partially Implemented** — Route exists but is a 95-line legacy stub |
| `settings_qevora_ai_1` | `/settings` | **Missing** |
| `settings_qevora_ai_2` | `/settings` | Duplicate — **Missing** |
| `analytics_dashboard_qevora_ai` | `/analytics` | **Missing** |
| `billing_qevora_ai` | `/billing` | **Missing** |
| `domains_qevora_dashboard` | `/domains` | **Missing** |
| `user_profile_qevora_ai_1` | `/profile` | **Missing** |
| `user_profile_qevora_ai_2` | `/profile` | Duplicate — **Missing** |
| `ai_generation_history_qevora` | `/history` | **Missing** |
| `404_page_not_found_qevora` | `not-found.tsx` | **Missing** |
| `qevora_ai_generation_wizard` | No route | **Missing** |
| `qevora_ai_generating_your_vision` | No route | **Missing** |
| `aetheric_intelligence` | No route | Not verified — unknown purpose |
| `qevora` | No route | Not verified — unknown purpose |
| `qevora_digital_ether` | No route | Not verified — unknown purpose |
| `shader_1/2/3/4` | No route | Visual explorations — no route required |
| `three.js` | No route | Visual exploration — no route required |
| `qevora_logo.png` | `public/` | Design asset folder |
| `design.md_1.md` | — | Design spec files |
| `design.md_2.md` | — | Design spec files |

**Count: 9 distinct missing application pages.**

---

## Phase 5 — Component Inventory

### `apps/web/src/components/` — 5 files

```
AmbientShader.tsx   WebGL background (blobs/aurora modes). Used by: /, login, editor, pricing, templates. NOT used by: signup, dashboard.
Navbar.tsx          Top navigation with language toggle + mobile menu. Used by: /, login, pricing, templates. NOT used by: signup, dashboard, editor.
Footer.tsx          Site footer. No LanguageContext — English only. Used by: /, pricing, templates. NOT used by: login, signup, dashboard, editor.
LanguageContext.tsx LanguageProvider + useLanguage hook + translation dictionary. 236 lines. Used by: /, login, editor, pricing, templates. NOT used by: signup, dashboard.
ui.tsx              Shared primitives: Button, GlassCard, Section, SectionHeading, FeatureIcon, StatusBadge, Input. Used by: /, login, pricing, templates. NOT used by: signup, dashboard, editor.
```

### `packages/ui/src/index.tsx` (20,205 bytes)
Contains: Navbar, Hero, Button, Card, Footer, and other components for **generated user websites** (the renderer output). **Zero imports of this file exist in `apps/web/src/`**. Separate domain from platform UI.

### `packages/design-system/src/index.ts` (372 lines)
Exports: `DEFAULT_LIGHT_THEME`, `DEFAULT_DARK_THEME`, `generateCSSVariables()`, `injectThemeCSS()`. **Zero imports of this package exist in `apps/web/src/`**.

### Components That Should Be Extracted (verified by duplication)
| Component | Reason | Currently Duplicated In |
|---|---|---|
| `<LanguageToggle />` | Language button logic present in 3 places | `Navbar.tsx`, `login/page.tsx`, `editor/page.tsx` |
| `<AmbientBackground />` | Wrapper div copy-pasted in 5 pages | `page.tsx`, `login/`, `editor/`, `pricing/`, `templates/` |
| `<StatusBadge variant="published|draft">` | Raw Tailwind badge needed in dashboard | `dashboard/page.tsx` needs it, not extracted |

---

## Phase 6 — Design System Audit

### Two Token Systems Exist — Verified

**System A: `packages/design-system/src/index.ts`**
Token names: `primaryDark`, `primaryLight`, `backgroundAlt`, `surface`, `surfaceElevated`, `text`, `textSecondary`, `textMuted`, `textInverse`, `border`, `borderStrong`
Generates CSS vars: `--color-primary-dark`, `--color-text`, `--color-background-alt`, etc.
**Consumed by: NOTHING in `apps/web/src/`**

**System B: `apps/web/tailwind.config.js`** ← The active system
Token names: `primary`, `secondary`, `tertiary`, `background`, `on-surface`, `on-surface-variant`, `surface-container`, `outline-variant`, `error`
Utility classes: `glass`, `glass-card`, `gradient-text`, `glow-button` (defined in `globals.css`)
**Consumed by: 5 of 7 pages**

### Exact Legacy Violations Found by grep

**Hardcoded hex colors:**
| File | Line | Value |
|---|---|---|
| `signup/page.tsx` | 46 | `bg-[#0b0f19]`, `via-[#0b0f19]` |
| `editor/page.tsx` | 283 | `bg-[#090b11]` |
| `globals.css` | 17 | `background-color: #09090b` (matches `background` token — acceptable) |
| `globals.css` | 18 | `color: #e5e1e4` (matches `on-surface` token — acceptable) |

**Raw Tailwind color classes:**
| File | Lines | Values |
|---|---|---|
| `signup/page.tsx` | 46,58,71,73,82,88,90,99,105,107,116,121,138 | `indigo-950`, `gray-300`, `gray-400`, `gray-500` |
| `dashboard/page.tsx` | 64 | `bg-green-100 text-green-800`, `bg-yellow-100 text-yellow-800` |
| `editor/page.tsx` | 540 | `bg-yellow-500`, `bg-green-500` |
| `page.tsx` | 218–219 | `bg-yellow-500/30`, `bg-green-500/30` |

**Old design-system token names used as Tailwind classes (produce no output):**
All in `dashboard/page.tsx`: `bg-background-alt` (L13), `border-border` (L15,35,59,74,82), `bg-surface-elevated` (L27,30,74,82), `text-text` (L21,36,48,62), `text-text-secondary` (L27,40,49,69), `bg-primary-light` (L24), `text-text-inverse` (L51), `hover:bg-primary-dark` (L51)

Also in `signup/page.tsx`: `text-primary-light` (L54), `hover:bg-primary-dark` (L131), `text-text-inverse` (L131), `hover:text-primary-light` (L140)

**These tokens do not exist in `tailwind.config.js`. They generate no CSS.**

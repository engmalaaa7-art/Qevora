# Qevora Ground Truth Verification — Part 1 of 2
**Date:** 2026-06-27 | No assumptions. Every statement backed by inspected files.

---

## Phase 1 — Repository Inventory

### Applications (verified in `apps/`)
| App | Path | Runtime |
|---|---|---|
| `qevora-web-app` | `apps/web` | Next.js 15, React 19, Tailwind 3.4 |
| Python API | `apps/api` | FastAPI + asyncpg |

### Packages (verified in `packages/`)
| Package | Path | Source File | Purpose |
|---|---|---|---|
| `@qevora/design-system` | `packages/design-system` | `src/index.ts` (372 lines) | Theme tokens, CSS variable generator, `injectThemeCSS()` |
| `@qevora/schemas` | `packages/schemas` | `src/index.ts` (8,405 bytes) | TypeScript types/interfaces |
| `@qevora/shared` | `packages/shared` | `src/index.ts` (2,127 bytes) | Utility functions including `checkContrastAA` |
| `@qevora/qevora-renderer` | `packages/renderer` | `src/index.tsx` (6,389 bytes) + `e2e-runner.js` + `test-runner.js` | React-based website renderer |
| `@qevora/ui` | `packages/ui` | `src/index.tsx` (20,205 bytes) | UI components for generated websites |
| `@qevora/ai-engine` | `packages/ai-engine` | `src/index.ts` (11,376 bytes) | AI orchestration layer |

### Public Routes (verified — all under `apps/web/src/app/`)
`/` · `/login` · `/signup` · `/dashboard` · `/editor` · `/templates` · `/pricing`

**NOT FOUND in filesystem:** `/settings` · `/profile` · `/analytics` · `/billing` · `/domains` · `/history` · `not-found.tsx` · `loading.tsx` · `error.tsx` · `middleware.ts`

### API Routes (verified in `apps/api/main.py`)
`GET /health` · `POST /auth/signup` · `POST /auth/login` · `POST /projects` · `GET /projects` · `DELETE /projects/{id}` · `POST /projects/{id}/generate` · `POST /projects/{id}/edit` · `GET /projects/{id}/schema` · `POST /projects/{id}/publish` · `POST /projects/{id}/domain`

### Shared App Components (verified in `apps/web/src/components/`)
`AmbientShader.tsx` · `Footer.tsx` · `LanguageContext.tsx` · `Navbar.tsx` · `ui.tsx`

**No other files exist in that directory.**

### Design Packages (verified)
There are **two** distinct design systems in the monorepo:
1. `packages/design-system/src/index.ts` — exports `DEFAULT_LIGHT_THEME`, `DEFAULT_DARK_THEME`, `generateCSSVariables()`, `injectThemeCSS()`. Uses token names: `primary`, `primaryDark`, `primaryLight`, `background`, `backgroundAlt`, `surface`, `surfaceElevated`, `text`, `textSecondary`, `border`.
2. `apps/web/tailwind.config.js` — defines Stitch semantic tokens: `primary`, `secondary`, `background`, `on-surface`, `surface-container`, `outline-variant`. **This is what pages actually use.**

**CRITICAL FACT:** Zero files in `apps/web/src/` import from `@qevora/design-system`. The package exists but is **not consumed by any web app page**. Verified by grep: no results for `import.*design-system` or `import.*@qevora` in `apps/web/src/`.

---

## Phase 2 — Per-Route UI Verification

### `/` — `apps/web/src/app/page.tsx` (442 lines)

| Check | Result | Evidence |
|---|---|---|
| Uses Stitch tokens | ✅ PASS | `bg-background`, `text-on-surface`, `text-on-surface-variant`, `text-primary` |
| Uses shared components | ✅ PASS | Imports `Navbar`, `Footer`, `Button`, `GlassCard`, `Section`, `FeatureIcon`, `StatusBadge`, `Input`, `AmbientShader`, `LanguageProvider` |
| Uses LanguageContext | ✅ PASS | Wrapped in `<LanguageProvider>`, uses `useLanguage()` |
| Supports Arabic | ✅ PASS | Uses `t("key")` from context |
| Supports RTL | ✅ PASS | Uses `rtl:` Tailwind prefix |
| Rubik font | ✅ PASS | `font-rubik` class present |
| Legacy code | ⚠️ WARNING | Line 218: `bg-yellow-500/30`, Line 219: `bg-green-500/30` used as decorative status dots |
| Duplicate logic | ⚠️ WARNING | Does NOT use `const pt = ...` but uses `t()` from context correctly |
| **Overall** | **PASS** | — |

### `/login` — `apps/web/src/app/login/page.tsx` (235 lines)

| Check | Result | Evidence |
|---|---|---|
| Uses Stitch tokens | ✅ PASS | `bg-background`, `glass`, `text-on-surface-variant` throughout |
| Uses shared components | ✅ PASS | `GlassCard`, `Button`, `AmbientShader`, `LanguageProvider` |
| Uses LanguageContext | ✅ PASS | Wrapped in `<LanguageProvider>` |
| Supports Arabic | ⚠️ WARNING | Uses inline `const pt = (en, ar) => ...` (line 14) instead of context dictionary |
| Supports RTL | ✅ PASS | `rtl:` prefix used |
| Rubik font | ✅ PASS | `font-rubik` used |
| Auth behavior | 🔴 FAIL | Line 19: `window.location.href = "/dashboard"` — no API call, hardcoded redirect |
| **Overall** | **WARNING** | Auth is mocked |

### `/signup` — `apps/web/src/app/signup/page.tsx` (148 lines)

| Check | Result | Evidence |
|---|---|---|
| Uses Stitch tokens | 🔴 FAIL | Line 46: `bg-[#0b0f19]`, `from-indigo-950` |
| Uses shared components | 🔴 FAIL | No import of `Navbar`, `Footer`, `GlassCard`, `Button`, `AmbientShader`, `Section` |
| Uses LanguageContext | 🔴 FAIL | Not imported, not used |
| Supports Arabic | 🔴 FAIL | English-only, no translation |
| Supports RTL | 🔴 FAIL | No `rtl:` prefix anywhere |
| Rubik font | 🔴 FAIL | No `font-rubik` class |
| Gray Tailwind classes | 🔴 FAIL | Lines 58, 71, 73, 82, 88, 90, 99, 105, 107, 116, 121, 138 — `text-gray-300/400/500`, `placeholder-gray-500` |
| Invalid tokens | 🔴 FAIL | Line 131: `hover:bg-primary-dark text-text-inverse` — these tokens do not exist in `tailwind.config.js` |
| Security | 🔴 FAIL | Lines 35–36: JWT stored in `localStorage` |
| API hardcoded | 🔴 FAIL | Line 20: `fetch("http://localhost:8000/auth/signup")` |
| **Overall** | **FAIL** | Complete legacy implementation |

### `/dashboard` — `apps/web/src/app/dashboard/page.tsx` (95 lines)

| Check | Result | Evidence |
|---|---|---|
| Uses Stitch tokens | 🔴 FAIL | Uses old `@qevora/design-system` CSS variable names: `bg-background-alt` (L13), `border-border` (L15), `bg-surface-elevated` (L27,30,74,82), `text-text` (L21,36,48,62), `text-text-secondary` (L27,40,49,69), `bg-primary-light` (L24), `text-text-inverse` (L51), `hover:bg-primary-dark` (L51) |
| Uses shared components | 🔴 FAIL | None imported — no `Navbar`, `GlassCard`, `Button`, `AmbientShader` |
| Uses LanguageContext | 🔴 FAIL | Not imported |
| Supports Arabic | 🔴 FAIL | English-only |
| Supports RTL | 🔴 FAIL | No `rtl:` prefix |
| Glassmorphism | 🔴 FAIL | No `glass` class anywhere |
| Raw Tailwind | 🔴 FAIL | Line 64: `bg-green-100 text-green-800` / `bg-yellow-100 text-yellow-800` |
| Real data | 🔴 FAIL | Lines 7–10: `useState([{ hardcoded project data }])` |
| **Overall** | **FAIL** | Complete legacy implementation |

### `/editor` — `apps/web/src/app/editor/page.tsx` (559 lines)

| Check | Result | Evidence |
|---|---|---|
| Uses Stitch tokens | ✅ PASS | `bg-background`, `text-on-surface`, `text-primary`, `glass` throughout |
| Uses shared components | ✅ PASS | `LanguageProvider`, `AmbientShader` imported |
| Uses LanguageContext | ✅ PASS | Wrapped in `<LanguageProvider>` |
| Supports Arabic | ⚠️ WARNING | Uses inline `const pt = (en, ar) => ...` (line 50) |
| Supports RTL | ✅ PASS | `rtl:` prefix used |
| Raw Tailwind | ⚠️ WARNING | Line 540: `bg-yellow-500 animate-pulse` / `bg-green-500` status dots |
| Hardcoded canvas bg | ⚠️ WARNING | Line 283: `bg-[#090b11]` — hardcoded canvas background |
| Real AI | 🔴 FAIL | AI commands handled by `setTimeout` mock (lines 77–108) |
| **Overall** | **WARNING** | Mostly compliant, minor violations |

### `/templates` — `apps/web/src/app/templates/page.tsx` (269 lines)

| Check | Result | Evidence |
|---|---|---|
| Uses Stitch tokens | ✅ PASS | `bg-background`, `text-on-surface-variant`, `glass`, `text-primary` |
| Uses shared components | ✅ PASS | `Navbar`, `Footer`, `Button`, `GlassCard`, `Section`, `AmbientShader`, `LanguageProvider` |
| Uses LanguageContext | ✅ PASS | Wrapped in `<LanguageProvider>` |
| Supports Arabic | ⚠️ WARNING | Uses inline `const pt = (en, ar) => ...` (line 17) |
| Supports RTL | ✅ PASS | `rtl:` prefix used |
| Legacy code | ✅ PASS | None found |
| **Overall** | **PASS** | — |

### `/pricing` — `apps/web/src/app/pricing/page.tsx` (414 lines)

| Check | Result | Evidence |
|---|---|---|
| Uses Stitch tokens | ✅ PASS | Full semantic token usage throughout |
| Uses shared components | ✅ PASS | All shared components used |
| Uses LanguageContext | ✅ PASS | Wrapped in `<LanguageProvider>` |
| Supports Arabic | ⚠️ WARNING | Uses inline `const pt = (en, ar) => ...` (line 21) |
| Supports RTL | ✅ PASS | `rtl:` prefix used |
| Legacy code | ✅ PASS | None found |
| **Overall** | **PASS** | — |

---

## Phase 3 — Legacy Scan (Exact File + Line)

### Hardcoded Hex Colors
| File | Line | Value |
|---|---|---|
| `signup/page.tsx` | 46 | `bg-[#0b0f19]` |
| `signup/page.tsx` | 46 | `via-[#0b0f19]` |
| `editor/page.tsx` | 283 | `bg-[#090b11]` |

### Raw Tailwind Colors
| File | Line | Value |
|---|---|---|
| `signup/page.tsx` | 46 | `from-indigo-950` |
| `signup/page.tsx` | 58 | `text-gray-400` |
| `signup/page.tsx` | 71 | `text-gray-300` |
| `signup/page.tsx` | 73 | `text-gray-500` |
| `signup/page.tsx` | 82 | `placeholder-gray-500` |
| `signup/page.tsx` | 88 | `text-gray-300` |
| `signup/page.tsx` | 90 | `text-gray-500` |
| `signup/page.tsx` | 99 | `placeholder-gray-500` |
| `signup/page.tsx` | 105 | `text-gray-300` |
| `signup/page.tsx` | 107 | `text-gray-500` |
| `signup/page.tsx` | 116 | `placeholder-gray-500` |
| `signup/page.tsx` | 121 | `text-gray-500 hover:text-gray-300` |
| `signup/page.tsx` | 138 | `text-gray-400` |
| `dashboard/page.tsx` | 64 | `bg-green-100 text-green-800` |
| `dashboard/page.tsx` | 64 | `bg-yellow-100 text-yellow-800` |
| `editor/page.tsx` | 540 | `bg-yellow-500` / `bg-green-500` |
| `page.tsx` | 218–219 | `bg-yellow-500/30` / `bg-green-500/30` |

### Legacy Design Token Vocabulary (from `packages/design-system` naming)
All occurrences are in `dashboard/page.tsx`:
| Line | Token Used |
|---|---|
| 13 | `bg-background-alt` |
| 15, 35, 59 | `border-border` |
| 15 | `bg-surface` |
| 24 | `bg-primary-light` |
| 27, 30, 74, 82 | `bg-surface-elevated` |
| 27, 30, 74, 82 | `hover:bg-surface-elevated` |
| 21, 36, 48, 62 | `text-text` |
| 27, 40, 49, 69 | `text-text-secondary` |
| 51 | `hover:bg-primary-dark` / `text-text-inverse` |

Also in `signup/page.tsx`:
| Line | Token Used |
|---|---|
| 54 | `text-primary-light` |
| 131 | `hover:bg-primary-dark` / `text-text-inverse` |
| 140 | `hover:text-primary-light` |

### Duplicate Utility Functions
`const pt = (en: string, ar: string) => (language === "ar" ? ar : en)` appears in:
- `login/page.tsx` line 14
- `editor/page.tsx` line 50
- `templates/page.tsx` line 17
- `pricing/page.tsx` line 21

### Security Issues
- `signup/page.tsx` lines 35–36: `localStorage.setItem("qevora_token", ...)` and `localStorage.setItem("qevora_user_id", ...)`
- `signup/page.tsx` line 20: `fetch("http://localhost:8000/auth/signup")` — hardcoded `localhost`
- `login/page.tsx` line 19: `window.location.href = "/dashboard"` — no API call, bypasses authentication

---

## Phase 4 — Design System Audit

### Two Design Systems Coexist — Verified Fact
The monorepo contains two entirely separate, never-integrated token systems:

**System 1: `packages/design-system/src/index.ts`**
- Exports `DEFAULT_DARK_THEME` with keys: `primaryDark`, `primaryLight`, `background`, `backgroundAlt`, `surface`, `surfaceElevated`, `text`, `textSecondary`, `textMuted`, `textInverse`, `border`, `borderStrong`
- Generates CSS custom properties like `--color-primary-dark`, `--color-text`, `--color-background-alt`
- **NEVER IMPORTED by any file in `apps/web/src/`** — verified by grep

**System 2: `apps/web/tailwind.config.js`**
- Defines Stitch semantic tokens: `primary`, `secondary`, `tertiary`, `background`, `on-surface`, `on-surface-variant`, `surface-container`, `outline-variant`, `error`, `glass` (utility class in `globals.css`)
- **This is the actual active design system**

**The `dashboard/page.tsx` uses System 1 token names in Tailwind classes** (e.g., `bg-background-alt`, `text-text`), which map to neither system because `tailwind.config.js` does not define those names. The result is that these classes produce **no styling output** — they are silently ignored by Tailwind.

---

## Phase 5 — Shared Components Audit

### `apps/web/src/components/` — 5 files total

| Component | File | Used By | Status |
|---|---|---|---|
| `AmbientShader` | `AmbientShader.tsx` | `page.tsx`, `login/`, `editor/`, `pricing/`, `templates/` | ✅ Used |
| `Navbar` | `Navbar.tsx` | `page.tsx`, `login/`, `pricing/`, `templates/` | ✅ Used — NOT used by `dashboard/` or `signup/` |
| `Footer` | `Footer.tsx` | `page.tsx`, `pricing/`, `templates/` | ✅ Used — NOT used by `login/`, `dashboard/`, `signup/` |
| `LanguageContext` | `LanguageContext.tsx` | `page.tsx`, `login/`, `editor/`, `pricing/`, `templates/` | ✅ Used — NOT used by `dashboard/` or `signup/` |
| `ui.tsx` | `ui.tsx` | `page.tsx`, `login/`, `pricing/`, `templates/` | ✅ Used — NOT used by `dashboard/`, `signup/`, or `editor/` |

**Verified missing usages:** `dashboard/page.tsx` and `signup/page.tsx` import **zero** shared components.

### `packages/ui/src/index.tsx` — 20,205 bytes
This is the renderer UI library for **generated websites**. Contains components like `Navbar`, `Hero`, `Button`, `Card` — designed for end-user websites, not the Qevora platform. Not imported by any `apps/web/src/` page.

### Should Be Extracted (Verified by Duplication)
1. **`<LanguageToggle />`** — Language toggle button logic duplicated in `Navbar.tsx`, `login/page.tsx`, and `editor/page.tsx`
2. **`<AmbientBackground />`** — The wrapper `<div className="fixed inset-0 z-0 pointer-events-none opacity-XX">` is copy-pasted in 5 pages

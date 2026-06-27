# Qevora UI Migration Audit Report
**Date:** 2026-06-27 | **Auditor:** Lead Software Architect

---

## Executive Finding

> **The old UI has NOT been fully removed.** The project is in a mixed state: some pages have been cleanly rewritten against the Stitch/Qevora Design System, while others still contain legacy patterns, hardcoded values, and inconsistencies. The project also has 29 Stitch screen exports sitting dormant in `/design/stitch/` that have **never been integrated** into the actual app.

---

## 1. Old UI Removal Status

### ✅ Files That Have Been Properly Replaced
These files align with the Stitch design system and Qevora tokens:

| File | Status |
| :--- | :--- |
| `apps/web/src/app/page.tsx` (Landing) | ✅ Fully rewritten |
| `apps/web/src/app/pricing/page.tsx` | ✅ Fully rewritten |
| `apps/web/src/app/templates/page.tsx` | ✅ Fully rewritten |
| `apps/web/src/app/editor/page.tsx` | ✅ Fully rewritten |
| `apps/web/src/app/login/page.tsx` | ✅ Fully rewritten |
| `apps/web/src/components/Navbar.tsx` | ✅ Clean, uses tokens |
| `apps/web/src/components/Footer.tsx` | ✅ Clean, uses tokens |
| `apps/web/src/components/ui.tsx` | ✅ Clean shared library |
| `apps/web/src/app/globals.css` | ✅ Clean Stitch design tokens |
| `apps/web/tailwind.config.js` | ✅ Full Stitch semantic token mapping |

### 🔴 Legacy Files Still Present

| File | Issue |
| :--- | :--- |
| `apps/web/src/app/signup/page.tsx` | **Critical legacy remnant.** Hardcoded `bg-[#0b0f19]`, raw `gray-300`, `gray-400`, `gray-500` Tailwind classes, no `LanguageContext`, no RTL support, and uses raw `localStorage` token storage. Entirely inconsistent with all other pages. |
| `apps/web/src/app/dashboard/page.tsx` | **Partially legacy.** Uses non-token badge colors: `bg-green-100 text-green-800`, `bg-yellow-100 text-yellow-800`. Not glassmorphic. Missing `LanguageContext`. |

### 🔴 Dormant Stitch Screens Never Integrated

The `/design/stitch/` directory contains **29 exported Stitch screen folders** that have never been imported or used:

```
design/stitch/
  404_page_not_found_qevora/          ← NOT implemented in app
  ai_generation_history_qevora/       ← NOT implemented
  analytics_dashboard_qevora_ai/      ← NOT implemented
  billing_qevora_ai/                  ← NOT implemented
  domains_qevora_dashboard/           ← NOT implemented
  login_qevora_ai_1/                  ← NOT implemented
  login_qevora_ai_2/                  ← NOT implemented (TWO versions)
  settings_qevora_ai_1/               ← NOT implemented
  settings_qevora_ai_2/               ← NOT implemented (TWO versions)
  qevora_dashboard/                   ← NOT implemented
  qevora_editor_professional_web_builder/ ← NOT implemented
  qevora_professional_website_editor/ ← NOT implemented (DUPLICATE)
  qevora_ai_generation_wizard/        ← NOT implemented
  qevora_ai_generating_your_vision/   ← NOT implemented
  templates_marketplace_qevora/       ← NOT implemented
  user_profile_qevora_ai_1/           ← NOT implemented
  user_profile_qevora_ai_2/           ← NOT implemented (TWO versions)
  pricing_qevora_ai/                  ← NOT implemented
  aetheric_intelligence/              ← Unknown, unused
  qevora/                             ← Unknown, unused
  qevora_digital_ether/               ← Unknown, unused
  qevora_ai_website_builder/          ← Unknown, unused
  qevora_ai_website_builder_v2/       ← Unknown, unused (DUPLICATE)
  shader_1/ shader_2/ shader_3/ shader_4/ ← WebGL/shader art, unused
  three.js/                           ← three.js exploration, unused
```

**This is the biggest gap in the migration.** The Stitch tool produced screens for Analytics, Billing, Domains, Settings, User Profile, 404, Generation History, and Generation Wizard — none of which exist as routes in the Next.js app.

---

## 2. Stitch Integration Status

### Pages That Exist in the App

| Route | Has Stitch Export? | Integrated? | Match Quality |
| :--- | :--- | :--- | :--- |
| `/` (Landing) | Yes (`qevora_ai_website_builder`) | 🟡 Partial | Custom-written, not directly lifted from Stitch. Close in spirit but not pixel-perfect. |
| `/login` | Yes (2 exports: `login_qevora_ai_1`, `_2`) | 🟡 Partial | App has a login page, but it is custom-coded, not matching either Stitch export. |
| `/signup` | None | 🔴 No export exists | Legacy code. |
| `/dashboard` | Yes (`qevora_dashboard`) | 🔴 Not matched | Dashboard is a minimal 95-line hardcoded stub. The Stitch export is far more complete. |
| `/editor` | Yes (2 exports: `qevora_editor_professional_web_builder`, `qevora_professional_website_editor`) | 🟡 Partial | Editor is custom-coded, not from Stitch. |
| `/pricing` | Yes (`pricing_qevora_ai`) | 🟡 Partial | Custom-coded. Not matched to the Stitch export. |
| `/templates` | Yes (`templates_marketplace_qevora`) | 🟡 Partial | Custom-coded. Not matched to the Stitch export. |

### Pages With Stitch Exports But NO App Route

| Stitch Screen | Missing App Route | Priority |
| :--- | :--- | :--- |
| `404_page_not_found_qevora` | `/not-found.tsx` or `error.tsx` | Critical |
| `analytics_dashboard_qevora_ai` | `/analytics` | High |
| `billing_qevora_ai` | `/billing` | High |
| `domains_qevora_dashboard` | `/domains` | High |
| `settings_qevora_ai_1/2` | `/settings` | High |
| `user_profile_qevora_ai_1/2` | `/profile` | Medium |
| `ai_generation_history_qevora` | `/history` | Medium |
| `qevora_ai_generation_wizard` | Generation wizard flow | Critical |
| `qevora_ai_generating_your_vision` | Loading/generating state | Critical |

---

## 3. Design System Compliance

### `tailwind.config.js` — Stitch Token Implementation

| Token Category | Status | Notes |
| :--- | :--- | :--- |
| **Colors** | ✅ Excellent | Full Stitch semantic token mapping including all surface tiers, primary/secondary/tertiary, outline, error. |
| **Typography** | ✅ Excellent | Custom type scale: `display-lg`, `headline-xl/lg/md`, `body-lg/md/sm`, `label-sm/xs`. |
| **Spacing** | ✅ Good | Stack-based system: `stack-xs/sm/md/lg/xl`, `gutter`, `margin-mobile/desktop`. |
| **Border Radius** | ✅ Good | `xl=12px`, `2xl=24px`, `3xl=32px`, `full`. |
| **Shadows** | ✅ Good | `glow`, `glow-lg`, `glow-sm`, `glass`, `ambient`. |
| **Animations** | ✅ Good | `text-shine`, `float`, `pulse-glow` with proper keyframes. |
| **Dark Mode** | ✅ Implemented | `darkMode: "class"`, root HTML has `dark` class. |
| **Font** | ✅ Rubik | Loaded via `next/font/google` with Latin+Arabic subsets. |

### Page-Level Compliance

| Page | Rubik | Tokens | Glass | RTL Ready | Responsive | Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Landing (`/`) | ✅ | ✅ | ✅ | ✅ | ✅ | **9.5/10** |
| Login | ✅ | ✅ | ✅ | ✅ | ✅ | **9/10** |
| **Signup** | 🟡 | 🔴 | 🟡 | 🔴 | 🟡 | **4/10** |
| **Dashboard** | 🟡 | 🔴 | 🔴 | 🔴 | 🟡 | **4/10** |
| Editor | ✅ | ✅ | ✅ | ✅ | ✅ | **8.5/10** |
| Pricing | ✅ | ✅ | ✅ | ✅ | ✅ | **9/10** |
| Templates | ✅ | ✅ | ✅ | ✅ | ✅ | **9/10** |

### Specific Violations Found

1. **`signup/page.tsx` line 46:**
   ```
   bg-[#0b0f19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950
   ```
   → Should use `bg-background` + ambient shader. Hardcoded hex and `indigo-950` are off-token.

2. **`signup/page.tsx` lines 58, 71, 88, 105, 138:**
   ```
   text-gray-400, text-gray-300, text-gray-500, placeholder-gray-500
   ```
   → All must be replaced with `text-on-surface-variant` or `text-on-surface`.

3. **`dashboard/page.tsx` lines 63-66:**
   ```
   bg-green-100 text-green-800, bg-yellow-100 text-yellow-800
   ```
   → Must be replaced with semantic tokens. These are light-mode Tailwind defaults that break the dark glassmorphic theme.

4. **`signup/page.tsx` line 131:**
   ```
   hover:bg-primary-dark text-text-inverse
   ```
   → `primary-dark` and `text-inverse` are not valid tokens in the Tailwind config. This will silently fail (no styles applied).

---

## 4. Routing Audit

| Route | File Exists? | Status | Issues |
| :--- | :--- | :--- | :--- |
| `/` | ✅ | Working | — |
| `/login` | ✅ | Working (mocked) | Form submits to `window.location.href = "/dashboard"` — not calling API |
| `/signup` | ✅ | Working (partially wired) | **Only page calling real API** (`http://localhost:8000/auth/signup`) |
| `/dashboard` | ✅ | Working (hardcoded data) | No API calls |
| `/editor` | ✅ | Working (mocked) | No real backend |
| `/pricing` | ✅ | Working | Static |
| `/templates` | ✅ | Working | Static |
| `/settings` | 🔴 **MISSING** | No route | Stitch exports exist |
| `/profile` | 🔴 **MISSING** | No route | Stitch exports exist |
| `/analytics` | 🔴 **MISSING** | No route | Stitch exports exist |
| `/billing` | 🔴 **MISSING** | No route | Stitch exports exist |
| `/domains` | 🔴 **MISSING** | No route | Stitch exports exist |
| `/history` | 🔴 **MISSING** | No route | Stitch exports exist |
| `404` | 🔴 **MISSING** | No `not-found.tsx` | Stitch export exists |
| `loading.tsx` | 🔴 **MISSING** | No skeleton/loading state | — |
| `error.tsx` | 🔴 **MISSING** | No error boundary page | — |

**Broken Link Found:** In `login/page.tsx` line 217, the "Get Started" footer link incorrectly points to `/login` instead of `/signup`:
```tsx
<a href="/login" className="text-primary font-bold hover:underline">
  {pt("Get Started", "ابدأ الآن")}
</a>
```

---

## 5. Component Audit

### Shared Component Libraries

The project has **two separate Button implementations** — a critical duplication:

| Location | Type | Variants | Used By |
| :--- | :--- | :--- | :--- |
| `apps/web/src/components/ui.tsx` → `Button` | App-level | `glow`, `outline`, `ghost` | Landing, Pricing, Templates, Login, Editor |
| `packages/ui/src/index.tsx` → `Button` | Package-level | `primary`, `secondary`, `outline`, `gradient` | Renderer components (Navbar, Hero, etc.) |

**These two Button components have completely different APIs and styles.** They should be unified into a single source of truth.

### Duplicate/Redundant Patterns

| Pattern | Locations | Problem |
| :--- | :--- | :--- |
| **Bilingual helper** `pt(en, ar)` | Inline in 4+ pages | Duplicated. Should be one hook (`useLanguage().t()`) |
| **Language toggle button** | `Navbar.tsx` AND `login/page.tsx` AND `editor/page.tsx` | Three different implementations |
| **`AmbientShader`** wrapper div | Landing, Login, Editor, Pricing, Templates | Copy-pasted `<div className="fixed inset-0 z-0 pointer-events-none opacity-40">` in every page. Should be a layout component. |
| **Glass card pattern** | Inline in many pages AND `ui.tsx` GlassCard | Sometimes inline, sometimes via component |

### Recommendations to Merge

1. **Create `components/AmbientBackground.tsx`** — wraps the fixed-position shader with standard opacity/z-index settings.
2. **Unify Button** — merge `packages/ui/src/index.tsx:Button` and `components/ui.tsx:Button` into one, with all variants.
3. **Standardize language toggle** — single `<LanguageToggle />` component consumed by Navbar and all auth pages.

---

## 6. Assets Audit

### Used Assets
| Asset | Location | Status |
| :--- | :--- | :--- |
| `Qevora logo.png` | `/public/` | Present but **not used** in any `<img>` or `next/image` tag in the app. The Navbar uses a text "Qevora" gradient. |
| `Qevora logo.ico` | `/public/` | Present. Used as favicon. |
| Rubik font | `next/font/google` | Correct — no local font files needed. |

### Unused Assets
- **`/public/Qevora logo.png`** — Exists but is not referenced anywhere in the application. The brand relies on a CSS `gradient-text` text logo. Should either be integrated into the Navbar or removed.
- **`/design_md_base64.txt`** and **`/design_md_base64_clean.txt`** — Root-level scratch files from the Stitch upload process. Dead artifacts that should be deleted.
- **`/parse_ds.js`** and **`/update_ds_payload.js`** — Root-level utility scripts for interacting with the Stitch API. Not part of the app. Should be moved to a `/scripts/` folder or removed.

### Template Images
All template/feature images are Unsplash CDN URLs embedded in code. These are fine for prototyping, but for production they should be:
1. Downloaded and stored in a proper CDN/S3 bucket.
2. Served via `next/image` for optimization.

---

## 7. Code Quality

### Unused Files / Dead Code

| File | Issue |
| :--- | :--- |
| `/design_md_base64.txt` | Scratch file, delete |
| `/design_md_base64_clean.txt` | Scratch file, delete |
| `/parse_ds.js` | Dev utility script, not a source file |
| `/update_ds_payload.js` | Dev utility script, not a source file |
| `packages/renderer/src/e2e-runner.js` | Standalone test script, no test runner configured |
| `packages/renderer/src/test-runner.js` | Standalone test script, no test runner configured |

### Large Components
| File | Lines | Issue |
| :--- | :--- | :--- |
| `apps/web/src/components/LanguageContext.tsx` | 236 | Translations dictionary is embedded directly in the context file. Should be extracted to `/src/locales/en.ts` and `/src/locales/ar.ts`. |
| `apps/web/src/app/editor/page.tsx` | 559 | Massive monolith. Should be split into `EditorHeader`, `EditorLeftPanel`, `EditorCanvas`, `EditorRightPanel`, `EditorFooter`. |
| `apps/web/src/app/page.tsx` | 442 | Large. Could be split into section components. |

### Unused Imports
- `apps/web/src/app/page.tsx` imports `Play` from `lucide-react` — not used on the Landing page.
- `apps/web/src/app/templates/page.tsx` imports `Play` — not used.

### Technical Debt
1. **`localStorage` for JWT** in `signup/page.tsx`: `localStorage.setItem("qevora_token", ...)` — vulnerable to XSS. Should use `httpOnly` cookies.
2. **`label-md` type error**: In `dashboard/page.tsx`, the `text-primary-light` and `text-text` classes do not exist in the Tailwind config. They will silently produce no output.
3. **Missing `next/image`**: All `<img>` tags across the app should be `<Image>` from `next/image` for Largest Contentful Paint optimization.

---

## 8. Migration Scores

| Category | Score | Justification |
| :--- | :---: | :--- |
| **UI Migration** | **62 / 100** | 5/7 pages well migrated. Signup and Dashboard are untouched. 29 Stitch screens never imported. |
| **Design Consistency** | **72 / 100** | Great on main pages. Signup breaks the entire system. Duplicate component APIs. |
| **Maintainability** | **65 / 100** | Good token system. However, duplicated Button, inline language helpers, and massive page files hurt maintainability. |
| **Scalability** | **60 / 100** | Missing 8+ routes. No error/loading states. State management is local `useState` everywhere. |
| **Production Readiness** | **20 / 100** | Missing critical routes, no 404 page, broken signup link, localStorage JWT, zero API integration. |

---

## 9. Final Conclusion

### Has the Old UI Been Completely Removed?
**No.** Two pages — `signup/page.tsx` and `dashboard/page.tsx` — are clear legacy artifacts:
- `signup/page.tsx` uses hardcoded hex colors, raw Tailwind `gray-*` classes, no RTL, and no `LanguageContext`.
- `dashboard/page.tsx` uses invalid tokens (`primary-light`, `text-text`) and non-dark-mode badge colors.

### Does the Project Fully Use the Stitch UI?
**No.** The 29 exported Stitch screens in `/design/stitch/` have never been consumed by the application. The current pages were custom-coded by hand to match the visual style but do not constitute a "Stitch integration." There are critical screens (Settings, Profile, Analytics, Billing, Domains, 404, Generation Wizard) that exist in Stitch but have zero corresponding routes in Next.js.

### Is the Frontend Ready for Backend Integration?
**No, and for specific, fixable reasons:**
1. The login form `onSubmit` redirects to `/dashboard` without calling any API.
2. The dashboard shows hardcoded project data, not data from `/projects`.
3. The signup form calls `localhost:8000` correctly, but stores the JWT in `localStorage` (security risk).
4. There is no token refresh, no auth guard on protected routes, and no error state handling.

### Priority Fix List
1. 🔴 **Rewrite `signup/page.tsx`** to match the Stitch design system.
2. 🔴 **Create missing routes**: `/not-found.tsx`, `loading.tsx`, `error.tsx`.
3. 🔴 **Implement missing app routes**: `/settings`, `/profile`, `/analytics`, `/billing`, `/domains`.
4. 🔴 **Fix broken link**: Login page "Get Started" points to `/login` instead of `/signup`.
5. 🟡 **Unify Button components** between `components/ui.tsx` and `packages/ui`.
6. 🟡 **Delete root-level scratch files**: `design_md_base64*.txt`, `parse_ds.js`, `update_ds_payload.js`.
7. 🟡 **Extract translations** from `LanguageContext.tsx` into locale files.
8. 🟡 **Move JWT to httpOnly cookie** in signup/login flows.

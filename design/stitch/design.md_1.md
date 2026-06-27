---
name: Qevora Enterprise
colors:
  surface: '#111217'
  surface-dim: '#0D0E12'
  surface-bright: '#272A34'
  surface-container-lowest: '#09090B'
  surface-container-low: '#111217'
  surface-container: '#171A21'
  surface-container-high: '#20222B'
  surface-container-highest: '#2D303E'
  on-surface: '#F8FAFB'
  on-surface-variant: '#9CA3AF'
  inverse-surface: '#F9FAFB'
  inverse-on-surface: '#111217'
  outline: '#4B5563'
  outline-variant: '#374151'
  surface-tint: '#C8BFFF'
  primary: '#C8BFFF'
  on-primary: '#2D009D'
  primary-container: '#6D28D9'
  on-primary-container: 'F5F3FF'
  inverse-primary: '#4C1D95'
  secondary: '#44F1BC'
  on-secondary: '#003828'
  secondary-container: '#047857'
  on-secondary-container: '#ECFFDF5'
  tertiary: '#FFB955'
  on-tertiary: '#452B00'
  tertiary-container: '#B45309'
  on-tertiary-container: 'FEF3C7'
  error: '#FFB4AB'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#FFDAD6'
  background: '#09090B'
  on-background: '#F9FAFB'
  surface-variant: '#171A21'
typography:
  display-lg:
    fontFamily: Rubik
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 76px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Rubik
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Rubik
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Rubik
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Rubik
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Rubik
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  container-max: 1440px
---

# Qevora Enterprise Design System


Qevora is an AI-powered website builder that transforms natural language prompts into high-conversion, responsive, and bilingual websites. The design system provides the visual language, design tokens, UI components, layouts, interactions, and accessibility guidelines to deliver a modern, premium SaaS experience.

---

## 1. Brand Identity & Visual Style
The Qevora brand personality is rooted in **Minimalist Luxury** and **Futuristic Precision**. It targets startups, agencies, creators, SaaS companies, and modern businesses who demand pixel-perfect accuracy and high-performance workflows.

### Visual Pillars:
* **Glassmorphism:** Strategic use of translucency (`backdrop-blur` and low-opacity borders) to create structural depth.
* **Luminous Contrast:** Deep space backgrounds (`#09090B`) contrasted with vibrant radial gradients, interactive glows, and high-contrast text.
* **Atmospheric Gradients:** Shifting dual-color linear gradients (Electric Purple to Cyan) represent the dynamic "AI creation engine."
* **Oversized Curves:** Soft rounded corners (up to `2rem`) to humanize the high-tech interface and make it approachable.

---

## 2. Complete Design Tokens

### A. Color System
The colors are split into semantic tiers and neutral scales, designed for strict contrast check compliance (WCAG AA).

* **Primary Background (#09090B):** The foundation. Pure, deep, and ink-like.
* **Secondary Surface (#111217):** Used for sidebars, navigation bars, and secondary grouping.
* **Elevated Cards (#171A21):** The interactive layer, designed to catch light and define hierarchy.
* **Accents:** 
    * **Electric Violet (#6C4DFF):** The primary action color for buttons, active states, and AI creations.
    * **Neon Mint (#44F1BC):** Secondary actions, success states, and live indicators.
    * **Amber Spark (#FFB955):** Premium highlights, warnings, and Pro-tier attributes.

---

### B. Typography (Rubik)
The font family is **Rubik** for all environments. It has geometric curves and a modern feel, looking exceptional in both Arabic and English support.

#### Arabic Typography Rules:
* Line-height must be increased by at least **15%%** compared to English standard.
* Use `font-weight: 500` (Medium) instead of `400` (Regular) for Arabic body text under `14px` to enhance readability.
* Never use italics for Arabic text.

#### English Typography Rules:
* Titles use `letter-spacing: -0.02em` or `-0.03em`.
* Body text utilizes `letter-spacing: 0` with `leading-relaxed` (1.6x line height).

---

### C. Spacing System
Built on a strict **4px grid** for consistent vertical rhythm and page alignment:
* **4px (base):** Padding between label and input field.
* **8px (xs):** Inner grid card padding / spacing between text.
* **16px (sm):** Medium item spacing.
* **24px (md):** Primary layout grid gaps.
* **40px (lg):** Section internal paddings.
* **64px (xl):** Hero element margins and section spacing.

---

### D. Border Radius
* **sm:** `4px` (badges, tags)
* **DEFAULT / md:** `8px` / `12px` (buttons, text fields)
* **lg:** `16px` (dropdown menus, popovers)
* **xl:** `24px` (Standard dashboard panels, primary cards)
* **full:** `9999px` (Pills, avatar boundaries, status rings)

---

### E. Shadow & Elevation System
* **Shadow XS:** `0 1px 2px rgba(0, 0, 0, 0.05)`
* **Shadow SM:** `0 2px 4px rgba(0, 0, 0, 0.1)`
* **Shadow MD:** `0 4px 12px rgba(0, 0, 0, 0.15)`
* **Shadow LG:** `0 8px 24px rgba(0, 0, 0, 0.2)`
* **Shadow XL:** `0 16px 40px rgba(0, 0, 0, 0.25)`
* **Shadow 2XL:** `0 24px 60px rgba(0, 0, 0, 0.35)`
* **Glass Shadow:** `0 8px 32px 0 rgba(0, 0, 0, 0.37)`
* **Floating Glow (AI):** `0 0 24px 0 rgba(109, 40, 217, 0.25)` (powered purple state)

---

### F. Animation System
Animations follow three distinct durations:
* **Fast (150ms):** Hover transitions, button clicks, tab selections.
* **Medium (300ms):** Dropdown fade-ins, mobile drawer slide-outs, accordion expansions.
* **Slow (600ms - 1000ms):** Modals opening, AI timeline updates, loading progress filling, hero glows pulsing.

---

### F. Iconography & Grid System
* **Icon Library:** Lucide Icons only.
* **Standard sizes:** `16` (inline labels), `20` (standard inputs/actions), `24` (navigation items), `32` (features/dashboard widgets), `40` (header icons).
* **Grid Breakpoints:**
  * **Desktop:** `1200px+` (12 columns, 24px gutter, 48px margins)
  * **Tablet:** `768px - 1199px` (8 columns, 16px gutter, 24px margins)
  * **Mobile:** `0px - 767px` (4 columns / single column, 12px gutter, 16px margins)

---

## 3. Bilingual Mirroring (LTR/RTL)
The Qevora Design System provides native Arabic and English support. Layout components automatically adjust using logical CSS classes and utility attributes:

1. **Logical properties:** Use `start` and `end` instead of `left` and `right`.
2. **Text alignment:** `text-start` matches `text-left` in LTR and `text-right` in RTL.
3. **Flex flow:** Flex direction transitions naturally based on the `dir` attribute of the parent container.
4. **Icon flip:** Icons representing direction (arrow-right, chevron-right, prompt-send) are flipped automatically: `rtl:rotate-180`.

---

## 4. Reusable Component Specs

### 1. Buttons
* **Primary:** Deep violet fill with top lighting. High contrast.
* **Secondary:** Glass fill with border and white text.
* **Ghost:** No border or fill. High hover visibility.
* **Outline:** Thin border, background appears on hover.
* **Destructive:** Bright red fill for deletions.
* **Gradient:** Beautiful AI gradient backgrounds.

### 2. Inputs
* **Prompt Input:** Large input field with a glowing "AI spark" button and file attachments.
* **OTP Input:** 6 grouped blocks with auto-focus shifting.
* **Switch:** Smooth pill toggle.

### 3. AI & Editor Components
* **AI Chat Bubble:** Clean conversation cards. Assistant response features a pulsing border.
* **Generation Timeline:** Step-by-step checklist showing progress during generation.
* **Canvas Toolbar:** Floating panel displaying section actions (Up, Down, Settings, Delete).
* **Inspector Panel:** Right-hand properties sidebar for spacing, color adjustments, and font updates.

---

## 5. Accessibility (WCAG AA)
1. **Interactive outlines:** Focus states use a clean, double-ring outline (`ring-2 ring-primary ring-offset-2 ring-offset-background`).
2. **Contrast check:** The core background is black, and secondary texts are kept above `4.5:1` contrast ratio.
3. **Screen reader labels:** Crucial buttons (like close buttons or dashboard actions) use `aria-label` tags.
4. **Keyboard controls:** Modals can be closed using the Escape key, and lists support arrow key navigation.

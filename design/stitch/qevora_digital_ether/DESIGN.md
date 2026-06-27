---
name: Qevora AI
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c6c4d8'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#908fa1'
  outline-variant: '#454555'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#0d00aa'
  primary-container: '#5b5fff'
  on-primary-container: '#fffcff'
  inverse-primary: '#4345e8'
  secondary: '#d2bbff'
  on-secondary: '#3f008e'
  secondary-container: '#6001d1'
  on-secondary-container: '#c9aeff'
  tertiary: '#2fd9f4'
  on-tertiary: '#00363e'
  tertiary-container: '#008092'
  on-tertiary-container: '#f7fdff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#05006c'
  on-primary-fixed-variant: '#2623d1'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#a2eeff'
  tertiary-fixed-dim: '#2fd9f4'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e5a'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
  glass-bg: rgba(17, 18, 23, 0.7)
  glass-border: rgba(255, 255, 255, 0.08)
  gradient-start: '#c0c1ff'
  gradient-mid: '#d2bbff'
  gradient-end: '#2fd9f4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.04em
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1440px
---

## Brand & Style
The brand personality is **Futuristic, Visionary, and Hyper-Intelligent**. It targets high-end digital creators and visionary brands who seek the intersection of cutting-edge technology and premium aesthetics. 

The visual style is a sophisticated **Glassmorphic-Neon hybrid**. It utilizes deep dark backgrounds with luminous, vibrant accents and multi-layered translucent surfaces. The emotional response should be one of "effortless power"—the sense that complex AI generation is happening behind a refined, cinematic interface. Movement is key, using slow-moving ambient orbs and shifting gradients to suggest a living, breathing intelligence.

## Colors
The palette is rooted in a "Deep Space" neutral base (`#09090b`), allowing vibrant functional colors to pop. 
- **Primary Indigo** (`#5b5fff`) and **Secondary Violet** (`#7c3aed`) drive the main actions and "Glow" effects.
- **Tertiary Cyan** (`#22d3ee`) acts as a secondary accent for variety in data visualization and highlights.
- **Surface Rendering:** Surfaces are rarely solid; they use semi-transparent dark greys with backdrop blurs to maintain depth.
- **Typography Colors:** High-contrast whites for headlines and soft lavender-greys (`#c6c4d8`) for body text to reduce eye strain in dark mode.

## Typography
The system relies exclusively on **Inter**, utilizing its full weight range to create hierarchy. 
- **Headlines:** Use tight letter-spacing and heavy weights (700+) to feel impactful and modern.
- **Body:** Standard spacing for maximum legibility.
- **Labels:** Uppercase and increased letter-spacing are used for "Future" tags and technical micro-copy.
- **Gradients:** Hero headlines should occasionally use a linear gradient (`gradient-start` to `gradient-end`) to emphasize the AI-driven "creation" aspect.

## Layout & Spacing
The layout follows a **Fixed-Width Centered Grid** for the desktop experience (1440px max) and transitions to a fluid model for mobile.
- **Vertical Rhythm:** Defined by a "stacking" scale. `stack-xl` is used to separate major sections, while `stack-md` handles internal card spacing.
- **Safe Zones:** Generous horizontal margins (48px) ensure content feels cinematic and uncrowded.
- **Grid:** A 12-column system is used, with cards typically spanning 4, 6, or 8 columns to create asymmetrical visual interest.

## Elevation & Depth
Depth is created through **Atmospheric Layering** rather than traditional drop shadows:
- **Level 0 (Background):** Deepest dark (`#09090b`) with animated "Floating Orbs" providing depth-of-field hints.
- **Level 1 (The Glass Layer):** Semi-transparent surfaces (`rgba(17, 18, 23, 0.7)`) with a `20px` backdrop blur. These surfaces use a thin, 1px white border at `8%` opacity to define edges.
- **Level 2 (Interaction):** On hover, glass cards increase in brightness and move slightly upward (-4px), accompanied by a subtle increase in border opacity to `20%`.
- **Glows:** Buttons use "Luminous Shadows"—box shadows that match the button's gradient color at low opacity (e.g., `0px 0px 20px rgba(91, 95, 255, 0.3)`) to simulate a light-emitting source.

## Shapes
The shape language is **Modern and Friendly**, avoiding sharp industrial edges in favor of comfortable curves.
- **Standard Cards:** 1rem (16px) corner radius.
- **Buttons & Inputs:** 0.75rem (12px) for a more compact, tool-like feel.
- **Tags & Badges:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.
- **Decorative Elements:** Use perfectly circular "Orbs" with heavy (80px+) blurs to soften the UI.

## Components
### Buttons
- **Primary (Glow):** Uses a linear gradient (135deg, `primary` to `secondary-container`) with a colored box-shadow glow. High-contrast white text.
- **Secondary (Outline):** 1px border at 10% white with a subtle hover state that fills the background with 5% white.

### Input Fields
- **Search/Prompt Bars:** Large, glassmorphic containers with centered icons. Placeholders should be low-contrast (`on-surface-variant/50`). No visible border except when focused.

### Cards (Glass-Card)
- Transparent background, backdrop blur, and internal padding of `stack-lg` (32px). Icons inside cards should be housed in a soft-colored, low-opacity square container (e.g., `primary/10`).

### Chips/Badges
- Small, uppercase text with extra tracking. Often contains a "Live Pulse" dot (a small circle with a ping animation) to indicate AI activity or status.

### Copilot UI
- A sidebar or floating panel with a distinct dark background (`#0f0f12`), simulating a code editor or terminal environment, contrasting against the more organic landing page.
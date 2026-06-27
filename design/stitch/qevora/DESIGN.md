---
name: Qevora Lumina
colors:
  surface: '#14121c'
  surface-dim: '#14121c'
  surface-bright: '#3a3843'
  surface-container-lowest: '#0e0d17'
  surface-container-low: '#1c1a24'
  surface-container: '#201e29'
  surface-container-high: '#2a2933'
  surface-container-highest: '#35333e'
  on-surface: '#e5e0ef'
  on-surface-variant: '#c9c4d9'
  inverse-surface: '#e5e0ef'
  inverse-on-surface: '#312f3a'
  outline: '#928ea2'
  outline-variant: '#474556'
  surface-tint: '#c8bfff'
  primary: '#c8bfff'
  on-primary: '#2d009d'
  primary-container: '#6c4dff'
  on-primary-container: '#f6f0ff'
  inverse-primary: '#5b38ee'
  secondary: '#44f1bc'
  on-secondary: '#003828'
  secondary-container: '#00d4a2'
  on-secondary-container: '#005640'
  tertiary: '#ffb955'
  on-tertiary: '#452b00'
  tertiary-container: '#996300'
  on-tertiary-container: '#fff0e2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c8bfff'
  on-primary-fixed: '#190064'
  on-primary-fixed-variant: '#4206d7'
  secondary-fixed: '#54fdc7'
  secondary-fixed-dim: '#27e0ac'
  on-secondary-fixed: '#002116'
  on-secondary-fixed-variant: '#00513c'
  tertiary-fixed: '#ffddb5'
  tertiary-fixed-dim: '#ffb955'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#14121c'
  on-background: '#e5e0ef'
  surface-variant: '#35333e'
  background-deep: '#0D1117'
  surface-main: '#14121c'
  glass-fill: rgba(255, 255, 255, 0.03)
  glass-border: rgba(255, 255, 255, 0.1)
  glow-purple: rgba(108, 77, 255, 0.4)
  shimmer-gradient: 'linear-gradient(90deg, #6c4dff, #44f1bc)'
typography:
  display-lg:
    fontFamily: Rubik
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Rubik
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Rubik
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Rubik
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Rubik
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
  caption:
    fontFamily: Rubik
    fontSize: 10px
    fontWeight: '600'
    lineHeight: '1'
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
  sidebar-width: 320px
  container-max: 1440px
---

## Brand & Style
Qevora Lumina is a high-performance, futuristic design system tailored for AI-driven creative tools and developer platforms. The brand personality is **sophisticated, technical, and visionary**, evoking a sense of deep-space exploration and digital precision. 

The visual style is a refined **Glassmorphism** mixed with **Atmospheric Dark Mode**. It relies on high-transparency layers, backdrop blurs, and "luminous outlines" to create depth without heavy drop shadows. The aesthetic is punctuated by vibrant neon accents (Electric Purple and Mint) that signify intelligence and active processes. It aims to make complex data feel lightweight and immersive.

## Colors
The palette is anchored in a monochromatic "Deep Space" background (`#0D1117`), providing a high-contrast canvas for vibrant functional colors. 

- **Primary (Electric Purple):** Used for key actions, brand identity, and active states. It represents the "core" of the AI.
- **Secondary (Neon Mint):** Used for success states, progress indicators, and specialized tech features. It provides a refreshing contrast to the purple.
- **Surface Strategy:** Surfaces use a tiered "Container" approach. Instead of solid fills, use `glass-fill` with `backdrop-filter: blur(12px)` to maintain the sense of depth and translucency.
- **Functional Accents:** Tertiary gold is reserved for alerts or premium "Pro" indicators.

## Typography
We use **Rubik** exclusively to bridge the gap between friendly approachability and technical structure. Its rounded corners complement the "soft-tech" feel of the interface.

- **Display & Headlines:** Use tight letter spacing and bold weights to create impact. These should feel architectural.
- **Body:** Maintain a generous line height (1.5 - 1.6) for readability against dark backgrounds.
- **Labels:** Use medium to semi-bold weights for high legibility at small sizes, particularly within buttons and navigation elements.
- **Scale:** On mobile, large display titles should scale down aggressively to maintain the layout's integrity.

## Layout & Spacing
The system utilizes a **Fixed Grid with Fluid Containers**. 

- **Desktop:** A fixed 320px sidebar anchors the left, with the main content area using a 12-column bento-style grid. Gutters are fixed at 24px (`md`).
- **Mobile:** Transition to a full-width fluid layout with 16px (`sm`) side margins. Navigation reflows to a fixed bottom bar.
- **Bento Grid Logic:** Content cards should span columns based on hierarchy—primary dashboard cards span 8 columns, while sidebars or secondary stats span 4.
- **Vertical Rhythm:** Use the `xl` (64px) unit for section breathing room and `md` (24px) for internal card padding.

## Elevation & Depth
Elevation is expressed through **translucency and luminosity** rather than traditional Y-axis shadows.

- **The Base:** The lowest level is the `#0D1117` background.
- **Glass Cards:** Primary containers use `rgba(255, 255, 255, 0.03)` with a 1px `rgba(255, 255, 255, 0.1)` border.
- **Luminous Outlines:** High-priority cards (like the Profile Header) use a pseudo-element gradient border that fades from the Primary color to transparent, creating a "edge-lit" effect.
- **Active Indicators:** Interactive elements in an active state use a `0 0 15px rgba(108, 77, 255, 0.4)` outer glow (Bloom) to signify energy.

## Shapes
The shape language is **"Modern Rounded."** 

- **Standard Containers:** Use 0.75rem (`rounded-xl`) for main cards to create a soft, premium feel.
- **Interactive Elements:** Buttons and navigation items use 0.5rem (`rounded-lg`).
- **Small Accents:** Chips and badges use `full` (pill) rounding to distinguish them from structural elements.
- **Image Treatment:** Avatars and icons should be circular or have matching 0.5rem rounding to maintain consistency.

## Components
- **Buttons:** 
    - *Primary:* Solid Primary color with `on-primary` text. No shadow, but applies a subtle scale-down (0.96) on click.
    - *Secondary/Ghost:* 1px outline-variant border with a hover state that fills with `primary/5`.
- **Glass Cards:** The signature component. Must include `backdrop-filter: blur(12px)`. Hovering should increase the border opacity and slightly brighten the background fill.
- **Progress Bars:** Use the `shimmer-gradient`. The "shimmer" effect should animate from right to left to suggest constant data processing.
- **Navigation Items:**
    - *Active:* Background of `primary-container` with a bloom glow.
    - *Inactive:* Transparent background with `on-surface-variant` text; icons change to the Primary color only on hover.
- **Timeline:** Vertical 1px line in `outline-variant/30` with circular nodes. Icons within nodes should be 14px centered.
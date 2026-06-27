---
name: Aetheric Intelligence
colors:
  surface: '#111217'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c9c4d9'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
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
  secondary-container: '#00d4a1'
  on-secondary-container: '#00563f'
  tertiary: '#ffb955'
  on-tertiary: '#452b00'
  tertiary-container: '#986300'
  on-tertiary-container: '#fff0e2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c8bfff'
  on-primary-fixed: '#190064'
  on-primary-fixed-variant: '#4206d7'
  secondary-fixed: '#54fdc6'
  secondary-fixed-dim: '#27e0ab'
  on-secondary-fixed: '#002116'
  on-secondary-fixed-variant: '#00513c'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#ffb955'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
  surface-elevated: '#171A21'
  border-subtle: rgba(255, 255, 255, 0.08)
  glow-primary: rgba(108, 77, 255, 0.15)
typography:
  display-lg:
    fontFamily: Rubik
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Rubik
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Rubik
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
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
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 64px
---

## Brand & Style

This design system embodies a "Minimal Luxury" aesthetic, merging the precision of high-end SaaS platforms like Linear and Vercel with the evocative, vibrant energy of a futuristic AI-driven creative tool. The brand personality is sophisticated, forward-thinking, and effortless, aiming to make the complex act of AI website generation feel like a premium, curated experience.

The design style utilizes a **Dark Mode Default** foundation characterized by:
- **Atmospheric Depth:** Leveraging dark surfaces with subtle gradients and soft glows to create a sense of infinite digital space.
- **Precision Minimalism:** Heavy use of whitespace and razor-sharp typography to maintain a professional, high-signal environment.
- **Glassmorphism:** Strategic use of frosted surfaces and backdrop blurs to establish hierarchy without visual clutter.
- **Tactile High-Tech:** Elements feel physically present through the use of soft internal glows and micro-interactions that mimic high-end hardware.

## Colors

The palette is anchored in a deep, obsidian-like black to emphasize premium quality and reduce visual fatigue. 

- **Primary (Vibrant Purple):** Used for primary actions, AI-generation states, and brand-critical highlights.
- **Secondary (Emerald):** Reserved for success states, "live" indicators, and secondary growth-related metrics.
- **Accent (Amber):** Utilized sparingly for warnings, attention-grabbing features, or premium "Pro" tier callouts.
- **Background & Surface:** We employ a three-tier dark architecture. The base `#09090B` acts as the canvas, while `#111217` and `#171A21` provide structural depth for containers and interactive modals.
- **Functional Neutrals:** Text utilizes high-contrast whites and muted grays to ensure perfect legibility against the dark backdrops.

## Typography

The typography system relies exclusively on **Rubik**, chosen for its friendly yet technical geometric construction. It provides excellent legibility in both English and Arabic contexts.

- **Weight Strategy:** Use Bold (700) for display titles to create a strong visual anchor. Medium (500) is preferred for UI labels and navigation to maintain a "SaaS" professional feel.
- **RTL Support:** The system is designed to mirror seamlessly. Line heights are generous to accommodate Arabic script descenders without crowding.
- **Hierarchy:** High contrast is maintained by using pure white (`#FFFFFF`) for headlines and a secondary gray (`rgba(255, 255, 255, 0.7)`) for body text to guide the user's eye through the AI-generated content.

## Layout & Spacing

The design system utilizes a **fluid grid** with an 8px spacing scale, ensuring mathematical harmony across all layouts.

- **Grid Model:** A 12-column grid for desktop with 24px gutters. For mobile, the layout collapses to a single column with 16px side margins.
- **Rhythm:** Vertical rhythm is strictly enforced using "Stack" tokens. `stack-md` (16px) is the default for grouping related elements, while `stack-lg` (32px) separates distinct sections.
- **Bento Logic:** Complex dashboards should follow a "Bento Box" layout—using modular containers of varying spans (e.g., a 4-column wide box next to an 8-column wide box) to organize AI insights and website previews.

## Elevation & Depth

Visual hierarchy is achieved through a combination of tonal layering and modern glassmorphism.

- **Tonal Tiers:** Objects closer to the user are lighter. The background is the darkest layer (`#09090B`), cards sit on `#111217`, and active modals or popovers sit on `#171A21`.
- **Luminescent Borders:** Instead of heavy shadows, use 1px solid borders with low opacity (`rgba(255,255,255,0.08)`). For active or "AI-processing" states, the border should transition to a subtle `primary` purple glow.
- **Glassmorphism:** High-level overlays (navigation bars, sidebars) should use a backdrop filter blur (20px to 40px) with a semi-transparent surface color to maintain a sense of context.
- **Shadows:** When used, shadows must be "Ambient"—highly diffused, low opacity, and slightly tinted with the primary purple hue to avoid a "muddy" look.

## Shapes

The shape language is defined by oversized, friendly, and premium curves.

- **Standard Radius:** All primary UI containers and input fields use a base `20px` radius. 
- **Large Components:** Larger cards and hero sections should scale up to `24px` (`rounded-lg`) to emphasize the "soft tech" aesthetic.
- **Pills:** Buttons and tags often use a full pill-shape to contrast against the structured grid of the "Bento" layout.

## Components

- **Buttons:** Primary buttons feature a solid Vibrant Purple fill with a subtle inner top-light (1px white at 10% opacity). Secondary buttons use a glassmorphic style with a ghost border.
- **Inputs:** Fields are dark (`#111217`) with a 20px radius. On focus, the border glows with the primary purple and a subtle outer shadow.
- **Cards:** The "Bento" cards are the core of the experience. They use the `surface` color, a 20px-24px radius, and a subtle 1px border.
- **AI Glow:** Any element currently being modified or generated by AI should have a pulsing "Aura" effect—a soft, feathered radial gradient in the background using the Primary and Secondary colors.
- **Chips/Badges:** Small, pill-shaped elements with low-opacity fills and high-opacity text. Used for "Beta," "New," or status indicators.
- **RTL Considerations:** All icons (except those that are direction-neutral) must flip for Arabic localization. Navigation arrows, progress bars, and input icons should respect the RTL flow.
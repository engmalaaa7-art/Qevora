# Qevora — Product Requirements Document (PRD)
**Version:** 1.0  
**Date:** 2026-06-25  
**Status:** Draft — Awaiting Review  
**Tagline:** From Words to Website

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Journey](#2-user-journey)
3. [Platform Modules](#3-platform-modules)
4. [User Roles](#4-user-roles)
5. [Project States](#5-project-states)
6. [Website Generation States](#6-website-generation-states)
7. [Screen List](#7-screen-list)
8. [User Actions](#8-user-actions)
9. [AI Actions](#9-ai-actions)
10. [MVP Scope](#10-mvp-scope)
11. [Out of Scope Features](#11-out-of-scope-features)
12. [Open Questions](#12-open-questions)

---

## 1. Executive Summary

Qevora is an AI-powered website generation platform that enables users to create fully functional websites through natural language descriptions. The platform targets individuals, businesses, and agencies who need websites without requiring technical expertise.

**Core value proposition:** A user writes a description of what they want — in Arabic or English — and receives a working, deployable website within 1–3 minutes.

**Platform Pillars:**

| Pillar | Description |
|---|---|
| AI Generation | Websites generated entirely from natural language |
| Template Mode | Starting from curated, industry-specific templates |
| Live Preview | Real-time visual preview of the generated website |
| Conversational Editing | All modifications happen through chat |
| One-Click Publishing | Instant deployment to a subdomain or custom domain |

---

## 2. User Journey

### 2.1 End-to-End Journey Map

```
[Discovery] → [Registration] → [Project Creation] → [Generation] → [Preview & Editing] → [Publishing]
```

---

### 2.2 Phase 1 — Discovery (Landing Page)

1. User arrives at qevora.com
2. User reads the value proposition: *"From Words to Website"*
3. User views feature highlights, examples, and pricing plans
4. User clicks **Get Started** or **Sign In**

---

### 2.3 Phase 2 — Registration & Onboarding

1. User selects an authentication method:
   - Google
   - GitHub
   - Apple
   - Email & Password
2. On first sign-up, user is prompted with a brief onboarding:
   - Select preferred language (Arabic / English)
   - Select account type (Individual / Business / Agency)
3. User lands on the **Dashboard**

---

### 2.4 Phase 3 — Project Creation

User clicks **New Project** and selects a creation mode:

**Mode A — AI Mode (From Scratch)**
1. User is presented with a prompt input
2. User types a description of the desired website (Arabic or English)
3. User optionally uploads reference images or brand assets
4. User clicks **Generate**

**Mode B — Template Mode**
1. User browses the template gallery (~50 templates)
2. User filters by industry (Business, Real Estate, Restaurant, Medical, etc.)
3. User selects a template
4. User optionally customizes the prompt before generating ("Use this template but make it blue and add an Arabic version")
5. User clicks **Generate**

---

### 2.5 Phase 4 — AI Generation

The platform processes the request through sequential AI stages:

1. **Analysis** — AI interprets the user's intent and language
2. **Structure** — AI plans pages, sections, and navigation
3. **Content** — AI generates all text, headings, and copy
4. **Layout** — AI designs the visual layout and component structure
5. **Images** — AI uses uploaded images or generates placeholder images
6. **Code** — AI assembles the final HTML/CSS/JS output

A real-time **generation progress bar** is visible throughout.

---

### 2.6 Phase 5 — Preview & Editing

1. A three-panel **Editor Dashboard** appears:
   - **Left Panel:** AI Chat
   - **Center Panel:** Live Website Preview (iframe)
   - **Right Panel:** Code Viewer (read-only)
2. User reviews the generated website in the live preview
3. User requests changes through the AI Chat:
   - *"Change the color scheme to dark blue and gold"*
   - *"Add a contact form to the homepage"*
   - *"Translate everything to Arabic"*
4. AI processes the request, updates the code, and the preview refreshes
5. User iterates until satisfied

---

### 2.7 Phase 6 — Publishing

1. User clicks **Publish**
2. User selects publishing option:
   - **Free Subdomain:** `projectname.qevora.site`
   - **Custom Domain:** User enters their own domain
3. Platform deploys the website
4. User receives a live URL
5. Website is accessible publicly

---

## 3. Platform Modules

### Module 1 — Authentication & Identity
Handles all user authentication, session management, and account identity.

**Capabilities:**
- OAuth via Google, GitHub, Apple
- Email/password sign-up and sign-in
- Password reset via email
- Session persistence
- Account profile management (name, avatar, language preference, account type)

---

### Module 2 — Project Management
Manages the full lifecycle of user projects.

**Capabilities:**
- Create, rename, duplicate, delete projects
- List all projects in the dashboard
- Store project metadata (name, creation date, last modified, status, published URL)
- Project-level settings (language, domain, template used)

---

### Module 3 — AI Generation Engine
The core module responsible for transforming user prompts into complete websites.

**Capabilities:**
- Natural language understanding in Arabic and English
- Multi-stage generation pipeline (analysis → structure → content → layout → images → code)
- Template-aware generation
- Context-aware regeneration for editing
- Image generation for placeholder assets
- Ecommerce page generation (products, cart, checkout)

---

### Module 4 — Editor Dashboard
The primary workspace where users preview and iterate on their websites.

**Capabilities:**
- Three-panel layout (Chat | Preview | Code)
- Resizable panels
- AI Chat with project context memory
- Live iframe preview with refresh on changes
- Read-only code viewer with syntax highlighting
- Language toggle for bilingual websites
- Mobile/tablet/desktop preview toggle

---

### Module 5 — Template Gallery
A curated library of pre-built website templates by industry.

**Capabilities:**
- Browse and filter templates by category
- Preview each template before selecting
- Select a template as the base for AI generation

**Template Categories (minimum):**

| Category |
|---|
| Business |
| Real Estate |
| Restaurant & Food |
| Medical & Healthcare |
| Law Firm |
| Agency & Creative |
| Portfolio |
| Ecommerce |
| Education |
| Nonprofit |
| Event |
| Blog |

---

### Module 6 — Publishing & Domains
Handles website deployment and domain configuration.

**Capabilities:**
- One-click publish to `name.qevora.site` subdomain
- Custom domain connection
- Published site version management
- Republish after edits

---

### Module 7 — AI Chat
The conversational interface for all post-generation editing.

**Capabilities:**
- Full conversation history per project
- Context awareness (knows the current website structure)
- Bilingual input (Arabic and English, mixed is acceptable)
- Suggested prompts / quick actions
- Undo last AI change

---

### Module 8 — Code Viewer
A read-only view of the generated website code.

**Capabilities:**
- Syntax-highlighted HTML, CSS, and JavaScript display
- Tab-based navigation between files
- Copy-to-clipboard functionality
- Code is automatically updated after every AI change

---

### Module 9 — Media & Assets
Manages uploaded and AI-generated media.

**Capabilities:**
- User image upload (logo, photos, brand assets)
- AI image generation for placeholders
- Asset library per project

---

### Module 10 — Billing & Plans
Manages subscriptions and usage limits.

**Capabilities:**
- Free, Pro, and Business plan tiers
- Usage tracking (number of projects, AI generation credits, published sites)
- Upgrade/downgrade plans
- Payment processing

> [!NOTE]
> Billing module scope and plan structures are to be defined in a separate specification.

---

## 4. User Roles

### Role 1 — Guest (Unauthenticated)
A visitor who has not signed in.

| Permission | Allowed |
|---|---|
| View landing page | ✅ |
| View template gallery preview | ✅ |
| Sign up / Sign in | ✅ |
| Create a project | ❌ |
| Access the editor dashboard | ❌ |

---

### Role 2 — Free User (Authenticated, Free Plan)
A registered user on the free tier.

| Permission | Allowed |
|---|---|
| Create projects (limited) | ✅ |
| Use AI Mode | ✅ |
| Use Template Mode | ✅ |
| Edit via AI Chat | ✅ |
| Publish to Qevora subdomain | ✅ |
| Custom domain | ❌ |
| AI image generation | Limited |
| Ecommerce features | ❌ |

---

### Role 3 — Pro User (Authenticated, Paid Plan)
A registered user on a paid individual plan.

| Permission | Allowed |
|---|---|
| Unlimited projects | ✅ |
| All AI features | ✅ |
| Publish to Qevora subdomain | ✅ |
| Custom domain | ✅ |
| AI image generation | ✅ |
| Ecommerce features | ✅ |
| Priority generation | ✅ |

---

### Role 4 — Agency / Business User (Authenticated, Agency Plan)
A team or agency account with elevated limits.

| Permission | Allowed |
|---|---|
| All Pro features | ✅ |
| Multiple team members | ✅ |
| Client project management | ✅ |
| White-label publishing | TBD |
| Higher usage limits | ✅ |

---

### Role 5 — Platform Admin (Internal)
Internal Qevora team member with full system access.

| Permission | Allowed |
|---|---|
| Access all user projects | ✅ |
| Manage templates | ✅ |
| Manage user accounts | ✅ |
| View platform analytics | ✅ |
| Manage billing and plans | ✅ |

---

## 5. Project States

Each project exists in exactly one of the following states at any given time.

| State | Description |
|---|---|
| `DRAFT` | Project created but no generation has occurred yet |
| `GENERATING` | AI is currently generating the website |
| `GENERATION_FAILED` | AI generation encountered an error |
| `READY` | Generation complete; website is ready for preview and editing |
| `EDITING` | User is actively in an edit session |
| `PUBLISHING` | Website is being deployed |
| `PUBLISHED` | Website is live and publicly accessible |
| `REPUBLISHING` | A previously published website is being updated with new changes |
| `ARCHIVED` | Project has been archived by the user |

### State Transition Diagram

```
DRAFT → GENERATING → READY → EDITING → PUBLISHING → PUBLISHED
              ↓                                           ↓
      GENERATION_FAILED                           REPUBLISHING (when edited after publish)
                                                         ↓
                                                     PUBLISHED
```

---

## 6. Website Generation States

These are the sub-states within the `GENERATING` project state, shown to the user as a step-by-step progress indicator.

| Step | State | Description |
|---|---|---|
| 1 | `ANALYZING` | AI is reading and interpreting the user's prompt |
| 2 | `PLANNING_STRUCTURE` | AI is planning pages, sections, and navigation |
| 3 | `GENERATING_CONTENT` | AI is writing all text content and copy |
| 4 | `DESIGNING_LAYOUT` | AI is composing visual layout and components |
| 5 | `GENERATING_IMAGES` | AI is sourcing or generating images |
| 6 | `WRITING_CODE` | AI is assembling the final HTML/CSS/JS |
| 7 | `FINALIZING` | AI is doing final checks and preparing the preview |
| — | `COMPLETE` | Generation is done; transitions project to `READY` |
| — | `FAILED` | An error occurred; transitions project to `GENERATION_FAILED` |

---

## 7. Screen List

### 7.1 Public Screens (Unauthenticated)

| # | Screen | Description |
|---|---|---|
| S-01 | Landing Page | Hero, features, demos, pricing, CTA |
| S-02 | Sign In | Auth with Google, GitHub, Apple, Email |
| S-03 | Sign Up | Registration form + OAuth options |
| S-04 | Forgot Password | Email-based password reset flow |
| S-05 | Email Verification | Confirmation screen after signup |
| S-06 | Reset Password | New password entry form |
| S-07 | Terms of Service | Legal page |
| S-08 | Privacy Policy | Legal page |

---

### 7.2 Onboarding Screens

| # | Screen | Description |
|---|---|---|
| S-09 | Welcome / Language Select | First-time user sets language preference |
| S-10 | Account Type Select | Individual, Business, or Agency |
| S-11 | Onboarding Complete | Summary + CTA to create first project |

---

### 7.3 Dashboard Screens

| # | Screen | Description |
|---|---|---|
| S-12 | Main Dashboard | Project list, recent activity, quick actions |
| S-13 | New Project Modal | Select creation mode (AI or Template) |
| S-14 | Template Gallery | Browse and filter templates |
| S-15 | Template Preview | Full preview of a selected template |
| S-16 | AI Prompt Input | Prompt entry + optional file upload before generation |

---

### 7.4 Generation Screen

| # | Screen | Description |
|---|---|---|
| S-17 | Generation Progress | Step-by-step progress with animation |
| S-18 | Generation Failed | Error state with retry option |

---

### 7.5 Editor Dashboard Screens

| # | Screen | Description |
|---|---|---|
| S-19 | Editor — Full View | Three-panel layout (Chat / Preview / Code) |
| S-20 | Editor — Preview Focused | Preview panel expanded, panels collapsed |
| S-21 | Editor — Chat Focused | Chat panel expanded |
| S-22 | Editor — Code Focused | Code viewer panel expanded |
| S-23 | Publish Modal | Select subdomain or custom domain + confirm |
| S-24 | Publishing Progress | Deploy animation and status |
| S-25 | Published Success | Live URL display and sharing options |

---

### 7.6 Account & Settings Screens

| # | Screen | Description |
|---|---|---|
| S-26 | Account Settings | Profile name, avatar, language preference |
| S-27 | Plan & Billing | Current plan, usage, upgrade options |
| S-28 | Project Settings | Rename, delete, domain settings per project |

---

### 7.7 Error & System Screens

| # | Screen | Description |
|---|---|---|
| S-29 | 404 Not Found | Page not found |
| S-30 | 500 Server Error | General error screen |
| S-31 | Maintenance Mode | Platform under maintenance notice |

---

**Total MVP Screens: 31**

---

## 8. User Actions

### 8.1 Authentication Actions

| Action | Description |
|---|---|
| Sign up with OAuth | Register via Google, GitHub, or Apple |
| Sign up with email | Register with email and password |
| Sign in | Log into existing account |
| Sign out | End current session |
| Reset password | Request and complete password reset |
| Delete account | Permanently delete account and all projects |

---

### 8.2 Project Actions

| Action | Description |
|---|---|
| Create project | Start a new project (AI or Template mode) |
| Rename project | Change the project name |
| Duplicate project | Clone an existing project |
| Delete project | Permanently remove a project |
| Open project | Enter the editor dashboard for a project |
| Archive project | Hide project from main dashboard |

---

### 8.3 Generation Actions

| Action | Description |
|---|---|
| Submit prompt | Enter a natural language description and trigger generation |
| Upload image | Attach reference images or brand assets before generation |
| Select template | Choose a template as the starting point |
| Retry generation | Re-trigger generation after a failure |
| Regenerate website | Start a fresh generation on an existing project |

---

### 8.4 Editor Actions

| Action | Description |
|---|---|
| Send chat message | Submit a message to the AI for editing |
| Undo last AI change | Revert the most recent AI-applied change |
| Toggle preview device | Switch preview between desktop, tablet, mobile |
| Toggle preview language | Switch between Arabic and English versions (if bilingual) |
| Resize panels | Drag to resize the Chat, Preview, or Code panels |
| Expand panel | Maximize a specific panel |
| Copy code | Copy code from the Code Viewer to clipboard |
| Switch code tab | Navigate between HTML, CSS, JS files in the Code Viewer |

---

### 8.5 Publishing Actions

| Action | Description |
|---|---|
| Publish | Deploy the current website version |
| Set subdomain name | Choose the `name.qevora.site` subdomain |
| Connect custom domain | Add a custom domain to a project |
| Republish | Re-deploy after making edits |
| View live site | Open the published site in a new tab |
| Share URL | Copy the live site URL |
| Unpublish | Take a published site offline |

---

### 8.6 Account & Settings Actions

| Action | Description |
|---|---|
| Update profile | Change name, avatar, language preference |
| Change account type | Upgrade account type |
| Upgrade plan | Move to a higher billing tier |
| Downgrade plan | Move to a lower billing tier |
| View usage | See current usage vs. plan limits |

---

## 9. AI Actions

These are the actions the AI assistant can take in response to user instructions.

### 9.1 Content Actions

| Action | Example Trigger |
|---|---|
| Generate all page content | Initial generation |
| Rewrite section content | *"Rewrite the About section to be more formal"* |
| Translate page content | *"Translate the site to Arabic"* |
| Make bilingual | *"Add an Arabic version of the homepage"* |
| Generate product descriptions | *"Add 6 products to the store"* |
| Generate blog posts | *"Add 3 sample blog posts"* |

---

### 9.2 Structure Actions

| Action | Example Trigger |
|---|---|
| Add page | *"Add a Services page"* |
| Remove page | *"Delete the Blog page"* |
| Add section | *"Add a testimonials section to the homepage"* |
| Remove section | *"Remove the pricing section"* |
| Reorder sections | *"Move the About section above the Services section"* |
| Add navigation item | *"Add a Portfolio link to the nav"* |
| Remove navigation item | *"Remove the Blog link from the nav"* |

---

### 9.3 Design Actions

| Action | Example Trigger |
|---|---|
| Change color scheme | *"Change the colors to dark blue and gold"* |
| Change typography | *"Use a more modern font"* |
| Change layout | *"Make the homepage hero full-screen"* |
| Make responsive | *"Make sure it looks good on mobile"* |
| Apply dark mode | *"Switch to dark mode"* |
| Change button style | *"Make all buttons rounded"* |

---

### 9.4 Functionality Actions

| Action | Example Trigger |
|---|---|
| Add contact form | *"Add a contact form with name, email, message"* |
| Add newsletter signup | *"Add an email newsletter section"* |
| Add Google Maps | *"Add a map with our location"* |
| Add social links | *"Add links to Instagram and Facebook"* |
| Add ecommerce cart | *"Add a shopping cart"* |
| Add product catalog | *"Add a product listing page"* |
| Add checkout page | *"Add a checkout page"* |
| Add search | *"Add a search bar to the site"* |
| Add cookie banner | *"Add a GDPR cookie consent banner"* |

---

### 9.5 Image Actions

| Action | Example Trigger |
|---|---|
| Generate placeholder images | When user provides no images during generation |
| Replace section image | *"Replace the hero image with something more professional"* |
| Use uploaded image | When user uploads an image and says *"Use this as the logo"* |

---

## 10. MVP Scope

The MVP must deliver the following within 1–3 minutes of a user submitting a prompt:

### In-Scope for MVP

| Feature | Priority |
|---|---|
| Landing page (S-01) | P0 |
| Sign up / Sign in — Google + Email | P0 |
| New project creation | P0 |
| AI Mode (generation from prompt) | P0 |
| Template Mode (selection from gallery) | P0 |
| Generation progress screen | P0 |
| Editor dashboard — three-panel layout | P0 |
| Live preview (iframe) | P0 |
| AI Chat for editing | P0 |
| Code Viewer (read-only) | P0 |
| One-click publish to `name.qevora.site` | P0 |
| Arabic and English prompt support | P0 |
| Bilingual website generation | P1 |
| Mobile/tablet/desktop preview toggle | P1 |
| Image upload before generation | P1 |
| AI placeholder image generation | P1 |
| Password reset flow | P1 |
| Account settings | P1 |
| Project rename / delete | P1 |
| Undo last AI change | P1 |
| Template gallery with filters | P1 |
| Onboarding flow | P2 |
| Custom domain support | P2 |
| Ecommerce generation | P2 |

---

### Success Criteria for MVP Launch

| Criterion | Target |
|---|---|
| Generation time | Website generated in ≤ 3 minutes from prompt submission |
| Generation success rate | ≥ 90% of prompts produce a valid, renderable website |
| Preview accuracy | Live preview matches generated code with no visual drift |
| Publishing reliability | ≥ 99% of publish actions result in a live, accessible URL |
| Bilingual support | AI correctly generates Arabic and English content when requested |
| Chat edit success rate | ≥ 85% of single-turn chat edits apply correctly |
| Time to first preview | User sees their generated website within 3 minutes of clicking Generate |
| Core flow completion | A new user can complete the journey: sign up → generate → publish in ≤ 10 minutes |

---

## 11. Out of Scope Features

The following features are explicitly excluded from the MVP and deferred to future releases.

| Feature | Reason Deferred |
|---|---|
| Team collaboration / multi-user editing | Complexity; post-MVP |
| Version history / site rollback | Complexity; post-MVP |
| Direct code editing by user | Intentionally excluded from product vision for MVP |
| White-label platform for agencies | Requires separate infrastructure |
| SEO tools dashboard | Post-MVP |
| Analytics dashboard (traffic, conversions) | Post-MVP |
| AI A/B testing of website variants | Post-MVP |
| Built-in payment processing (Stripe, PayPal) | Post-MVP (ecommerce basic is in P2) |
| Email marketing integration | Post-MVP |
| CMS / content management panel | Post-MVP |
| Mobile app (iOS/Android) | Post-MVP |
| Offline mode | Not applicable |
| AI voice input | Post-MVP |
| Third-party plugin marketplace | Post-MVP |

---

## 12. Open Questions

These questions must be answered before or during development to avoid blockers.

| # | Question | Owner | Priority |
|---|---|---|---|
| OQ-01 | What AI model(s) will power code generation? (e.g., GPT-4o, Claude, Gemini) | Engineering | P0 |
| OQ-02 | What AI model will power image generation? (e.g., DALL·E, Stable Diffusion, Imagen) | Engineering | P0 |
| OQ-03 | What format does the generated website take? (Single HTML file, multi-file, Next.js, etc.) | Engineering | P0 |
| OQ-04 | How is the generated website hosted for publishing? (CDN, S3, Vercel, custom) | Engineering | P0 |
| OQ-05 | What is the maximum prompt length accepted? | Product | P1 |
| OQ-06 | What is the maximum number of pages per generated website? | Product | P1 |
| OQ-07 | What happens if a user edits a published site — is there downtime during republish? | Engineering | P1 |
| OQ-08 | What are the plan limits for the Free tier? (Projects, generations, published sites) | Product / Business | P1 |
| OQ-09 | Is the Code Viewer read-only permanently, or is direct code editing planned for a future tier? | Product | P1 |
| OQ-10 | Does the AI chat retain full conversation history forever, or is there a limit? | Engineering | P1 |
| OQ-11 | What languages beyond Arabic and English are planned post-MVP? | Product | P2 |
| OQ-12 | What is the custom domain verification method? (DNS CNAME, TXT record) | Engineering | P2 |
| OQ-13 | Is the ecommerce feature backed by a real payment gateway in P2 or is it UI-only? | Product | P2 |
| OQ-14 | What accessibility standard (WCAG) must generated websites comply with? | Product | P2 |
| OQ-15 | Will the platform support RTL (Right-to-Left) layout generation for Arabic-only sites? | Engineering | P0 |

---

*Document maintained by: Antigravity AI*  
*Next revision trigger: After Open Questions OQ-01 through OQ-05 are resolved*

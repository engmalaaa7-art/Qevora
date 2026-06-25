# Qevora — Open Questions Resolution
**Version:** 1.0  
**Date:** 2026-06-25  
**Source:** PRD_Qevora_v1.md — Section 12  
**Status:** Awaiting Owner Decisions

---

## How to Read This Document

Each open question is analyzed with:
- **Why It Matters** — the downstream consequence of leaving it unresolved
- **Options** — all viable choices
- **Pros / Cons** — impact of each option
- **Recommendation** — the advised choice
- **Timing** — `Must Decide Before Architecture` or `Can Decide Later`

---

## Group A — Technical Decisions

---

### OQ-01 — What AI model(s) will power code generation?

**Why It Matters:**
The choice of model determines generation quality, speed, cost per request, and whether the platform can hit the 1–3 minute target. It also determines how prompts must be structured, what context window is available, and whether fine-tuning is possible.

| Option | Description |
|---|---|
| A | **Claude 3.5 Sonnet / Claude 4** (Anthropic) |
| B | **GPT-4o** (OpenAI) |
| C | **Gemini 1.5 Pro / 2.0** (Google) |
| D | **Multi-model routing** — use the best model per task |

---

**Option A — Claude (Anthropic)**

| Pros | Cons |
|---|---|
| Excellent at structured code generation | Higher cost per token at volume |
| Very large context window (200K tokens) | Requires Anthropic API agreement |
| Follows instructions precisely | Less widely integrated than OpenAI |
| Strong at maintaining code consistency across long files | |

**Option B — GPT-4o (OpenAI)**

| Pros | Cons |
|---|---|
| Most widely tested for code generation | Context window smaller than Claude |
| Massive ecosystem of tooling and examples | OpenAI pricing scales quickly |
| Fast response times | Occasional instruction drift on long outputs |
| Well-documented function calling | |

**Option C — Gemini (Google)**

| Pros | Cons |
|---|---|
| Very large context window (1M tokens) | Code generation quality still maturing vs. GPT/Claude |
| Cost-competitive at scale | Less proven for production website generation |
| Native Google Cloud integration | |

**Option D — Multi-model routing**

| Pros | Cons |
|---|---|
| Use best model for each subtask | Engineering complexity significantly higher |
| Cost optimization possible | Inconsistent output style across tasks |
| Redundancy if one provider is down | Prompt engineering must be duplicated per model |

> **Recommendation: Option A — Claude**  
> Claude's instruction-following, code consistency, and large context window make it the best fit for generating complete, multi-file websites in a single pass. Start with a single model to ship fast; routing can be added later.

🔴 **Must Decide Before Architecture**

---

### OQ-02 — What AI model will power image generation?

**Why It Matters:**
Image generation affects output quality, latency, cost, and whether the platform can generate contextually relevant images (e.g., a real estate hero image vs. a restaurant hero). A wrong choice could add 30–60 seconds to generation time.

| Option | Description |
|---|---|
| A | **DALL·E 3** (OpenAI) |
| B | **Stable Diffusion** (via Replicate or self-hosted) |
| C | **Imagen 3** (Google) |
| D | **Skip AI images in MVP** — use curated stock placeholder images instead |

---

**Option A — DALL·E 3**

| Pros | Cons |
|---|---|
| High quality, prompt-accurate outputs | Cost per image is high at volume |
| No infrastructure to manage | Slower than SD for batch generation |
| Easy API integration | |

**Option B — Stable Diffusion (Replicate)**

| Pros | Cons |
|---|---|
| Much cheaper per image | Lower quality without fine-tuning |
| Faster generation | Requires prompt engineering expertise |
| Flexible model selection | Infrastructure complexity if self-hosted |

**Option C — Imagen 3 (Google)**

| Pros | Cons |
|---|---|
| Excellent photorealistic quality | Limited API access / waitlist |
| Strong contextual understanding | Tied to Google Cloud |

**Option D — Stock placeholders (MVP only)**

| Pros | Cons |
|---|---|
| Zero added latency | Less impressive demo experience |
| Zero added cost | Generic look and feel |
| Dramatically simpler MVP | May feel unfinished to early users |

> **Recommendation: Option D for MVP, Option A post-MVP**  
> Shipping with a high-quality curated stock image library (organized by category: business, restaurant, real estate, etc.) eliminates image generation latency and cost from the MVP critical path. DALL·E 3 can be layered in as a premium feature after launch.

🟡 **Can Decide Later** (but choose stock vs. AI before first user demo)

---

### OQ-03 — What format does the generated website take?

**Why It Matters:**
This is the single most consequential technical decision in the entire product. It determines the editor, the preview mechanism, the publishing infrastructure, the code viewer, and the AI editing loop.

| Option | Description |
|---|---|
| A | **Single HTML file** — all HTML, CSS, JS in one file |
| B | **Multi-file static site** — separate HTML, CSS, JS files |
| C | **Next.js / React app** — component-based output |
| D | **JSON + renderer** — AI outputs a JSON schema; a platform renderer generates HTML |

---

**Option A — Single HTML file**

| Pros | Cons |
|---|---|
| Simplest to generate, preview, and host | Becomes unwieldy for large, multi-page sites |
| Easiest for the AI to produce consistently | Poor developer experience if user ever exports |
| Instant iframe preview | Hard to add dynamic features (cart, blog) cleanly |
| Zero build step for publishing | |

**Option B — Multi-file static site**

| Pros | Cons |
|---|---|
| Clean separation of concerns | AI must manage file references correctly |
| Easier to edit specific files via chat | More complex generation prompt |
| Standard developer export format | Preview requires serving files, not just an iframe |
| Scales well to multi-page sites | |

**Option C — Next.js / React app**

| Pros | Cons |
|---|---|
| Highly dynamic, supports full ecommerce | Requires a build step — adds 30–60 seconds minimum |
| Component-based; easier to edit specific sections | AI must produce valid JSX — higher failure rate |
| Deployable to Vercel/Netlify instantly | Much larger context needed per generation |
| Best long-term extensibility | Overkill for most MVP use cases |

**Option D — JSON schema + renderer**

| Pros | Cons |
|---|---|
| AI output is structured and validatable | Requires building and maintaining a custom renderer |
| Editing is precise — change a property, not code | Limits creative freedom; renderer constrains design |
| Easiest to build a visual editor on top of later | Significant upfront engineering investment |
| Consistent output quality | |

> **Recommendation: Option B — Multi-file static site**  
> This is the best balance of quality, speed, and editability. The AI generates `index.html`, `style.css`, and `script.js` (plus additional `.html` files for extra pages). Preview is served via iframe from a lightweight static file server. Publishing is a direct CDN upload. Avoids the complexity of React while supporting clean multi-page sites and readable code in the viewer.

🔴 **Must Decide Before Architecture**

---

### OQ-04 — How is the generated website hosted for publishing?

**Why It Matters:**
Hosting infrastructure determines publish speed, cost at scale, custom domain complexity, and reliability SLAs. The wrong choice could make one-click publishing slow or expensive.

| Option | Description |
|---|---|
| A | **AWS S3 + CloudFront** — files in S3, served via CDN |
| B | **Vercel / Netlify** — deploy per project programmatically |
| C | **Cloudflare Pages** — upload via API, served via Cloudflare CDN |
| D | **Custom VPS with Nginx** — files served from owned servers |

---

**Option A — AWS S3 + CloudFront**

| Pros | Cons |
|---|---|
| Massively scalable | More AWS configuration required |
| Industry standard | Custom domain SSL requires ACM setup |
| Very low cost per GB served | Slightly more complex DevOps |
| Full control over caching rules | |

**Option B — Vercel / Netlify**

| Pros | Cons |
|---|---|
| Extremely simple deployment API | Per-project cost model gets expensive at scale |
| Custom domain + SSL automated | Vendor lock-in |
| Excellent CDN performance | Rate limits on free/startup tiers |

**Option C — Cloudflare Pages**

| Pros | Cons |
|---|---|
| Fastest CDN globally | Cloudflare Pages API less mature than S3 |
| Very generous free tier | |
| Custom domain + SSL automated | |
| Native DDoS protection | |

**Option D — Custom VPS**

| Pros | Cons |
|---|---|
| Full control | Does not scale; high ops burden |
| No per-request cost | SSL management overhead |
| | Not appropriate beyond early prototyping |

> **Recommendation: Option A — AWS S3 + CloudFront**  
> Best scalability, cost control, and custom domain support for a SaaS platform. Each project gets a unique S3 prefix; CloudFront handles CDN and SSL. Subdomains (`name.qevora.site`) map to CloudFront distributions via wildcard CNAME.

🔴 **Must Decide Before Architecture**

---

### OQ-07 — Is there downtime during republish?

**Why It Matters:**
If a user edits a live site and republishes, visitors to the live URL should not see a broken or blank page. This affects how the publishing pipeline is built.

| Option | Description |
|---|---|
| A | **Atomic swap** — new files fully uploaded before DNS/CDN switches |
| B | **In-place overwrite** — files replaced one by one (potential partial state) |
| C | **Versioned deployments** — each publish creates a new version; traffic switches atomically |

---

**Option A — Atomic swap**

| Pros | Cons |
|---|---|
| No downtime | Requires staging bucket/folder before promotion |
| Simple mental model | Slightly more complex implementation |

**Option B — In-place overwrite**

| Pros | Cons |
|---|---|
| Simplest to implement | Risk of partial/broken state during upload |
| | Not acceptable for production |

**Option C — Versioned deployments**

| Pros | Cons |
|---|---|
| Zero downtime | Enables rollback (but rollback is out of MVP scope) |
| Cleanest architecture | Storage cost increases with each version |
| Easiest to add version history later | Slightly more complex cleanup logic |

> **Recommendation: Option A — Atomic swap**  
> Upload new files to a staging prefix in S3, then execute a batch copy to the live prefix. CloudFront cache invalidation fires after the swap. No downtime, no complexity of full versioning in MVP.

🟡 **Can Decide Later** (before publishing feature is built)

---

### OQ-10 — Does AI chat retain full conversation history forever?

**Why It Matters:**
AI models have context window limits. Sending the full conversation history on every request increases latency and cost. There must be a defined strategy for how context is managed.

| Option | Description |
|---|---|
| A | **Full history always** — send every message every time |
| B | **Rolling window** — send last N messages only |
| C | **Summarized context** — compress older history into a summary |
| D | **Project context only** — always send current website state + last 5 messages |

---

**Option A — Full history**

| Pros | Cons |
|---|---|
| AI has maximum context | Token cost scales linearly with conversation length |
| Best coherence | Slow for long projects |

**Option B — Rolling window**

| Pros | Cons |
|---|---|
| Predictable token cost | AI forgets older instructions |
| Simple to implement | Can cause inconsistent behavior |

**Option C — Summarized context**

| Pros | Cons |
|---|---|
| Balances memory and cost | Requires a second AI call to summarize |
| AI retains important past decisions | Summarization can lose detail |

**Option D — Project context + recent messages**

| Pros | Cons |
|---|---|
| Most practical for a website editor | Requires well-structured project context schema |
| Predictable, low token cost | AI may not remember a specific conversation detail |
| Fast response times | |

> **Recommendation: Option D — Project context + last 10 messages**  
> On every chat request, send: (1) the current full website code, (2) a structured project summary (name, pages, design tokens, language), and (3) the last 10 messages. This gives the AI everything it needs to make accurate edits without unbounded cost.

🟡 **Can Decide Later** (before AI chat feature is built)

---

### OQ-12 — What is the custom domain verification method?

**Why It Matters:**
Custom domain setup is a technically complex flow for users. A poor UX here causes support tickets and churn.

| Option | Description |
|---|---|
| A | **CNAME record** — user points their subdomain to Qevora CDN |
| B | **TXT record + CNAME** — TXT proves ownership, CNAME routes traffic |
| C | **Nameserver delegation** — user delegates full DNS to Qevora |

---

**Option A — CNAME only**

| Pros | Cons |
|---|---|
| Simplest for users | Cannot verify ownership before routing |
| Single DNS entry | Root domains (`example.com`) cannot use CNAME |

**Option B — TXT + CNAME (recommended industry standard)**

| Pros | Cons |
|---|---|
| Ownership verified before activation | Two DNS steps for user |
| Works for subdomains (`www.example.com`) | Root domain still requires ALIAS/ANAME |
| Standard approach (Vercel, Netlify both use this) | |

**Option C — Nameserver delegation**

| Pros | Cons |
|---|---|
| Full control for platform | Very high friction for users |
| Root domain support | Users lose control of their DNS |

> **Recommendation: Option B — TXT + CNAME**  
> Industry standard. Provide a simple step-by-step UI with DNS entry copy buttons. Automatic SSL provisioning via AWS ACM after verification. For root domain support, document ALIAS/ANAME record requirement.

🟡 **Can Decide Later** (custom domain is P2)

---

### OQ-15 — Must the platform support RTL layout for Arabic-only websites?

**Why It Matters:**
Arabic is written right-to-left. A website for an Arabic-speaking audience that renders LTR looks broken and unprofessional. This is not a cosmetic concern — it affects HTML structure (`dir="rtl"`), CSS layout (flex-direction, text-align, margins), and font choices. If RTL is not built into the generation model from day one, retrofitting it is expensive.

| Option | Description |
|---|---|
| A | **Full RTL support from day one** — AI generates `dir="rtl"` and RTL CSS when Arabic is detected |
| B | **LTR with Arabic text only** — Arabic text renders inside an LTR layout |
| C | **User toggle** — generate LTR by default; user can request RTL via chat |

---

**Option A — Full RTL from day one**

| Pros | Cons |
|---|---|
| Correct behavior for Arabic users | More complex generation prompt |
| Professional output for target market | AI must handle RTL CSS rules |
| Differentiator vs. Western-only competitors | Requires RTL testing suite |

**Option B — LTR with Arabic text**

| Pros | Cons |
|---|---|
| Simpler to implement | Looks broken for Arabic-primary sites |
| | Damages brand credibility in Arabic market |
| | Unacceptable for professional use |

**Option C — User toggle via chat**

| Pros | Cons |
|---|---|
| Simpler default path | User has to manually request correct behavior |
| | Creates confusion; RTL should be automatic |

> **Recommendation: Option A — Full RTL from day one**  
> Given that Qevora explicitly targets Arabic-speaking users and supports Arabic input, shipping with LTR-only Arabic output is not acceptable. The generation prompt must include RTL directives when the target language or content is Arabic. This must be defined before the AI prompt engineering phase begins.

🔴 **Must Decide Before Architecture**

---

## Group B — Product Decisions

---

### OQ-05 — What is the maximum prompt length?

**Why It Matters:**
A short limit frustrates power users who want to provide detailed briefs. A very long limit increases token cost and generation time. It also affects the UI — does the input field grow, or is there a character counter?

| Option | Description |
|---|---|
| A | 500 characters (short, tweet-like) |
| B | 2,000 characters (~one paragraph + details) |
| C | 5,000 characters (detailed brief) |
| D | Unlimited (document-length prompt) |

> **Recommendation: 2,000 characters for Free tier; 5,000 characters for Pro/Agency**  
> This is a natural plan differentiator. 2,000 characters is enough for a detailed single-paragraph brief. Power users on Pro can provide longer specifications. The UI should show a character counter.

🟡 **Can Decide Later**

---

### OQ-06 — What is the maximum number of pages per generated website?

**Why It Matters:**
More pages = more tokens = longer generation time = higher cost. This must be defined to set user expectations and enforce plan limits.

| Option | Description |
|---|---|
| A | 3 pages max (Free), 10 pages max (Pro) |
| B | 5 pages max (Free), 20 pages max (Pro) |
| C | Unlimited pages (no cap) |

> **Recommendation: Option A — 3 pages Free, 10 pages Pro**  
> Most small business websites have fewer than 5 pages. 3 pages (Home, About, Contact) is a complete MVP for most Free tier users. 10 pages covers agency-class projects. The AI should inform the user if their prompt implies more pages than their plan allows.

🟡 **Can Decide Later**

---

### OQ-09 — Is the Code Viewer permanently read-only?

**Why It Matters:**
This is a core product philosophy decision. Allowing direct code editing changes the product from "AI-first" to "AI-assisted," which shifts the target user and increases support complexity.

| Option | Description |
|---|---|
| A | **Permanently read-only** — all changes through AI chat only |
| B | **Read-only in MVP; editable in future paid tier** |
| C | **Editable from day one for Pro users** |

> **Recommendation: Option B — Read-only in MVP; editable as a future Pro feature**  
> Keeping it read-only in MVP enforces the AI-first vision and simplifies the editor significantly. However, agencies and developers will eventually demand direct access. Framing the code viewer as read-only now — with "Direct Code Editor coming to Agency plan" as a roadmap item — sets correct expectations and creates a future upsell.

🟡 **Can Decide Later**

---

### OQ-11 — What languages beyond Arabic and English are planned post-MVP?

**Why It Matters:**
Language support affects font choices (e.g., CJK fonts), RTL vs. LTR, and AI prompt engineering. Knowing the roadmap prevents architectural decisions that would make adding languages expensive.

| Option | Description |
|---|---|
| A | Arabic + English only (long-term) |
| B | Add French and Turkish in v2 (MENA + regional) |
| C | Add all major world languages in v2 |

> **Recommendation: Option B — Arabic, English MVP; French and Turkish in v2**  
> French and Turkish are natural adjacencies for a MENA-focused platform. This does not require any architecture changes — it only requires expanding the AI prompt system to detect and handle additional languages.

🟡 **Can Decide Later**

---

### OQ-14 — What accessibility standard must generated websites comply with?

**Why It Matters:**
If Qevora generates websites for businesses, those websites may be subject to accessibility laws (ADA in the US, EN 301 549 in the EU). Generating inaccessible websites could create legal liability for users and reputational risk for Qevora.

| Option | Description |
|---|---|
| A | **No enforced standard** — accessibility is user's responsibility |
| B | **WCAG 2.1 Level A** — minimum baseline |
| C | **WCAG 2.1 Level AA** — industry standard for business websites |

> **Recommendation: Option B for MVP — WCAG 2.1 Level A as a baseline**  
> The AI generation prompt should include instructions to use semantic HTML, alt text on images, and sufficient color contrast. Level AA can be a premium feature ("Accessibility Audit") post-MVP. This protects Qevora legally without blocking the MVP.

🟡 **Can Decide Later**

---

## Group C — Business Decisions

---

### OQ-08 — What are the Free tier limits?

**Why It Matters:**
Free tier limits define the viral growth loop (generous enough to attract users), the conversion pressure (limited enough to push upgrades), and the infrastructure cost baseline.

| Option | Projects | Publishes | AI Edits/month | Custom Domain |
|---|---|---|---|---|
| A | 1 project | 1 published site | 20 | ❌ |
| B | 3 projects | 3 published sites | 50 | ❌ |
| C | Unlimited projects | 1 published site | 30 | ❌ |

> **Recommendation: Option B — 3 projects, 3 published sites, 50 AI edits/month**  
> This is generous enough for real use (small business owner, freelancer building their first site) while creating a natural upgrade trigger at the third project. 50 AI edits is roughly 1–2 full editing sessions per project per month.

🟡 **Can Decide Later** (before billing module is built)

---

### OQ-13 — Is ecommerce backed by a real payment gateway in P2?

**Why It Matters:**
If ecommerce in P2 is UI-only (product listings, cart, checkout form), it is a display website — not a real store. If it includes real payment processing, it requires PCI compliance, Stripe integration, and a significantly more complex codebase.

| Option | Description |
|---|---|
| A | **UI-only ecommerce** — product pages, cart, checkout form — no real payment processing |
| B | **Stripe integration** — real payment processing with order management |
| C | **Third-party redirect** — cart adds to WhatsApp order or email order |

> **Recommendation: Option A for P2 (UI-only); Option B as a future paid add-on**  
> UI-only ecommerce gives users a professional storefront they can showcase immediately. Real payment processing introduces legal, compliance, and engineering complexity that should be its own feature release. A WhatsApp-to-order integration (Option C) can be a lightweight bridge.

🟡 **Can Decide Later** (ecommerce is P2)

---

## Group D — UX Decisions

*(OQ-04 partial — the republish UX experience)*

### OQ-04b — What does the user see during republish?

**Why It Matters:**
If the user has a live site and edits it heavily before republishing, they may be nervous about disrupting live traffic. The UX should communicate status clearly.

| Option | Description |
|---|---|
| A | **Silent republish** — progress bar, no downtime warning shown |
| B | **Explicit confirmation** — "Your live site will be updated in ~10 seconds. Continue?" |
| C | **Preview before publish** — user sees a diff or staged preview before pushing live |

> **Recommendation: Option B — Explicit confirmation modal**  
> A simple confirmation step makes users feel in control and aware of what is happening. The modal should show the live URL, estimated time, and a confirm button. Option C is ideal long-term but out of MVP scope.

🟡 **Can Decide Later** (before publishing feature is built)

---

## Decision Priority Matrix

### 🔴 Must Decide Before Architecture (5 decisions)

| # | Decision | Recommended Choice |
|---|---|---|
| OQ-01 | AI model for code generation | Claude (Anthropic) |
| OQ-03 | Website output format | Multi-file static site (HTML + CSS + JS) |
| OQ-04 | Hosting/publishing infrastructure | AWS S3 + CloudFront |
| OQ-15 | RTL support for Arabic | Full RTL from day one |
| OQ-02* | Image generation strategy | Stock placeholders for MVP |

*OQ-02 included here because it affects generation pipeline design even if AI images are deferred.

---

### 🟡 Can Decide Later (10 decisions)

| # | Decision | Must Decide Before |
|---|---|---|
| OQ-05 | Maximum prompt length | UI build |
| OQ-06 | Maximum pages per website | AI prompt engineering |
| OQ-07 | Republish downtime strategy | Publishing feature build |
| OQ-08 | Free tier limits | Billing module build |
| OQ-09 | Code viewer — permanently read-only? | Editor build |
| OQ-10 | Chat history / context strategy | AI chat build |
| OQ-11 | Future language roadmap | v2 planning |
| OQ-12 | Custom domain verification method | Custom domain feature build |
| OQ-13 | Ecommerce — real payments or UI-only? | Ecommerce feature build (P2) |
| OQ-14 | Accessibility standard | AI prompt engineering |

---

*Document maintained by: Antigravity AI*  
*Next step: Owner review and approval of all 🔴 Must Decide decisions before system design begins*

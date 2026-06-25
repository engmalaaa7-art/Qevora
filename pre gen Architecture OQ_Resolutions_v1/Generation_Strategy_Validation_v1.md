# Qevora — Generation Strategy Validation
**Version:** 1.0  
**Date:** 2026-06-25  
**Task:** 002.5  
**Status:** Awaiting Final Decision

---

## The Question

Which internal format should Qevora use to represent a generated website?

| | Option A | Option B |
|---|---|---|
| **Format** | Multi-file static site (HTML + CSS + JS) | Structured JSON Site Schema + Component Renderer |
| **AI Output** | Raw HTML, CSS, JavaScript code | A JSON document describing pages, sections, components, and design tokens |
| **Preview** | Serve files in an iframe | Render JSON → HTML on the fly via a platform renderer |
| **Publish** | Upload files directly to CDN | Render JSON → static files → upload to CDN |

---

## 1. Scalability

### Option A — Static HTML/CSS/JS

The AI generates raw code. For a 3-page website, the context window carries ~5,000–15,000 tokens of HTML/CSS. For a 10-page website with ecommerce, this balloons to 40,000–80,000+ tokens per edit request.

**Core problem:** Every AI chat edit requires sending the entire current codebase back to the model. As websites grow in complexity, both cost and latency grow linearly — and can eventually exceed model context limits.

| Aspect | Assessment |
|---|---|
| Small websites (1–3 pages) | ✅ Works well |
| Medium websites (4–10 pages) | ⚠️ Growing token cost |
| Large websites (10+ pages, ecommerce) | ❌ Context window strain, high cost |
| Multi-tenant (thousands of users) | ⚠️ Cost unpredictable at scale |

---

### Option B — JSON Site Schema + Renderer

The AI generates and edits a structured JSON document. A 10-page ecommerce site's JSON schema might be 3,000–8,000 tokens — regardless of how much visual complexity the renderer produces. The AI only needs to understand the schema, not the full rendered code.

**Core advantage:** The AI edits a compact, structured document. The renderer handles all the HTML/CSS complexity. Context window usage stays bounded.

| Aspect | Assessment |
|---|---|
| Small websites (1–3 pages) | ✅ Works well |
| Medium websites (4–10 pages) | ✅ Works well, JSON stays compact |
| Large websites (10+ pages, ecommerce) | ✅ JSON scales; renderer handles complexity |
| Multi-tenant (thousands of users) | ✅ Predictable, bounded token costs |

**Winner: Option B** — JSON scales gracefully. Static HTML does not.

---

## 2. AI Editing Capability

### Option A — Static HTML/CSS/JS

When a user says *"change the hero background to dark blue"*, the AI must:
1. Receive the full codebase
2. Locate the correct CSS rule(s) across potentially hundreds of lines
3. Rewrite the file(s) correctly
4. Return the complete modified file set

**Failure modes:**
- AI accidentally removes or corrupts unrelated CSS rules
- AI modifies the wrong selector (e.g., affects all sections, not just hero)
- AI introduces syntax errors in HTML structure
- Inconsistent indentation / code style degrades with each edit
- After 10+ edits, code quality degrades noticeably ("edit rot")

**Success rate expectation:** ~75–85% on simple edits. Lower on structural changes.

---

### Option B — JSON Site Schema + Renderer

When a user says *"change the hero background to dark blue"*, the AI must:
1. Receive the current JSON schema (~2,000–5,000 tokens)
2. Update a single property: `pages[0].sections[0].background: "#0a1628"`
3. Return the modified JSON

The renderer converts this JSON → HTML/CSS automatically. The user never sees a broken site due to bad CSS — the renderer always produces valid output from valid JSON.

**Failure modes:**
- AI misunderstands which section the user means (mitigated by clear schema naming)
- AI outputs invalid JSON (mitigated by JSON schema validation + retry)
- Renderer has a bug and misrenders a component (platform bug, not AI bug)

**Success rate expectation:** ~90–95% on simple edits. Higher precision on structural changes because the AI edits properties, not code.

**Winner: Option B** — Structured edits are more reliable, precise, and degradation-resistant.

---

## 3. Live Preview Complexity

### Option A — Static HTML/CSS/JS

**Preview mechanism:** Serve the generated files from a temporary static URL and load them in an iframe.

| Step | Detail |
|---|---|
| After generation | Upload files to a temp S3 prefix → load URL in iframe |
| After each AI edit | Re-upload modified files → invalidate iframe URL or force reload |
| Latency per edit | File upload + CDN propagation = 2–5 seconds minimum |
| Accuracy | Preview = exact output = published site |

**Concern:** Each edit triggers a file upload cycle. For rapid, iterative editing this creates noticeable lag. Cross-origin iframe restrictions may also require CORS configuration for embedded fonts/assets.

---

### Option B — JSON Site Schema + Renderer

**Preview mechanism:** The renderer runs in the browser (client-side) or as a fast server-side render. JSON is passed directly to the renderer — no file upload required.

| Step | Detail |
|---|---|
| After generation | JSON passed to renderer → instant in-browser preview |
| After each AI edit | New JSON passed to renderer → preview updates in ~200–500ms |
| Latency per edit | Near-instant (no upload, no CDN) |
| Accuracy | Preview = what the renderer produces = published output |

**Concern:** The renderer must be very well-tested. A renderer bug affects all users simultaneously. Preview accuracy depends on renderer fidelity, not raw files.

**Winner: Option B** — Dramatically faster preview updates with no upload cycle. Critical for a fluid editing experience.

---

## 4. Ecommerce Support

### Option A — Static HTML/CSS/JS

A static site has no native dynamic data layer. To support ecommerce:
- Product listings must be hardcoded in HTML (not manageable)
- Cart requires JavaScript with localStorage (no real inventory)
- Checkout is UI-only or requires a third-party embed (Stripe.js, Snipcart)
- Adding a new product means AI rewrites the HTML page

**Result:** Ecommerce in static HTML is fundamentally limited. It works for a demo storefront but cannot scale to a real product catalog.

---

### Option B — JSON Site Schema + Renderer

The JSON schema can include a typed `ecommerce` section:

```json
{
  "ecommerce": {
    "products": [
      { "id": "p1", "name": "Handmade Chair", "price": 299, "image": "..." }
    ],
    "currency": "SAR",
    "cartEnabled": true
  }
}
```

The renderer handles cart logic, product page generation, and checkout UI natively. Adding a product is an AI JSON edit — not a code rewrite. A future real payment gateway integration connects to the JSON data layer cleanly.

**Winner: Option B** — Ecommerce is a natural extension of a structured data model. It is architecturally incompatible with raw static HTML at any serious scale.

---

## 5. Versioning Support

### Option A — Static HTML/CSS/JS

Versioning means storing snapshots of all files at each save point. For a 10-page site:
- Each version = ~50–200KB of HTML/CSS/JS files
- 20 versions × 10 users = manageable
- 20 versions × 10,000 users = significant storage cost
- Diffing between versions requires HTML/CSS diffing tools (complex, noisy)

---

### Option B — JSON Site Schema + Renderer

Versioning means storing snapshots of a compact JSON document:
- Each version = ~5–30KB of JSON
- 20 versions × 10,000 users = very manageable
- Diffing between versions = standard JSON diff (clean, readable)
- Rolling back = swap in the previous JSON document (instant)
- Branching in future = trivial with JSON

**Winner: Option B** — JSON versioning is 5–20x more storage-efficient and architecturally cleaner.

---

## 6. Maintenance Cost

### Option A — Static HTML/CSS/JS

| Factor | Assessment |
|---|---|
| Prompt engineering | High — AI must produce valid, consistent HTML/CSS/JS every time |
| Quality control | Hard — no schema to validate against; any code is "valid" |
| Bug surface | Large — AI can produce subtly broken HTML that only fails in certain browsers |
| Design consistency | Hard — AI may use different class names or styles in each generation |
| RTL support | Must be in the AI prompt; any prompt failure breaks RTL |
| New component types | Requires prompt updates + AI retraining/testing |

---

### Option B — JSON Site Schema + Renderer

| Factor | Assessment |
|---|---|
| Prompt engineering | Medium — AI must produce valid JSON matching a defined schema |
| Quality control | Easy — JSON schema validation catches all structural errors automatically |
| Bug surface | Bounded — renderer bugs are isolated and fixed once for all users |
| Design consistency | High — renderer enforces design tokens and component standards |
| RTL support | Renderer handles RTL natively based on `language: "ar"` in schema |
| New component types | Add to renderer + schema; AI learns the new type from schema definition |

**Upfront cost:** Building the renderer is significant engineering work (4–8 weeks for a production-quality renderer covering all MVP components).

**Long-term cost:** Option B is dramatically cheaper to maintain. Option A's maintenance cost grows with every new feature.

**Winner: Option B** — Higher upfront cost, substantially lower long-term cost.

---

## 7. RTL Support

### Option A — Static HTML/CSS/JS

RTL must be baked into every AI-generated page. The AI must:
- Set `dir="rtl"` on the `<html>` tag
- Flip all margin/padding directions in CSS
- Use RTL-compatible flexbox and grid patterns
- Choose an Arabic-compatible font in the CSS

Every prompt must carry RTL instructions. Every edit must preserve RTL integrity. Any AI slip produces a broken layout.

**Risk:** High. RTL correctness is entirely dependent on the AI prompt, which can drift or fail.

---

### Option B — JSON Site Schema + Renderer

The JSON schema carries `"language": "ar"` or `"direction": "rtl"`. The renderer applies RTL globally and consistently:
- `dir="rtl"` is set by the renderer
- All RTL CSS is in the renderer's stylesheet, not in AI-generated code
- Arabic font is selected by the renderer based on language setting
- AI edits never risk breaking RTL because RTL is not in the AI's code

**Risk:** Low. RTL is a platform concern, not an AI concern.

**Winner: Option B** — RTL is architecturally guaranteed, not prompt-dependent.

---

## Comparison Table

| Dimension | Option A (Static HTML/CSS/JS) | Option B (JSON + Renderer) | Winner |
|---|---|---|---|
| Scalability at volume | ⚠️ Token cost grows with site size | ✅ Bounded, compact JSON | **B** |
| AI editing accuracy | ⚠️ ~75–85%, degrades over edits | ✅ ~90–95%, stable | **B** |
| Live preview speed | ⚠️ 2–5s per edit (upload cycle) | ✅ ~200–500ms (in-browser) | **B** |
| Ecommerce support | ❌ Fundamentally limited | ✅ Natural data model fit | **B** |
| Versioning efficiency | ⚠️ Large files, complex diffs | ✅ Compact JSON, clean diffs | **B** |
| Maintenance cost (long-term) | ❌ Grows with every feature | ✅ Renderer isolates complexity | **B** |
| RTL Arabic support | ⚠️ Prompt-dependent, fragile | ✅ Architecturally guaranteed | **B** |
| Upfront build cost | ✅ Low — no renderer to build | ⚠️ Medium — renderer required | **A** |
| AI prompt simplicity | ✅ Familiar HTML patterns | ⚠️ Must learn JSON schema | **A** |
| Time to first MVP demo | ✅ Faster to demo | ⚠️ Renderer must exist first | **A** |

**Score: Option A = 3 | Option B = 7**

---

## Risk Register

### Risks of Option A (Static HTML/CSS/JS)

| Risk | Severity | Likelihood |
|---|---|---|
| AI edit "rot" — code quality degrades after repeated edits | High | High |
| Context window exceeded on large sites | High | Medium |
| RTL breaks silently due to AI prompt drift | High | Medium |
| Ecommerce hits a hard architectural wall at P2 | High | High |
| Token cost becomes unpredictable and expensive at scale | Medium | High |
| Versioning becomes impractical at volume | Medium | Medium |

---

### Risks of Option B (JSON + Renderer)

| Risk | Severity | Likelihood |
|---|---|---|
| Renderer build takes longer than expected | Medium | Medium |
| Renderer constrains design creativity (only renders known components) | Medium | Low–Medium |
| AI produces invalid JSON (mitigated by schema validation + retry) | Low | Low |
| Renderer has a bug that affects all users simultaneously | High | Low |
| Schema becomes too rigid for unusual design requests | Medium | Low |

---

## Recommendation

> **Option B — JSON Site Schema + Component Renderer**

The analysis is decisive across 7 of 10 dimensions. The three dimensions where Option A wins (upfront cost, prompt simplicity, time to first demo) are temporary advantages. The seven dimensions where Option B wins are permanent architectural advantages that compound over time.

**The core insight:**

> Static HTML is a good *output format* but a poor *editing format*. Qevora is primarily an editing platform, not a publishing tool. The internal representation must optimize for editing, not for initial generation.

**Critical note on RTL:** Given that Qevora's target market includes Arabic-speaking users as a first-class audience, making RTL correctness dependent on AI prompt accuracy (Option A) is an unacceptable product risk. Option B removes this risk entirely by making RTL a renderer concern.

---

## Recommended Architecture: Phased Approach

Rather than delaying the MVP to build the full renderer, use a pragmatic two-phase approach:

### Phase 1 — MVP (Weeks 1–8)
Use **Option A (Static HTML/CSS/JS)** as a temporary format to ship the MVP and validate the core user journey.

- Scope: 1–5 page websites only
- No ecommerce
- Enforce strict prompt templates to maximize RTL reliability
- Accept ~80% edit success rate as acceptable for early validation

### Phase 2 — Production (Weeks 6–16, parallel track)
Build the **JSON Schema + Renderer** alongside the MVP.

- Define the JSON schema spec during weeks 1–3
- Build the renderer during weeks 4–12
- Migrate internal format from HTML to JSON at Phase 2 launch
- Users on the platform see no change — same UI, better backend

**This phased approach ships fast without locking Qevora into the wrong architecture permanently.**

---

## Final Decision

| Decision | Choice |
|---|---|
| **Internal generation format (long-term)** | **Option B — JSON Site Schema + Component Renderer** |
| **MVP interim format** | Option A (Static HTML/CSS/JS) — time-boxed to MVP only |
| **Migration trigger** | When renderer is production-ready (target: 8–12 weeks post-MVP start) |

---

*Document maintained by: Antigravity AI*  
*Awaiting owner confirmation to proceed to system architecture design*

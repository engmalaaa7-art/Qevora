# AI Reality Verification Audit

## Purpose
Capture the current state of Qevora AI generation in the workspace and classify whether it is real, mocked, or partially mocked.

## Summary Conclusion
- `apps/api` contains a real AI generation path that depends on Anthropic and a router endpoint.
- `apps/web` has an offline/mock fallback path for local preview if the backend is unavailable.
- A plaintext `ANTHROPIC_API_KEY` exists in the workspace root `.env`, so the code is currently configured to run real generation if the backend loads the environment and network access is available.
- Actual remote call success has not been validated in this session.

## Key Files
- `apps/api/config.py`
  - Loads `.env` via `dotenv.load_dotenv()`.
  - Exposes `ANTHROPIC_API_KEY` to the backend.

- `apps/api/generation.py`
  - `call_claude(prompt, system)` uses `anthropic.Anthropic` and `base_url="https://router.bynara.id"`.
  - Attempts a model fallback list including `claude-3-5-sonnet-20241022`, `mistral-medium-3-5`, `mimo-v2.5-pro-free`, `mistral-large`, and `mimo-v2.5-free`.
  - `generate_website_schema(prompt)` calls `call_claude(...)` in a loop with self-repair retries.
  - `generate_schema_edit(...)` also calls `call_claude(...)` and falls back only to a simulated edit helper if the return value fails JSON validation.

- `apps/web/src/app/editor/page.tsx`
  - Primary path attempts backend API calls to `POST /projects/{project_id}/generate` or `/edit`.
  - If the backend is unreachable, it falls back to the local `@qevora/ai-engine` mock pipeline via `executeGenerationPipeline(...)`.
  - This frontend fallback is explicitly offline/mocked and does not invoke Anthropic.

- `packages/ai-engine/src/index.ts`
  - Contains `mockExtractIntent`, `mockGenerateTheme`, `mockAssembleSchema`, and `executeGenerationPipeline`.
  - This package is a client-side mock engine intended for local offline behavior, not remote AI.

## Real vs Mocked Classification
- `apps/api` backend: `REAL` AI pipeline, conditional on a valid `ANTHROPIC_API_KEY` and network access to the Bynara router endpoint.
- `apps/web` editor: `PARTIAL` because the experience is hybrid:
  - Real when the backend API is reachable and configured.
  - Mocked/offline when the backend fails or is not reachable.

## Evidence
- `apps/api/generation.py` includes the actual Anthropic SDK client and model fallback list.
- The backend load path is direct; there is no internal bypass to mocked JSON for generation requests.
- The frontend contains a fallback path that only executes when fetch to backend fails.
- `.env` contains `ANTHROPIC_API_KEY`, indicating the repo is prepared for real AI execution.

## Verification Status
- `ANTHROPIC_API_KEY` presence: CONFIRMED in workspace `.env`.
- Backend env loading: CONFIRMED via `apps/api/config.py`.
- Remote AI call success: NOT VERIFIED in this session.
- Database connectivity and backend runtime: still blocked by local DB availability and not required for AI generation classification itself.

## Blockers & Risks
- The backend depends on local PostgreSQL for full API flow; if DB is offline, the service may still start but some endpoints may fail.
- There is an exposed secret in `.env` inside the repository, which is a security risk.
- The real AI path can still fail if the router key is invalid, the model list is unavailable, or network access is blocked.

## Recommendations
1. Validate the backend by running `uvicorn main:app --port 8000` from `apps/api` and hitting `/health`.
2. Execute a test generation request through `POST /projects/{project_id}/generate` once the DB is available.
3. If you want offline mode only, refactor `apps/web/src/app/editor/page.tsx` to hide the local fallback or label it clearly as simulated.
4. Keep secrets out of checked-in `.env`; move to secure environment management if you intend this repo to be shared.

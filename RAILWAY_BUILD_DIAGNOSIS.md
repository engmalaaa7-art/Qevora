# Railway Build Diagnosis & Resolution Report

## 1. Root Cause
The Railway deployment failed with `"/apps/api": not found` because Railway automatically detected the service in the `apps/api` directory and set the **Root Directory / Build Context** to `/apps/api`. 

However, `apps/api/Dockerfile` is designed to be built from the **monorepo root** (`/`). When the Docker daemon executed `COPY apps/api/requirements.txt ./apps/api/`, it failed because the folder `apps/api` does not exist *inside* the `/apps/api` context.

## 2. Evidence
- **Repository Structure:** Qevora is a Turborepo monorepo. The backend resides in `apps/api/` while shared packages reside in `packages/`.
- **Dockerfile Contents:** `apps/api/Dockerfile` explicitly copies from the root:
  - `COPY package.json ...`
  - `COPY packages ./packages`
  - `COPY apps/api/requirements.txt ./apps/api/`
- **Error Log:** `failed to calculate checksum. "/apps/api": not found` confirms that the context is scoped too narrowly and the path cannot be resolved.

## 3. Dependency Audit
**Can the backend run independently from `apps/api`?**
**NO.**
The FastAPI backend depends on monorepo packages. Specifically, `apps/api/main.py` and `apps/api/worker.py` invoke a Node.js process:
`["node", "packages/renderer/dist/compile-cli.js"]`
This requires `@qevora/qevora-renderer` and its compiled dependencies (`schemas`, `ui`, `design-system`) to be present in the final Docker image. Thus, the backend cannot be decoupled from the monorepo packages.

## 4. Chosen Fix: Docker Build from Repository Root
The correct deployment strategy is to override Railway's default directory detection so that the entire monorepo root is passed to the Docker daemon as the Build Context. 

## 5. Required Configuration Changes Inside Railway
To fix the deployment, apply the following exact settings in your Railway Service Settings (Settings -> Build):

* **Builder:** `Dockerfile`
* **Root Directory:** `/`
* **Dockerfile Path:** `apps/api/Dockerfile`
* **Build Context:** `/` (if Railway prompts for it, though Root Directory `/` naturally sets the context to root).

*Leave the Start Command empty (it will automatically use the `CMD` from the Dockerfile).*

## 6. Code Modifications
One minor code change was required in `apps/api/main.py`. The `WORKDIR` of the Python runner in the Dockerfile is `/app/apps/api`. Therefore, the `subprocess.Popen` call to invoke the Node.js compiler must step up two directories to reach the packages folder.

**Modified File:** `apps/api/main.py`
**Change:**
```diff
- ["node", "packages/renderer/dist/compile-cli.js"],
+ ["node", "../../packages/renderer/dist/compile-cli.js"],
```

## 7. Remaining Manual Steps
1. Open the Railway Dashboard for your API service.
2. Navigate to **Settings > Build**.
3. Change the **Root Directory** from `/apps/api` to `/`.
4. Change the **Dockerfile Path** to `/apps/api/Dockerfile`.
5. Trigger a manual redeploy. 

The deployment will successfully compile the Node.js renderer stage and launch the FastAPI runner.

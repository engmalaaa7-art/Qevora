# Qevora Deployment Guide (Cloud-Agnostic V2)

Qevora can now be deployed natively on any major cloud provider simply by connecting your Git repository and supplying environment variables.

## Universal Requirements
Regardless of the platform, you must configure the environment variables defined in `.env.production`.

---

## 1. Railway (railway.app)
1. Connect your GitHub repository.
2. Railway will automatically detect `railway.json`.
3. It will provision a `Dockerfile` build from the root context using `apps/api/Dockerfile`.
4. Add your variables to the `Variables` tab.
5. Deploy.

---

## 2. Render (render.com)
1. Connect your GitHub repository to Render.
2. Render will automatically detect the `render.yaml` Blueprint.
3. Apply the Blueprint. It will create `qevora-api`, `qevora-worker`, and a PostgreSQL database.
4. Fill in the missing secrets (JWT_SECRET, CLOUDINARY, etc.) in the Render Dashboard.

---

## 3. Fly.io (fly.io)
1. Install `flyctl`.
2. Run `fly launch --no-deploy`.
3. The existing `fly.toml` will be used automatically.
4. Set secrets:
   ```bash
   fly secrets set DATABASE_URL="..." JWT_SECRET="..." ANTHROPIC_API_KEY="..."
   ```
5. Run `fly deploy`.

---

## 4. Koyeb (koyeb.com)
1. Connect GitHub repository.
2. Select the repository `engmalaaa7-art/Qevora`.
3. In Koyeb dashboard, override the Dockerfile path to: `apps/api/Dockerfile`
4. Or use Koyeb CLI with the `koyeb.yaml` file:
   ```bash
   koyeb app init --config koyeb.yaml
   ```

---

## 5. Local Docker Compose
For testing the production build locally:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## 6. Kubernetes
Apply the deployment and secrets:
```bash
kubectl apply -f k8s-deployment.yaml
```

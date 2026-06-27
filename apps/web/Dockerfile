# Stage 1: Dependency resolution and build
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Copy workspace package lists and lockfiles
COPY package.json package-lock.json tsconfig.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/shared/package.json ./packages/shared/
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/ui/package.json ./packages/ui/
COPY packages/renderer/package.json ./packages/renderer/
COPY packages/ai-engine/package.json ./packages/ai-engine/

# Install dependencies (bootstrap workspaces)
RUN npm ci

# Copy source trees
COPY apps/web ./apps/web
COPY packages/schemas ./packages/schemas
COPY packages/shared ./packages/shared
COPY packages/design-system ./packages/design-system
COPY packages/ui ./packages/ui
COPY packages/renderer ./packages/renderer
COPY packages/ai-engine ./packages/ai-engine

# Build workspace libraries first, then the web app
RUN npx turbo run build --filter=qevora-web-app

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone outputs
COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage standalone output tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

# Next.js standalone runner script
CMD ["node", "apps/web/server.js"]

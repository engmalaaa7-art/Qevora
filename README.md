# Qevora

Qevora is a next-generation AI-powered website builder platform that combines generative design with an intuitive visual editor. It enables users to rapidly construct, customize, and deploy stunning web interfaces using natural language and direct manipulation.

## Architecture

The project is structured as a robust, scalable monorepo using **Turborepo** to manage applications and shared packages. It features a Next.js React frontend and a FastAPI Python backend, alongside a suite of shared TypeScript packages.

### Applications
*   `apps/web`: The core Next.js application (Frontend / Dashboard / Visual Editor).
*   `apps/api`: The FastAPI Python backend (AI Generation / User Management / Database).

### Packages
*   `@qevora/ui`: Shared React UI components based on Radix and Tailwind CSS.
*   `@qevora/design-system`: The foundational design tokens, themes, and styles.
*   `@qevora/schemas`: Zod schemas for cross-environment validation (API/Web).
*   `@qevora/shared`: Common utilities, constants, and types.
*   `@qevora/renderer`: The core engine responsible for translating AI JSON schemas into React AST.
*   `@qevora/ai-engine`: The service layer interacting with Anthropic/LLMs.

## Requirements

*   **Node.js**: v20+
*   **Python**: 3.10+
*   **PostgreSQL**: 15+ (Neon recommended for production)
*   **Redis**: 7+ (Upstash recommended for production)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/qevora.git
    cd qevora
    ```
2.  **Install Node dependencies:**
    ```bash
    npm install
    ```
3.  **Install Python dependencies:**
    ```bash
    cd apps/api
    python -m venv .venv
    source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
    pip install -r requirements.txt
    ```

## Development

1.  Copy `.env.example` to `.env` in the root, `apps/web`, and `apps/api` directories, and fill in the required values.
2.  Start the development server (runs both frontend and backend if configured, or run them separately):
    ```bash
    npm run dev
    ```

## Production

This repository is optimized for production deployments.

### Web (Frontend)
The Next.js application (`apps/web`) is pre-configured for seamless deployment to Vercel. Ensure all environment variables are properly set in your Vercel project.

### API (Backend)
The FastAPI application (`apps/api`) can be deployed to any Docker-compatible environment (Render, AWS, GCP). It utilizes `uvicorn` and requires configuration of the environment variables found in `apps/api/.env.example`.

## Commands

*   `npm run dev`: Start all applications in development mode.
*   `npm run build`: Build all applications and packages for production.
*   `npm run lint`: Run ESLint and TypeScript checks across the monorepo.
*   `npm run test`: Run the test suites.
*   `npm run format`: Format code across the repository.
*   `npm run clean`: Remove all build artifacts and caches.
*   `npm run migrate`: Run database migrations using Prisma.
*   `npm run seed`: Seed the database with initial data.
*   `npm run generate`: Run code generators (e.g., Prisma client generation).

## Deployment Preparation

This repository has passed a strict production readiness audit:
*   ✔ Secrets removed from all tracked files.
*   ✔ `.gitignore` configured to prevent accidental leakage of sensitive files, `.env` configs, and cache directories.
*   ✔ Absolute deterministic builds via `turbo`.
*   ✔ Cleaned dependencies and no circular imports.
*   ✔ Strict TypeScript and ESLint compliance verified.
*   ✔ Standardized environment template configuration.

For deployment, provision your services (Neon, Upstash, Cloudinary) and inject the appropriate keys into your deployment platform. **Do not commit production secrets.**

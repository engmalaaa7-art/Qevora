# Qevora Architecture Graph

```mermaid
graph TD
    %% Environments
    subgraph Environments
        Prod[production]
        Dev[development]
        Test[testing]
    end

    %% Web Application
    subgraph Frontend [Next.js Web Application]
        Web(apps/web)
    end

    %% Backend Service
    subgraph Backend [Python FastAPI Server]
        Api(apps/api)
        Worker(qevora-worker)
        Config(config.py)
    end

    %% Packages
    subgraph Packages [Monorepo Packages]
        Schemas(@qevora/schemas)
        Shared(@qevora/shared)
        DesignSystem(@qevora/design-system)
        UI(@qevora/ui)
        AIEngine(@qevora/ai-engine)
    end

    %% Renderer (Node.js Compiler)
    subgraph Compiler [Node.js Renderer Binary]
        Renderer(renderer.cjs)
    end

    %% Databases
    subgraph Data [Data & Storage]
        Postgres[(PostgreSQL)]
        Redis[(Redis Queue & Cache)]
        Cloudinary[Cloudinary Storage]
    end

    %% Dependency Links
    Web -->|HTTP/REST| Api
    Web -->|Depends on| Schemas
    Web -->|Depends on| Shared
    Web -->|Depends on| DesignSystem
    Web -->|Depends on| UI

    %% The Backend only depends on the compiled Binary
    Api -->|Subprocess Execution| Renderer
    Worker -->|Subprocess Execution| Renderer
    Api --> Config
    Worker --> Config
    
    %% The Renderer depends on the workspace at BUILD TIME only
    Renderer -.->|Built From| Schemas
    Renderer -.->|Built From| Shared
    Renderer -.->|Built From| DesignSystem
    Renderer -.->|Built From| UI
    
    %% Backend to Data
    Api --> Postgres
    Worker --> Postgres
    Api --> Redis
    Worker --> Redis
    Api --> Cloudinary
```

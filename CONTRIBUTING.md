# Contributing to Qevora

First off, thank you for considering contributing to Qevora! It's people like you that make Qevora such a great platform.

## Branching Strategy (Git Flow)

We follow a structured branch model to ensure stability and smooth deployments:
- **`main`**: The production-ready state. Commits to this branch should only come from `staging`.
- **`staging`**: The pre-production release candidate environment.
- **`develop`**: The integration branch for new features.
- **`feature/*`**: Branches for active development (e.g., `feature/ai-model-upgrade`).

**Workflow:** `feature/*` -> `develop` -> `staging` -> `main`

## Commit Convention

We enforce the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This leads to more readable messages that are easy to follow when looking through the project history and allows us to generate changelogs automatically.

### Allowed Commit Types:
*   `feat:` A new feature
*   `fix:` A bug fix
*   `docs:` Documentation only changes
*   `style:` Changes that do not affect the meaning of the code (white-space, formatting, etc)
*   `refactor:` A code change that neither fixes a bug nor adds a feature
*   `perf:` A code change that improves performance
*   `test:` Adding missing tests or correcting existing tests
*   `build:` Changes that affect the build system or external dependencies
*   `ci:` Changes to our CI configuration files and scripts
*   `chore:` Other changes that don't modify src or test files

### Examples:
*   `feat: add Anthropic Claude 3.5 Sonnet fallback logic`
*   `fix: resolve JWT token expiration edge case`
*   `docs: update API documentation for /generate endpoint`
*   `refactor: modularize Next.js editor components`

## Semantic Versioning Policy

We strictly follow [Semantic Versioning (SemVer)](https://semver.org/).

Given a version number `MAJOR.MINOR.PATCH` (e.g., `v1.0.0`):
- **MAJOR (`v2.0.0`)**: Incompatible API or architectural changes (e.g., massive database migration, dropping older Node.js support).
- **MINOR (`v1.1.0`)**: Backwards-compatible new features (e.g., adding a new AI provider, new dashboard page).
- **PATCH (`v1.0.1`)**: Backwards-compatible bug fixes (e.g., fixing a UI glitch or a small validation bug).
- **Pre-releases**: Tagged with suffixes like `-rc.1`, `-alpha.1` for testing phases (e.g., `v1.0.0-rc.1`).

## Pull Request Process

1. Ensure your code passes all linting (`npm run lint`) and testing (`npm run test`) checks.
2. Ensure you have targeted the `develop` branch (or `feature/` integration branch) for your PR.
3. Update the `CHANGELOG.md` with details of changes to the interface, if applicable.
4. Your PR must be approved by at least one CODEOWNER before merging.

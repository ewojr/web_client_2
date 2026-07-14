# Contributing to the Password Depot Web Client

Thanks for your interest in contributing! This document explains how to set up
the project, the conventions we follow, and how to get a change merged.

By participating you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).
For security issues, **do not** open a public issue — follow the
[Security Policy](SECURITY.md) instead.

## Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later (ships with Node.js 20+)
- A **Password Depot Enterprise Server** 19.x with REST API v2.0 enabled, to run
  the client against. The API contract is documented at
  https://github.com/acebit-gmbh/pd_rest_api.

## Getting started

```bash
npm install

# Point the dev proxy at your PD Server (see .env.example):
cp .env.example .env.local
# then edit .env.local and set DEV_PROXY_TARGET=https://your-pd-server:8714

npm run dev
```

The app runs at `http://localhost:5173`. Requests to `/v2.0`, `/file`, and
`/temp` are proxied to `DEV_PROXY_TARGET`.

## Before you open a pull request

Run the same checks CI runs — all must pass:

```bash
npm run lint        # ESLint (must be clean)
npm run build       # tsc -b (type-check) + vite build
npm run test:run    # Vitest (must be green)
npm run format      # Prettier — format your changes
```

## Conventions

- **TypeScript is `strict`.** Avoid `any`; the API contract is fully typed in
  `src/api/types.ts`. Keep request/response types in sync with the REST API spec.
- **Architecture.** Keep the layering intact: React components → TanStack Query
  hooks (`src/hooks`) → API functions (`src/api`) → the `apiClient` fetch wrapper.
  The `src/api` layer must not import stores, config, or routing directly — it is
  wired via `src/lib/apiBindings.ts`. Client state lives in Zustand stores
  (`src/stores`); all server state lives in TanStack Query.
- **i18n.** All user-facing strings must be added to **every** locale file in
  `src/i18n/locales/` (`en`, `de`, `fr`, `es`, `nl`). Structural parity across
  the files is enforced by `src/i18n/locales.test.ts`. Do not hardcode UI text.
- **Security.** Never log secrets (tokens, passwords, second passwords). Don't
  persist sensitive data to `localStorage`/cookies. Keep responses `no-store`.
- **Formatting** is enforced by Prettier (`.prettierrc`); don't hand-format.
- **Tests.** Add or update tests for behavior you change. New utilities and hooks
  should come with unit tests; user-facing flows benefit from React Testing
  Library tests.

## Pull request guidelines

- Branch from `master` and keep PRs focused on a single change.
- Write a clear description of **what** changed and **why**; link any related issue.
- Make sure lint, build, and tests pass locally before requesting review.
- Update documentation (README / `docs/`) when you change behavior or config.

## Reporting bugs and requesting features

Use the GitHub issue templates. For bugs, include reproduction steps, the web
client version/commit, and the PD Server / REST API version. For security
vulnerabilities, see [SECURITY.md](SECURITY.md).

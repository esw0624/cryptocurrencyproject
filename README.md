# Cryptocurrency Project Monorepo

This repository is organized as an npm workspaces monorepo for a crypto data + prediction platform.

## Repository Structure

- `apps/web` — React + TypeScript frontend (Vite).
- `apps/api` — TypeScript backend for market-data ingestion and prediction endpoints.
- `packages/shared` — Shared TypeScript interfaces used across web/API.

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy templates and fill in real values:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 3) Run development servers

Run each app in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

- API default: `http://localhost:4000`
- Web default: `http://localhost:5173`

### 4) Build, lint, and type-check the workspace

```bash
npm run build
npm run lint
npm run typecheck
```

## Architecture Overview

- **API (`apps/api`)** exposes:
  - `POST /market-data/ingest` for accepting market price payloads.
  - `POST /predict` for prediction requests/responses.
  - `GET /health` for service status.
- **Shared package (`packages/shared`)** contains request/response contracts to keep backend and frontend in sync.
- **Web app (`apps/web`)** is ready to consume API endpoints via `VITE_API_BASE_URL`.

## Baseline Workspace Scripts (root)

- `dev:web`
- `dev:api`
- `build`
- `lint`
- `typecheck`

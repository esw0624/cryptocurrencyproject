# Cryptocurrency Project Monorepo

This repository is organized as an npm workspaces monorepo for a crypto market + prediction platform.

## Current Scope

The platform is currently configured for these assets:

- **Bitcoin (BTC)**
- **Ethereum (ETH)**
- **XRP**

The API and dashboard are aligned to this same asset list so we can extend cleanly to more coins in future iterations.

## Repository Structure

- `apps/web` — React + TypeScript frontend (Vite).
- `apps/api` — TypeScript backend for market snapshots, history, and prediction endpoints.
- `packages/shared` — Shared TypeScript interfaces and DTOs.
- `src` + `tests` — Baseline data pipeline utilities and tests.

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Run development servers

Run each app in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

- API default: `http://localhost:3000`
- Web default: `http://localhost:5173`

### 3) Run checks

```bash
npm run lint
npm run typecheck
npm test
```

## API Endpoints Used by the Dashboard

- `GET /api/markets?symbols=BTC,ETH,XRP`
- `GET /api/history?symbol=BTC&timeframe=1M`
- `GET /api/prediction?symbol=BTC&timeframe=1M`
- `GET /health`

## GitHub Domain / GitHub Pages

You can deploy the web app to GitHub Pages as a temporary domain.

Expected URL format:

- `https://<your-github-username>.github.io/cryptocurrencyproject/`

The Vite config already supports GitHub Pages by automatically setting `base` when `GITHUB_PAGES=true` in CI. You can also override with `VITE_BASE_PATH` if needed.

## Disclaimer

This project and its model outputs are for educational and research purposes only and **do not constitute financial advice**.

# CCNA Zero-to-Hero Professional 3D Lab Project

An interactive CCNA training platform with professional 3D networking labs. The project is built phase-by-phase as specified in `PROMPT.md` and `CLAUDE.md`.

## Status

All 29 phases (0–28) are implemented and validated. Each phase has a dedicated lab in the roadmap and a working view. A public landing page and contact page are now live at `/` and `/contact`, while the app runs under `/app`. The latest `npm run build` passes with no TypeScript errors.

## Tech Stack

- **UI**: React 18 + TypeScript + Vite + Tailwind CSS
- **3D**: React Three Fiber + Three.js + `@react-three/drei`
- **Routing**: React Router
- **State**: Zustand with `localStorage` persistence
- **Icons**: Lucide React

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` for the landing page, `http://localhost:5173/app` for the lab app, and `http://localhost:5173/contact` for contact info.

## Build

```bash
npm run build
```

## Project Files

- `CLAUDE.md` — persistent implementation rules for Claude.
- `PROMPT.md` — master build prompt covering the complete phase-by-phase product.
- `README.md` — project overview.
- `ARCHITECTURE.md` — design and data-model documentation.
- `CHANGELOG.md` — release history.
- `PHASE0_REPORT.md` through `PHASE18_28_REPORT.md` — Phase-by-phase completion reports.

## Important

The 3D environment is functional, not merely decorative. Devices, ports, cables, topology, packet flow, configuration state, and troubleshooting scenarios will connect to the learner's actions as phases progress.

All networking activities are limited to the in-browser lab simulation and the user's own authorized environments.

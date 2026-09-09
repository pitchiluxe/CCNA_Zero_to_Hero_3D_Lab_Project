# Phase 13 Completion Report

## Objective

Build a multi-router routing fundamentals lab that teaches connected routes, static routes, default routes, longest prefix match, and hop-by-hop reachability.

## Features Implemented

- Added `routing` to the `Lab.view` union for multi-router labs.
- Built `RoutingLab` component:
  - Three-router SVG topology with two end-station PCs.
  - Each router lists its connected routes automatically.
  - Static route editor: add destination, mask, next hop, and metric.
  - Remove custom static routes.
  - Clickable topology selects a router to inspect/edit.
  - Link up/down toggles to simulate failures.
  - Hop-by-hop packet trace with longest prefix match.
  - Ping test shows the exact path taken (e.g., PC-1 → R1 → R2 → R3 → PC-3).
- Route lookup:
  - Connected routes are derived from each interface.
  - User-added static routes support longest prefix match.
  - Default route `0.0.0.0/0` is only chosen after more specific routes fail.
- Created `lab-routing-fundamentals` and mapped it to Phase 13 in the roadmap.

## 3D / Interactive Lab Features

- SVG topology with clickable routers and PC nodes.
- Real-time route table updates.
- Hop-by-hop path trace and failure messages.

## Tests / Validation

- `npm run build` completed with no TypeScript errors.
- `dist/` generated successfully.

## Known Issues / Limitations

- The lab is a simplified simulator; it does not support dynamic routing protocols or full Cisco CLI syntax.
- Links are configured as a hardcoded adjacency list rather than learned by the routing table.
- IPv6 and floating static routes are not implemented in this phase.

## Documentation Updated

- `ARCHITECTURE.md`
- `CHANGELOG.md`
- This `PHASE13_REPORT.md`

## Acceptance Criteria

A learner can:

- Open the Routing Fundamentals lab.
- Inspect connected routes on each router.
- Add static routes on R1, R2, and R3 to reach remote networks.
- Add a default route and observe it only matches when a more specific route is absent.
- Ping PC-3 from PC-1 and see the hop-by-hop path.
- Disable a link and observe the ping fail, then re-enable it and recover.
- Mark the lab as complete and track it on the dashboard.

All criteria are met.

## Recommended Next Phase

**Phase 14 — Static Routing**: formalize the static/default route lab, add IPv6 support, and add a floating static route challenge.

## Decision

Awaiting user approval to continue to Phase 14.

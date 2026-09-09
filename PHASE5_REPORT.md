# Phase 5 Completion Report

## Objective

Build a subnetting masterclass with interactive calculators, subnet visualization, timed drills, and a VLSM design challenge.

## Features Implemented

- Added `subnet` to the `Lab.view` union for non-3D subnetting labs.
- Extended `src/utils/ip.ts` to export `ipToNumber`, `numberToIp`, `maskToPrefix`, and `prefixToMask`.
- Created `src/utils/subnet.ts` with:
  - `countUsableHosts(mask)`
  - `getSubnetDetails(network, mask)`
  - `getSubnets(network, mask, newPrefix)`
  - `prefixForHostCount(hosts)`
- Built `SubnettingLab` with four tabs:
  - **Calculator**: input IP and mask, output network, broadcast, first/last host, usable hosts, and CIDR prefix.
  - **Visualizer**: split a major network into smaller subnets with a tabulated list.
  - **Drills**: timed, random subnetting questions (network, broadcast, usable hosts, CIDR for host count) with score, attempts, and live feedback.
  - **Challenge**: VLSM design for Sales (50), HR (10), IT (20), and Management (5) hosts using 192.168.10.0/24.
- `SubnettingLab` records the running drill accuracy to `useProgress.quizScores['Subnetting']`.
- Created `lab-subnetting-masterclass` and mapped it to Phase 5 in the roadmap.

## 3D / Interactive Lab Features

- No 3D scene for this phase; it is a purpose-built interactive tools view.
- The learner can experiment with live CIDR values and see calculated results immediately.

## Tests / Validation

- `npm run build` completed with no TypeScript errors.
- `dist/` generated successfully.

## Known Issues / Limitations

- The VLSM challenge validates that each department's prefix fits its host count and that the total addresses fit in /24, but does not yet allocate exact non-overlapping ranges automatically.
- Drills do not save full per-question history; they record the best running score to the quiz tracker.

## Documentation Updated

- `ARCHITECTURE.md`
- `CHANGELOG.md`
- This `PHASE5_REPORT.md`

## Acceptance Criteria

A learner can:

- Open the Subnetting Masterclass lab.
- Use the calculator to find network/broadcast/usable hosts.
- Use the visualizer to split a major network.
- Practice timed drills and see score and feedback.
- Attempt the VLSM department challenge and validate the design.
- Mark the lab as complete and track it on the dashboard.

All criteria are met.

## Recommended Next Phase

**Phase 6 — IPv6**: build an IPv6 address notation, compression, and type lab with address validation and quizzes.

## Decision

Awaiting user approval to continue to Phase 6.

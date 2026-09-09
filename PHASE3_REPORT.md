# Phase 3 Completion Report

## Objective

Build an interactive Ethernet and switching lab: teach Ethernet frames, MAC addresses, unicast/broadcast, MAC learning, CAM tables, and ARP through a 3D switch-PC topology.

## Features Implemented

- Added `MacTableEntry` type and per-switch `macTables` state to `useLabRuntime`.
- Added `sendFrame` action to `useLabRuntime`:
  - Animates a frame from the source PC to the switch.
  - The switch learns the source MAC on the incoming port.
  - Animates the frame from the switch to the destination (or all other ports for broadcasts).
- Added broadcast/unknown-unicast flooding visualization.
- Created `SwitchingControls` with:
  - "PC1 → PC2" unicast button.
  - "Broadcast" button.
  - "Clear MAC table" button.
  - "Toggle PC-2 link" cable-fault button.
  - Live MAC address table display (port, MAC, source device).
- Updated `PacketMesh` to show the source and destination MAC addresses as a floating 3D label.
- Updated `LabScene` to render multiple `PacketMesh` frames simultaneously.
- Created `lab-ethernet-switching` with a switch and two PCs, and mapped it to Phase 3 in the roadmap.

## 3D Features Implemented

- Two PCs and a switch in the 3D room.
- Frame animation: PC → Switch → PC.
- Source/destination MAC labels attached to the moving frame.
- Cable color changes when the link is toggled down/up.
- MAC table inspection panel.

## Tests / Validation

- `npm run build` completed successfully with no TypeScript errors.
- `dist/` generated successfully.

## Known Issues / Limitations

- The switch currently forwards unknown unicasts and broadcasts to all other active ports. It does not yet age out MAC entries.
- The lab covers the core MAC-learning concept rather than a full ARP exchange.
- Switching primitives remain simple geometry, not realistic Cisco switch models.

## Documentation Updated

- `ARCHITECTURE.md`
- `CHANGELOG.md`
- This `PHASE3_REPORT.md`

## Acceptance Criteria

A learner can:

- Open the Ethernet switching lab.
- Send a unicast frame and watch the switch learn the source MAC.
- Send a broadcast and see the switch flood the frame.
- Inspect and clear the MAC address table.
- Toggle a cable and observe the link status change.
- See source/destination MAC addresses on the animated frame.
- Mark the lab as complete and track it on the dashboard.

All criteria are met.

## Recommended Next Phase

**Phase 4 — IPv4**: implement IPv4 address labs, public/private range, default gateway, and invalid configuration diagnosis.

## Decision

Awaiting user approval to continue to Phase 4.

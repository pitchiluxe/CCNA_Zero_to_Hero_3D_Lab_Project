# Architecture — CCNA 3D Lab Platform

## Stack

- **Framework**: React 18 (Vite + SWC) with TypeScript
- **Styling**: Tailwind CSS 3.4 with custom Cisco/networking color tokens
- **3D**: React Three Fiber (R3F) over Three.js with `@react-three/drei` helpers
- **State**: Zustand with `persist` middleware for localStorage
- **Routing**: React Router for dashboard / lab views

## High-level Flow

```
Public
  ├── Landing Page (/)
  └── Contact Page (/contact)

App
  ├── Dashboard (/app)
  ├── Lab View (/app/lab/:labId)
  └── Progress Store (completed labs, notes, bookmarks, quiz scores, theme)
```

## Data Models

- `Phase` — a CCNA learning phase with a number, title, summary, and lab IDs.
- `Lab` — a hands-on lab with objectives, device definitions, cable definitions, and an optional specialized view.
- `Device` — a 3D device with position, type, color, and interfaces.
- `Interface` — name, MAC, optional IP/mask/gateway, connected device, and `up`/`down` state.
- `Cable` — a link between two device interfaces with `up`/`down` status.
- `MacTableEntry` — MAC address learned on a switch port, with the source device.
- `QuizQuestion` — a multiple-choice question with explanation and scoring.
- `LabTask` — optional guided step in an interactive lab.

## State Management

`useProgress` Zustand store persists:

- `completedLabIds`
- `completedPhaseIds`
- `quizScores`
- `notes` (per lab)
- `bookmarks`
- `theme` (`light`/`dark`)
- `search`
- `onboarding` flag

## 3D Scene

- `LabScene` renders the room, devices, cables, and optional `PacketMesh` traffic.
- `DeviceMesh` maps a `DeviceType` to a primitive geometry and places a `Html` label.
- `CableLine` draws a `Line` between the computed centers of two devices.
- `PacketMesh` animates a packet (sphere) from source to destination device.
- `OrbitControls` allow the learner to orbit, zoom, and pan.
- Clicking a device sets the selected device for the inspector panel.

## Interactive Lab Engine

- `useLabRuntime` manages mutable lab state: devices, cables, frames, per-switch MAC tables, and interface IPv4 settings.
- It supports adding/removing devices, connecting free interfaces, toggling cables, toggling interfaces, sending packet-flow visualizations, `sendFrame` for Ethernet switching, `ping` for IPv4 reachability, and `checkIPv4Issues` for duplicate/invalid IPv4 validation.
- `LabControls` provides buttons and dropdowns for general interactive labs; `SwitchingControls` adds MAC-table, broadcast, and unicast frame actions; `IPv4Controls` edits IP/mask/gateway and tests connectivity.
- `DeviceInspector` can toggle an interface up/down; the engine recalculates dependent cable statuses.

## Routing

- `/` — Dashboard
- `/lab/:labId` — Lab view (3D, OSI flow, or subnetting tools)

## Phase 0 Scope

Foundation only: dashboard, course roadmap, lab library, search, bookmarks, quiz foundation, progress/mastery tracking, and the first 3D network operations room.

## Phase 1 Scope

Interactive networking fundamentals: build a basic LAN, connect devices, diagnose a disconnected cable, and diagnose a disabled interface. Includes live 3D device placement, port/cable connection, link LED status, and packet-flow visualization.

## Phase 2 Scope

OSI / TCP-IP packet flow: `OsiFlowView` shows encapsulation and decapsulation across layers, PDUs, and a failure-diagnosis challenge where the learner identifies the failing OSI layer.

## Phase 3 Scope

Ethernet switching and MAC learning: `lab-ethernet-switching` lets the learner send unicast/broadcast frames, watch the switch learn source MACs on incoming ports, inspect/clear the MAC table, and toggle cables to see link effects.

## Phase 4 Scope

IPv4 addressing: `lab-ipv4-basics` teaches IP/mask/gateway assignment, validates same-subnet reachability with `ping`, and identifies/fixes duplicate IP and other IPv4 configuration issues.

## Phase 5 Scope

Subnetting masterclass: `lab-subnetting-masterclass` provides a subnet calculator, subnet visualizer, timed drills, and a VLSM department challenge.

## Phase 6 Scope

IPv6 fundamentals: `lab-ipv6-basics` teaches IPv6 address notation, compression, address types, EUI-64 identifiers, and SLAAC address generation.

## Phase 7 Scope

Cisco IOS foundations: `lab-cisco-ios` provides a simulated Cisco CLI with EXEC and configuration modes, `hostname`, `interface`, `ip address`, `no shutdown`, `show` and `write` commands, plus objective tracking.

## Phase 8 Scope

Switch configuration: `lab-switch-config` extends the CLI simulator with `enable secret`, `banner motd`, management SVI, `ip default-gateway`, SSH (`crypto key generate rsa`, VTY `transport input ssh`), and `switchport port-security`.

## Phase 9 Scope

VLANs and trunking: `lab-vlans` lets the learner assign access VLANs, configure 802.1Q trunks, and test same-VLAN/different-VLAN reachability across two switches.

## Phase 10 Scope

Inter-VLAN routing: `lab-inter-vlan-routing` demonstrates router-on-a-stick with 802.1Q subinterfaces, a switch trunk to the router, and a ping test that validates routing between VLANs.

## Phase 11 Scope

Spanning Tree Protocol: `lab-stp` shows a triangular switch topology, root bridge election, root/designated/blocking port roles, BPDU animation, and PortFast / BPDU Guard toggles.

## Phase 12 Scope

EtherChannel: `lab-etherchannel` bundles parallel switch links into a Port-Channel, shows aggregate bandwidth, and lets the learner fail a member to observe redundancy.

## Phase 13 Scope

Routing fundamentals: `lab-routing-fundamentals` shows a multi-router topology, connected routes, a static route editor, longest prefix match, and hop-by-hop packet tracing.

## Phase 14 Scope

Static routing: `lab-static-routing` adds a square topology with primary and floating static routes, a default route, and a failover demonstration when the primary link is disabled.

## Phase 15 Scope

OSPF: `lab-ospf` demonstrates link-state neighbor adjacency, router IDs, areas, interface costs, and SPF-based shortest path route calculation across a multi-router topology.

## Phase 16 Scope

DHCP: `lab-dhcp` simulates the DORA exchange, lets the learner configure a DHCP pool, and validates that the pool matches the client subnet.

## Phase 17 Scope

DNS: `lab-dns` provides an editable zone record table and a query simulator that traces recursive resolution through root, TLD, and authoritative servers, including NOERROR, NXDOMAIN, and NODATA.

## Phase 18–28 Scope

- `lab-nat` — NAT/PAT translation table.
- `lab-acl` — ACL rule building and packet testing.
- `lab-wireless` — AP SSID, channel, band, and security configuration.
- `lab-security` — Security controls and hardening score.
- `lab-automation` — JSON parsing and REST/JSON/YAML concepts.
- `lab-wireshark` — Packet capture filter and inspection.
- `lab-troubleshoot` — Symptom-based root-cause scenarios.
- `lab-capstone` — Enterprise network design checklist.
- `lab-examprep` — CCNA review questions.
- `lab-portfolio` — GitHub README markdown generator.
- `lab-career` — Skill readiness and role gap analysis.

## Performance

Specialized lab components are loaded with `React.lazy` + `Suspense` from `LabView.tsx`. Vite emits a separate chunk for each lab, so only the 3D engine and the dashboard load on initial visit. This keeps the main bundle smaller and defers lab-specific code until the learner navigates to a lab.

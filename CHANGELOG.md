# Changelog

## 0.23.0 — GitHub Release, Favicon, and Screenshots

- Generated `favicon.ico` and touch icons from a custom SVG network icon.
- Added icon links (`favicon.ico`, `apple-touch-icon`) to `index.html`.
- Captured screenshots of landing, dashboard, 3D lab room, and contact pages.
- Added a Screenshots section to `README.md` so images render on GitHub.
- Initialized git repository, created `https://github.com/pitchiluxe/CCNA_Zero_to_Hero_3D_Lab_Project`, and pushed.

## 0.22.0 — Landing Page & Contact Page

- Added `framer-motion` and `react-helmet-async` dependencies.
- Built a technical, animated landing page with hero, features, how-it-works, and CTA sections.
- Added an animated SVG network background with pulsing nodes and moving packets.
- Added a live 3D lab preview on the landing page using the `lab-room` topology with auto-rotation and animated packets.
- Built a contact page for Eric Omari (`erickomari243@gmail.com`) with mailto + Gmail compose links.
- Wired the contact page to `public/Erick.jpg` for the profile photo.
- Moved the dashboard/app behind `/app/*` and made `/` the landing page.
- Added a public navigation header with Home, App, and Contact tabs (mobile hamburger menu).
- Updated `index.html` with SEO meta tags, Open Graph, Twitter Card, and structured data.
- Added `lg` size to the `Button` component.

## 0.21.0 — Roadmap / OSI Bug Fixes

- Fixed `Dashboard` roadmap so clicking a phase opens the first lab in the phase's declared order, not the `labs.ts` object order.
- Swapped Phase 0 labs so `lab-room` (3D Network Operations Room) is the first lab.
- Restarted the Vite dev server so the latest code is served to the browser preview.
- Fixed `OsiFlowView` stage math so the last stage no longer produces an invalid layer index and the page no longer goes blank after simulation.

## 0.20.0 — Cleanup and Code-Splitting

- Removed unused `eigrp` view and `EigrpLab` component.
- Added `React.lazy` + `Suspense` to `LabView` for all specialized lab components.
- Production build now splits each lab into its own chunk, reducing the main JS bundle.
- Added `npm run typecheck` script to `package.json` for quick TypeScript validation.
- Updated `README.md` to reflect the completed 0–28 phase status.

## 0.19.0 — Phases 18–28 Completion

- Implemented the remaining 11 phases with dedicated view types and lab components:
  - `nat`, `acl`, `wireless`, `security`, `automation`, `wireshark`, `troubleshoot`, `capstone`, `examprep`, `portfolio`, `career`.
- Built `NatLab` for static/dynamic/PAT translations.
- Built `AclLab` for permit/deny rule testing.
- Built `WirelessLab` for SSID, channel, band, and security configuration.
- Built `SecurityLab` for toggling SSH, AAA, DHCP Snooping, DAI, and Port Security.
- Built `AutomationLab` for JSON parsing and device data validation.
- Built `WiresharkLab` for packet display filters and inspection.
- Built `TroubleshootingLab` for symptom-based root-cause scenarios.
- Built `CapstoneLab` for enterprise network design checklists.
- Built `ExamPrepLab` for CCNA review questions.
- Built `PortfolioLab` for GitHub README markdown generation.
- Built `CareerLab` for skill readiness and role gap analysis.
- Updated `phases.ts` and `labs.ts` so every phase 0–28 now has a lab.

## 0.18.0 — Phase 17: DNS

- Added `dns` to `Lab.view` for DNS labs.
- Built `DnsLab` with an editable zone record table.
- Supports A, AAAA, CNAME, MX, and PTR records.
- Simulates recursive resolution through root, TLD, and authoritative servers.
- Handles NOERROR, NXDOMAIN, and NODATA responses.
- Follows CNAME chains when resolving.
- Created `lab-dns` and mapped it to Phase 17 in the roadmap.

## 0.17.0 — Phase 16: DHCP

- Added `dhcp` to `Lab.view` for DHCP labs.
- Built `DhcpLab` for the DHCP DORA process.
- Pool editor for network, mask, default gateway, DNS, and lease range.
- Simulates Discover, Offer, Request, Ack with console-style logging.
- Validates that the pool matches the client subnet and shows a failure when it does not.
- Created `lab-dhcp` and mapped it to Phase 16 in the roadmap.

## 0.16.0 — Phase 15: OSPF

- Added `ospf` to `Lab.view` for link-state routing labs.
- Built `OspfLab` with a four-router diamond topology and two PCs.
- Toggles OSPF per router, edits router IDs and areas, and sets per-interface costs.
- Computes neighbor adjacencies and OSPF routes with a simplified SPF (Dijkstra).
- Displays OSPF neighbor table and routing table for the selected router.
- Link up/down toggles and cost changes trigger route recalculation.
- Created `lab-ospf` and mapped it to Phase 15 in the roadmap.

## 0.15.0 — Phase 14: Static Routing

- Added `static` to `Lab.view` for static routing labs.
- Built `StaticRoutingLab` with a square four-router topology and two end PCs.
- Supports primary static routes and floating static routes with different metrics.
- Ping result now includes the total metric and notes when the backup path is used.
- Added a `Disable R1-R2 (primary)` button to demonstrate floating-static failover.
- Created `lab-static-routing` and mapped it to Phase 14 in the roadmap.

## 0.14.0 — Phase 13: Routing Fundamentals

- Added `routing` to `Lab.view` for multi-router labs.
- Built `RoutingLab` with three routers, two PCs, and an SVG topology.
- Displays connected routes automatically plus a per-router static route editor.
- Implements longest prefix match for route selection, including default routes.
- Traces the full packet path hop-by-hop across routers to the destination.
- Supports link up/down toggles and failure detection.
- Created `lab-routing-fundamentals` and mapped it to Phase 13 in the roadmap.

## 0.13.0 — Phase 12: EtherChannel

- Added `etherchannel` to `Lab.view` for link-aggregation labs.
- Built `EtherChannelLab` with a two-switch topology and three parallel links.
- Supports selecting member links and creating a Port-Channel in LACP, PAgP, or static mode.
- Displays aggregate throughput based on the number of active bundled links.
- Includes a ping test, traffic animation, and a "fail one member" resilience demo.
- Created `lab-etherchannel` and mapped it to Phase 12 in the roadmap.

## 0.12.0 — Phase 11: STP

- Added `stp` to `Lab.view` for specialized topology labs.
- Built `StpLab` with a three-switch triangle topology.
- Computes root bridge, root ports, designated ports, and blocking ports live as priorities change.
- Added BPDU animation toggle on the topology SVG.
- Added PortFast and BPDU Guard toggles per link.
- Added a challenge to identify the blocking port.
- Created `lab-stp` and mapped it to Phase 11 in the roadmap.

## 0.11.0 — Phase 10: Inter-VLAN Routing

- Built `InterVlanControls` for router-on-a-stick and SVI inter-VLAN routing.
- Validates inter-VLAN reachability by checking router subinterfaces, switch trunk allowed lists, access VLANs, and PC default gateways.
- Created `lab-inter-vlan-routing` with a router, a switch, and two PCs in VLANs 10 and 20.
- The lab starts with pre-configured subinterface IPs and PC gateways so the learner can immediately test and then modify.
- Mapped the lab to Phase 10 in the roadmap.

## 0.10.0 — Phase 9: VLANs

- Added `vlan`, `mode`, and `trunkAllowed` optional fields to `Interface`.
- Extended `useLabRuntime` with `setVlan`, `setMode`, and `setTrunkAllowed`.
- Built `VlanControls` for access/trunk configuration and VLAN-aware reachability testing.
- `DeviceInspector` now displays VLAN, mode, and allowed list when present.
- Created `lab-vlans` with two switches and four PCs across two VLANs.
- VLAN ping logic checks access VLAN, trunk allowed lists, and same-VLAN connectivity.
- Mapped the VLAN lab to Phase 9 in the roadmap.

## 0.9.0 — Phase 8: Switch Configuration

- Built `SwitchConfigLab` for switch CLI simulation.
- Supports user/privileged/config/interface/line config modes for switch features.
- Commands: `hostname`, `enable secret`, `banner motd`, `ip default-gateway`, `ip domain-name`, `username`, `crypto key generate rsa`, `interface vlan 1`, `ip address`, `no shutdown`, `line vty 0 4`, `login local`, `transport input ssh`, `switchport port-security` with sticky, maximum, and violation options.
- `show` commands: `running-config`, `startup-config`, `ip interface brief`, `port-security`, `interfaces`.
- Tracks objectives: hostname, secret, banner, SVI, default gateway, SSH on VTY, port security, save.
- Created `lab-switch-config` and mapped it to Phase 8 in the roadmap.

## 0.8.0 — Phase 7: Cisco IOS

- Added `ios` to `Lab.view` for CLI-based labs.
- Built `CiscoIosLab`: a Cisco IOS-like terminal simulator.
- Supports user EXEC (`>`), privileged EXEC (`#`), global config, and interface config modes.
- Commands: `enable`, `disable`, `configure terminal`, `hostname`, `interface`, `ip address`, `no shutdown`, `show running-config`, `show startup-config`, `show ip interface brief`, `show interfaces`, `write memory`, `copy running-config startup-config`.
- Tracks objectives: enable, hostname, interface config, IP address, no shutdown, save.
- Created `lab-cisco-ios` and mapped it to Phase 7 in the roadmap.

## 0.7.0 — Phase 6: IPv6

- Added `ipv6` to `Lab.view` for non-3D IPv6 labs.
- Created `src/utils/ipv6.ts` with IPv6 expand/compress, type detection, EUI-64, link-local, and SLAAC helpers.
- Built `IPv6Lab` with:
  - Address type detector.
  - Compress/expand tool.
  - EUI-64 and SLAAC generator.
  - Timed drills for compression, address types, and EUI-64.
  - Address type classification challenge.
- Created `lab-ipv6-basics` and mapped it to Phase 6 in the roadmap.

## 0.6.0 — Phase 5: Subnetting Masterclass

- Added `subnet` to `Lab.view` for non-3D subnetting labs.
- Created `src/utils/subnet.ts` with CIDR-to-mask, usable host count, subnet details, and VLSM helpers.
- Extended `ip.ts` with exported `ipToNumber`, `numberToIp`, `maskToPrefix`, and `prefixToMask`.
- Built `SubnettingLab` with:
  - Subnet calculator (network, broadcast, range, usable hosts).
  - Subnet visualizer (split a major network into smaller subnets).
  - Timed subnetting drills with score and accuracy tracking.
  - VLSM design challenge for department host requirements.
- Created `lab-subnetting-masterclass` and mapped it to Phase 5 in the roadmap.

## 0.5.0 — Phase 4: IPv4

- Added `mask` and `gateway` optional fields to `Interface`.
- Created `src/utils/ip.ts` with IPv4 validation, network/broadcast calculation, subnet, and duplicate detection.
- Extended `useLabRuntime` with `setIp`, `setMask`, `setGateway`, `ping`, and `checkIPv4Issues`.
- Built `IPv4Controls` with IP/mask/gateway editing, ping, and configuration validation.
- Created `lab-ipv4-basics` with a router, switch, two PCs, and an intentional duplicate IP fault.
- Mapped the IPv4 lab to Phase 4 in the roadmap.

## 0.4.0 — Phase 3: Ethernet & Switching

- Added `MacTableEntry` type and `macTables` state to `useLabRuntime`.
- Added `sendFrame` action that animates a frame PC → Switch → PC and learns the source MAC on the switch.
- Added broadcast/unknown-unicast flooding visualization.
- Added MAC table inspection and clear controls in `SwitchingControls`.
- Updated `PacketMesh` to display source and destination MAC addresses as a 3D label.
- Created `lab-ethernet-switching` and mapped it to Phase 3.

## 0.3.0 — Phase 2: OSI & TCP/IP

- Added `Lab.view` support for non-3D interactive labs (`flow`).
- Built `OsiFlowView` with animated encapsulation/decapsulation across the OSI layers.
- Added a failure-injection challenge where the learner diagnoses the failing OSI layer.
- Created `lab-osi-packet-flow` and mapped it to Phase 2 in the roadmap.

## 0.2.0 — Phase 1: Computer & Networking Foundations

- Extended `Lab` type with `interactive` and `tasks` support.
- Built `useLabRuntime` for live lab manipulation (add/remove devices, connect/disconnect/toggle cables, toggle interfaces, send packets, reset).
- Added `LabControls` panel and `DeviceInspector` interface toggling for interactive labs.
- Added packet-flow visualization (`PacketMesh`) along active cables.
- Created three Phase 1 labs: `Build a Basic LAN`, `Diagnose a Disconnected Cable`, and `Diagnose a Disabled Interface`.
- Updated the course roadmap to mark Phase 1 labs.

## 0.1.0 — Phase 0: Project Foundation

- Project scaffold: Vite + React + TypeScript + Tailwind CSS.
- Added React Three Fiber, `@react-three/drei`, Zustand, React Router, Lucide React.
- Built professional dashboard with progress cards, course roadmap, and lab library.
- Implemented search, dark/light theme toggle, bookmarks, and per-lab notes.
- Added quiz engine foundation with scoring and explanations.
- Implemented first 3D network operations room (rack, router, switch, PCs, server, AP, cables).
- Added device inspector, objectives, and lab-completion tracking.
- Validated with `npm run build` and manual browser preview.

# PROMPT — Build the CCNA Zero-to-Hero Professional 3D Lab Platform

## MASTER ROLE

Act as a senior software architect, full-stack engineer, Cisco networking instructor, network-lab designer, 3D/WebGL engineer, UX designer, QA engineer, and technical writer.

Build a professional **CCNA Zero-to-Hero Interactive 3D Lab Platform** from absolute beginner through advanced CCNA-level networking.

This is not a simple quiz application. It must become a hands-on networking training environment where a learner can understand, configure, visualize, troubleshoot, and document networks.

Read `CLAUDE.md` first and follow it throughout the project.

---

# PHASE 0 — PROJECT FOUNDATION

Build the application foundation.

### Requirements
- Professional dashboard
- Course roadmap
- Phase/lesson navigation
- Lab library
- Progress tracking
- Quiz engine foundation
- Mastery tracking
- User-friendly onboarding
- Responsive UI
- Dark/light professional networking theme
- Search
- Notes/bookmarks
- Lab completion tracking

### 3D
Create the first 3D environment:
- Network operations room
- Equipment racks
- Router
- Switch
- PCs
- Server
- Wireless AP
- Cable objects
- Interactive camera

### Acceptance
A learner can enter the application, see the roadmap, enter a lab, inspect the 3D environment, and record progress.

---

# PHASE 1 — COMPUTER & NETWORKING FOUNDATIONS

Teach and build labs for:
- LAN/WAN
- Internet/intranet
- Hosts
- Servers
- Routers
- Switches
- APs
- Firewalls
- Modems
- NICs
- Ethernet/fiber/wireless
- Topologies
- Bandwidth
- Throughput
- Latency
- Jitter
- Packet loss

### Labs
1. Build a basic LAN.
2. Connect PCs through a switch.
3. Add a router.
4. Add a server.
5. Diagnose a disconnected cable.
6. Diagnose a disabled interface.

### 3D
Allow the learner to:
- Place devices.
- Connect ports.
- Remove/reconnect cables.
- See link LEDs/status.
- Inspect device properties.
- Visualize traffic.

---

# PHASE 2 — OSI & TCP/IP

Teach:
- OSI layers
- TCP/IP model
- PDUs
- Encapsulation
- Decapsulation
- Layer responsibilities
- Protocol/device mapping

### Interactive Lab
Create a packet-flow visualization:

Application
↓
Transport
↓
Network
↓
Data Link
↓
Physical

Show encapsulation and decapsulation as traffic travels between two hosts.

### Challenge
Learner must identify where a simulated failure occurs.

---

# PHASE 3 — ETHERNET & SWITCHING

Teach:
- Ethernet frames
- MAC addresses
- Unicast/multicast/broadcast
- MAC address tables
- CAM tables
- Switching
- Collision domains
- Broadcast domains
- Duplex/speed
- ARP

### Labs
- Observe MAC learning.
- Generate broadcasts.
- Inspect MAC table.
- Clear MAC table and observe relearning.
- Troubleshoot wrong port/cable.

### 3D
Show:
PC → Switch → PC

Animate frames and show source/destination MAC addresses.

---

# PHASE 4 — IPv4

Teach:
- IPv4 structure
- Network/host portions
- Subnet masks
- CIDR
- Private/public addressing
- APIPA
- Loopback
- Network/broadcast/host ranges
- Default gateway

### Labs
- Assign IPv4 addresses.
- Test connectivity.
- Identify invalid configurations.
- Fix incorrect gateway.
- Fix duplicate IP scenario in an isolated simulation.

### 3D
Show IP and MAC details on device inspection panels.

---

# PHASE 5 — SUBNETTING MASTERCLASS

Make subnetting a core training engine.

Teach:
- Binary
- Decimal conversion
- CIDR
- Subnet masks
- /24 through /30
- VLSM
- Network address
- Broadcast address
- Usable hosts
- Subnet calculations

### Interactive Tools
Build:
- Binary calculator
- CIDR calculator
- Subnet visualizer
- Timed drills
- Adaptive difficulty

### Labs
Example:
192.168.10.0/24

Create departments requiring different host counts.

Make the learner design the subnets.

### Tracking
Track:
- Accuracy
- Time
- Attempts
- Weak CIDR ranges
- Improvement over time

---

# PHASE 6 — IPv6

Teach:
- Address notation
- Compression
- Global unicast
- Link-local
- Unique local
- Multicast
- Anycast
- SLAAC
- DHCPv6
- Neighbor Discovery
- ICMPv6

### Labs
- Configure IPv6 hosts.
- Configure IPv6 interfaces.
- Test IPv6 connectivity.
- Troubleshoot addressing.

---

# PHASE 7 — CISCO IOS

Build a Cisco CLI training simulator where practical.

Teach:
- EXEC modes
- Configuration hierarchy
- Interfaces
- Hostname
- IP addressing
- Shutdown/no shutdown
- Descriptions
- Running/startup config
- Verification commands

Support realistic commands such as:
enable
configure terminal
hostname
interface
ip address
no shutdown
description
show running-config
show startup-config
show ip interface brief
show interfaces
show version
show mac address-table
show arp
copy running-config startup-config

### CLI Requirements
- Command history
- Context-aware help
- Error messages
- Command completion where appropriate
- Configuration persistence
- Device-specific state
- Verification commands

Clearly label simulated CLI behavior where it is not actual Cisco IOS.

---

# PHASE 8 — SWITCH CONFIGURATION

Teach:
- Secure management
- Hostname
- Local users
- SSH
- Management IP
- Default gateway
- Interface descriptions
- Port configuration
- Unused port shutdown
- Port security

### Lab
Build and secure a switch from scratch.

Include an instructor validation engine that checks configuration without exposing the solution.

---

# PHASE 9 — VLANs

Teach:
- VLAN purpose
- VLAN IDs
- Access ports
- Trunk ports
- 802.1Q
- Native VLAN
- Voice VLAN
- Management VLAN

### Lab
Create:
VLAN 10 USERS
VLAN 20 SERVERS
VLAN 30 VOICE
VLAN 40 MANAGEMENT

Require learner configuration and verification.

### 3D
Display VLAN membership and trunk/access state visually.

---

# PHASE 10 — INTER-VLAN ROUTING

Teach:
- Router-on-a-stick
- SVIs
- Layer 3 switching
- Default gateways

### Broken Labs
Introduce faults:
- Missing VLAN
- Incorrect trunk
- Native VLAN mismatch
- Wrong gateway
- Down SVI

Learner must troubleshoot rather than receive the answer.

---

# PHASE 11 — STP

Teach:
- Loops
- STP
- Root bridge
- Root port
- Designated port
- Blocking/forwarding
- BPDU
- Rapid PVST+
- PortFast
- BPDU Guard

### 3D
Create a topology where redundant links exist.

Animate:
- Root election
- Path selection
- Blocked port
- Forwarding state

### Challenge
Learner predicts which port blocks before running the simulation.

---

# PHASE 12 — ETHERCHANNEL

Teach:
- EtherChannel
- LACP
- PAgP
- Aggregation
- Load balancing
- Requirements
- Troubleshooting

### Lab
Create a failed EtherChannel caused by mismatched settings.

Learner must diagnose and repair it.

---

# PHASE 13 — ROUTING FUNDAMENTALS

Teach:
- Routing table
- Connected routes
- Static routes
- Default routes
- Administrative distance
- Metrics
- Longest prefix match
- Next hop
- Exit interface

### 3D PACKET FLOW
Show the router decision process visually.

When a packet arrives:
1. Inspect destination IP.
2. Search routing table.
3. Apply longest-prefix match.
4. Select next hop/interface.
5. Re-encapsulate.
6. Forward.

---

# PHASE 14 — STATIC ROUTING

Labs:
- Static routes
- Default routes
- Floating static routes
- IPv4
- IPv6

Include deliberate misconfigurations and troubleshooting.

---

# PHASE 15 — OSPF

Teach:
- Dynamic routing
- Link-state concepts
- Neighbors
- Adjacencies
- Router ID
- Areas
- Area 0
- Cost
- DR/BDR
- LSAs
- SPF
- Passive interfaces

### Labs
1. Two-router OSPF.
2. Three-router OSPF.
3. Multi-network OSPF.
4. Broken adjacency.
5. Incorrect network statement.
6. Incorrect router ID.
7. Passive-interface troubleshooting.

### 3D
Visualize:
- Neighbor formation
- LSA exchange
- SPF calculation concept
- Route propagation

---

# PHASE 16 — DHCP

Teach:
- DORA
- DHCP server
- DHCP relay
- Helper address
- Troubleshooting

### Lab
Simulate clients receiving addresses.

Create a broken DHCP scenario where clients receive no valid lease.

Make learner diagnose it.

---

# PHASE 17 — DNS

Teach:
- DNS hierarchy
- A/AAAA
- CNAME
- MX
- PTR
- Forward/reverse lookup
- Recursive queries

### Lab
Create DNS resolution failures.

Learner uses:
nslookup
dig

and relevant simulated/device commands to troubleshoot.

---

# PHASE 18 — NAT/PAT

Teach:
- Static NAT
- Dynamic NAT
- PAT
- Inside local/global
- Outside local/global

### Lab
Build an internal network accessing an external simulated network.

Visualize address translation.

---

# PHASE 19 — ACLs

Teach:
- Standard ACL
- Extended ACL
- Wildcard masks
- Source/destination
- Protocol/port
- Implicit deny
- Inbound/outbound placement

### Lab
Requirement:
Allow HTTPS access to a server while blocking Telnet.

Learner creates and verifies the ACL.

Include incorrect ACL troubleshooting.

---

# PHASE 20 — WIRELESS

Teach:
- SSID
- AP
- WLAN
- 2.4/5/6 GHz
- Channels
- Interference
- WPA2/WPA3
- Enterprise wireless
- Controllers
- Roaming

### 3D
Create a professional wireless floor-plan visualization with AP coverage zones.

---

# PHASE 21 — NETWORK SECURITY

Teach:
- SSH
- AAA
- RADIUS
- TACACS+
- Port security
- DHCP snooping
- Dynamic ARP Inspection
- IP Source Guard
- VLAN security
- ACLs
- Management plane security

### Labs
Create safe configuration/hardening exercises.

---

# PHASE 22 — NETWORK AUTOMATION

Teach:
- APIs
- REST
- JSON
- YAML
- Python networking fundamentals
- Controllers
- SDN
- Intent-based networking
- Configuration automation

### Projects
- Parse network data.
- Generate configuration templates.
- Validate addressing.
- Query a simulated API.
- Produce a network inventory report.

---

# PHASE 23 — WIRESHARK

Integrate packet-analysis training.

Teach:
- ARP
- ICMP
- TCP
- UDP
- DNS
- DHCP
- HTTP
- TLS
- TCP handshake

Create packet-flow lessons and capture-analysis exercises.

Where direct packet capture is technically impractical, provide prepared safe captures and clearly explain the limitation.

---

# PHASE 24 — REAL-WORLD TROUBLESHOOTING CENTER

Build an incident/troubleshooting simulator.

Scenarios:
1. PC cannot reach gateway.
2. Gateway works but Internet does not.
3. One VLAN fails.
4. Trunk doesn't pass VLAN.
5. OSPF neighbors fail.
6. DHCP fails.
7. DNS fails.
8. EtherChannel fails.
9. Routing loop.
10. Users lose connectivity after a change.

### Investigation Interface
Give the learner:
- Network diagram
- Device status
- Interface status
- Logs
- Command outputs
- Symptoms
- Change history

The learner chooses commands and tests hypotheses.

Score:
- Diagnosis
- Commands chosen
- Reasoning
- Fix
- Verification
- Documentation

---

# PHASE 25 — CAPSTONE ENTERPRISE NETWORK

Build a realistic company network.

Example:

Internet
|
Edge Router/Firewall
|
Core
|
Distribution
|
Access Switches
|
--------------------------------
|       |       |       |       |
Users  Servers Voice Guest Mgmt

Include:
- VLANs
- Trunks
- Inter-VLAN routing
- OSPF
- DHCP
- DNS
- NAT/PAT
- ACLs
- Wireless
- Security hardening
- Monitoring

### Capstone Requirements
The learner must:
1. Design addressing.
2. Build topology.
3. Configure devices.
4. Verify connectivity.
5. Secure infrastructure.
6. Troubleshoot injected failures.
7. Document the network.
8. Produce a professional final report.

---

# PHASE 26 — CCNA EXAM PREPARATION

Build:
- Topic quizzes
- Scenario questions
- Configuration challenges
- Troubleshooting questions
- Timed subnetting
- Mock exams
- PBQ-style simulations

Never reveal answers before the learner attempts a question.

Explain:
- Why correct
- Why incorrect choices are wrong
- What clue identifies the concept

---

# PHASE 27 — GITHUB PORTFOLIO

For every major lab generate a GitHub-ready structure:

README.md
architecture/
configs/
screenshots/
captures/
documentation/
troubleshooting/
results/

Never include passwords, tokens, private keys, or secrets.

Generate professional commit-message suggestions.

---

# PHASE 28 — CAREER MODE

Add a career dashboard.

Prepare the learner for:
- NOC Technician
- Network Support Technician
- Junior Network Administrator
- Network Technician
- Junior Network Engineer

For each job description provided by the learner:
- Extract skills.
- Map to CCNA topics.
- Identify gaps.
- Create targeted labs.
- Create interview questions.
- Create troubleshooting scenarios.
- Suggest portfolio projects.

Never fabricate experience.

---

# UX / 3D QUALITY BAR

The final application should feel like a professional technical training product.

Avoid:
- Generic template UI
- Empty 3D rooms
- Decorative objects with no purpose
- Fake "3D" cards pretending to be a lab
- Unexplained buttons
- Broken interactions

Prefer:
- Realistic network equipment
- Interactive device inspection
- Clear topology visualization
- Packet animations
- Port/interface state
- Fault visualization
- Guided lab objectives
- Instructor hints
- Professional dashboards
- Smooth navigation
- Accessible controls
- 2D fallback for low-end hardware

---

# PHASE GATES

Do not proceed automatically to the next phase.

At the end of each phase provide:

## PHASE COMPLETION REPORT
- Features implemented
- Labs implemented
- 3D features implemented
- Tests passed
- Known issues
- Documentation updated
- Acceptance criteria
- Screenshots/evidence
- Recommended next phase

Wait for the user to approve continuation when appropriate.

---

# FIRST TASK

Do NOT build everything at once.

Start with:

1. Inspect the repository.
2. Propose architecture and technology choices.
3. Propose the 3D engine approach.
4. Propose the lab simulation architecture.
5. Propose data models.
6. Propose the phase implementation plan.
7. Build PHASE 0 only.
8. Test PHASE 0.
9. Produce the Phase 0 completion report.

Do not skip directly to later phases.

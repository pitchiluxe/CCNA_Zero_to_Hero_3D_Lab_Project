# CCNA Zero-to-Hero 3D Lab Project — Claude Build Instructions

## Mission
Build a professional, modular CCNA Zero-to-Hero training platform based on the phase plan in `PROMPT.md`.

Claude is the implementation agent. It must build the project phase-by-phase, maintain working code, document decisions, and never skip validation.

## Core Requirements
- Professional educational UI.
- Interactive, visual network topology.
- Professional 3D network lab experience wherever practical.
- Safe, isolated labs only.
- Beginner-friendly explanations with professional networking depth.
- Cisco CLI simulation/emulation where licensing and technical constraints permit.
- Packet Tracer/GNS3/EVE-NG integration guidance where direct embedding is impractical.
- Every lab must have objectives, topology, addressing, configuration, verification, troubleshooting, challenge, and evidence requirements.
- Track learner progress, mastery, quiz results, subnetting accuracy, troubleshooting performance, and completed labs.
- Generate professional GitHub-ready documentation for completed labs.
- Never hard-code secrets.

## 3D Direction
Create a polished 3D environment rather than a decorative 3D scene:
- Interactive racks, switches, routers, PCs, APs, cables, server rooms, and network maps.
- Click a device to inspect interfaces, status, IP/MAC information, and configuration.
- Cable/port visualization.
- Packet-flow visualization showing frame/packet movement.
- VLAN colors/tags and link status.
- Fault injection for authorized lab scenarios.
- Camera controls, zoom, orbit, labels, tooltips.
- Performance-conscious rendering and a fallback 2D topology view.
- Use WebGL/Three.js or an equivalent suitable stack if building a web application.

## Implementation Discipline
For every phase:
1. Read the phase requirements in `PROMPT.md`.
2. Inspect the existing project before changing it.
3. Implement the phase.
4. Run tests/lint/build.
5. Exercise the lab manually or with automated validation.
6. Fix regressions.
7. Update documentation.
8. Update progress tracking.
9. Do not move to the next phase until acceptance criteria are met.

## Safety
All networking activities must be limited to the user's own lab or explicitly authorized environments. Do not build features intended to attack public or unauthorized systems.

## Deliverables
Maintain:
- Source code
- Setup instructions
- Architecture documentation
- Lab documentation
- Screenshots where appropriate
- Test results
- GitHub README
- Changelog
- Known limitations
- Phase completion checklist

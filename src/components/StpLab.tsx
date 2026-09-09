import { useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface StpSwitch {
  id: string;
  name: string;
  priority: number;
  mac: string;
  x: number;
  y: number;
}

interface StpLink {
  id: string;
  from: string;
  to: string;
  cost: number;
  portFast: boolean;
  bpduGuard: boolean;
}

type Role = 'root' | 'designated' | 'blocking';

const INITIAL_SWITCHES: StpSwitch[] = [
  { id: 'sw1', name: 'SW1', priority: 32768, mac: '00:1a:2b:70:00:01', x: 200, y: 80 },
  { id: 'sw2', name: 'SW2', priority: 32768, mac: '00:1a:2b:70:00:02', x: 80, y: 250 },
  { id: 'sw3', name: 'SW3', priority: 32768, mac: '00:1a:2b:70:00:03', x: 320, y: 250 },
];

const INITIAL_LINKS: StpLink[] = [
  { id: 'l1', from: 'sw1', to: 'sw2', cost: 4, portFast: false, bpduGuard: false },
  { id: 'l2', from: 'sw1', to: 'sw3', cost: 4, portFast: false, bpduGuard: false },
  { id: 'l3', from: 'sw2', to: 'sw3', cost: 4, portFast: false, bpduGuard: false },
];

function bridgeId(sw: StpSwitch) {
  return `${sw.priority}.${sw.mac}`;
}

function bridgeValue(sw: StpSwitch) {
  // Compare by priority, then by MAC as a tie breaker
  return sw.priority * 1e12 + parseInt(sw.mac.replace(/:/g, ''), 16);
}

export function StpLab() {
  const [switches, setSwitches] = useState<StpSwitch[]>(INITIAL_SWITCHES);
  const [links, setLinks] = useState<StpLink[]>(INITIAL_LINKS);
  const [bpdu, setBpdu] = useState(false);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');

  const root = useMemo(() => {
    return [...switches].sort((a, b) => bridgeValue(a) - bridgeValue(b))[0];
  }, [switches]);

  const portRoles = useMemo(() => {
    const roles: Record<string, Record<string, Role>> = {};
    for (const sw of switches) roles[sw.id] = {};

    // Root bridge ports are all designated
    for (const sw of switches) {
      if (sw.id === root.id) {
        for (const l of links) {
          if (l.from === sw.id) roles[sw.id][`${l.from}-${l.to}`] = 'designated';
          if (l.to === sw.id) roles[sw.id][`${l.to}-${l.from}`] = 'designated';
        }
      }
    }

    // For non-root switches, calculate root port and designated/non-designated
    for (const sw of switches) {
      if (sw.id === root.id) continue;
      const directToRoot = links.find((l) => (l.from === sw.id && l.to === root.id) || (l.to === sw.id && l.from === root.id));
      if (directToRoot) {
        const key = directToRoot.from === sw.id ? `${directToRoot.from}-${directToRoot.to}` : `${directToRoot.to}-${directToRoot.from}`;
        roles[sw.id][key] = 'root';
      }

      for (const l of links) {
        if (l.from !== sw.id && l.to !== sw.id) continue;
        const other = l.from === sw.id ? l.to : l.from;
        if (other === root.id) continue;
        const key = l.from === sw.id ? `${l.from}-${l.to}` : `${l.to}-${l.from}`;
        if (roles[sw.id][key]) continue;

        // Compare root path cost to the other switch
        // This is a simplified triangle election: each non-root has the same cost to root (4)
        // so the one with the lower BID on this segment wins designated.
        const otherSw = switches.find((s) => s.id === other)!;
        if (bridgeValue(sw) < bridgeValue(otherSw)) {
          roles[sw.id][key] = 'designated';
          const otherKey = l.from === other ? `${l.from}-${l.to}` : `${l.to}-${l.from}`;
          roles[other][otherKey] = 'blocking';
        } else {
          roles[sw.id][key] = 'blocking';
          const otherKey = l.from === other ? `${l.from}-${l.to}` : `${l.to}-${l.from}`;
          roles[other][otherKey] = 'designated';
        }
      }
    }

    return roles;
  }, [switches, links, root]);

  const handlePriority = (id: string, value: string) => {
    const n = parseInt(value, 10);
    if (isNaN(n)) return;
    setSwitches((prev) => prev.map((s) => (s.id === id ? { ...s, priority: n } : s)));
  };

  const toggleLink = (id: string) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, cost: l.cost === 99999 ? 4 : 99999 } : l)));
  };

  const togglePortFast = (id: string) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, portFast: !l.portFast } : l)));
  };

  const toggleBpduGuard = (id: string) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, bpduGuard: !l.bpduGuard } : l)));
  };

  const checkGuess = () => {
    const blocking = Object.entries(portRoles).flatMap(([sw, map]) =>
      Object.entries(map)
        .filter(([_, r]) => r === 'blocking')
        .map(([key, _]) => `${switches.find((s) => s.id === sw)?.name} ${key}`)
    );
    if (blocking.some((b) => b.toLowerCase().includes(guess.toLowerCase()))) setFeedback('Correct! That port is in the blocking/alternate role to prevent a loop.');
    else setFeedback(`Not quite. A blocking port is ${blocking[0] ?? 'none'}.`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">Spanning Tree Protocol Lab</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Observe root bridge election, port roles, and the blocked redundant path in a triangular switch topology.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Topology</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Root</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Designated</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Blocking</span>
            </div>
          </div>
          <svg viewBox="0 0 400 320" className="w-full rounded border border-slate-200 dark:border-net-700">
            {links.map((l) => {
              const a = switches.find((s) => s.id === l.from)!;
              const b = switches.find((s) => s.id === l.to)!;
              const roleA = portRoles[a.id]?.[`${a.id}-${b.id}`];
              const roleB = portRoles[b.id]?.[`${b.id}-${a.id}`];
              const color = roleA === 'blocking' || roleB === 'blocking' ? '#f43f5e' : roleA === 'root' || roleB === 'root' ? '#10b981' : '#3b82f6';
              return (
                <g key={l.id}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={4} strokeDasharray={l.cost === 99999 ? '8 4' : undefined} />
                  {bpdu && (
                    <circle r="5" fill="#facc15">
                      <animate attributeName="cx" values={`${a.x};${b.x}`} dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="cy" values={`${a.y};${b.y}`} dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
            {switches.map((sw) => (
              <g key={sw.id}>
                <circle cx={sw.x} cy={sw.y} r="28" fill={root.id === sw.id ? '#10b981' : '#334155'} />
                <text x={sw.x} y={sw.y + 4} textAnchor="middle" className="fill-white text-[10px] font-bold">{sw.name}</text>
                <text x={sw.x} y={sw.y + 45} textAnchor="middle" className="fill-slate-500 text-[9px]">{bridgeId(sw)}</text>
              </g>
            ))}
          </svg>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold">Bridge Priorities</h3>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Lower bridge ID wins root election.</p>
            <div className="space-y-2">
              {switches.map((sw) => (
                <div key={sw.id} className="flex items-center gap-2 text-sm">
                  <span className="w-20 font-medium">{sw.name}</span>
                  <input
                    type="number"
                    value={sw.priority}
                    onChange={(e) => handlePriority(sw.id, e.target.value)}
                    className="w-24 rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900"
                  />
                  {root.id === sw.id && <Badge status="up">ROOT</Badge>}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold">Port Roles</h3>
            <div className="space-y-1 text-sm">
              {switches.map((sw) =>
                Object.entries(portRoles[sw.id] ?? {}).map(([key, role]) => {
                  const [from, to] = key.split('-');
                  return (
                    <div key={key} className="flex items-center justify-between rounded border border-slate-200 p-2 dark:border-net-700">
                      <span className="font-mono">{sw.name} → {switches.find((s) => s.id === to)?.name}</span>
                      <RoleBadge role={role} />
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold">Link Controls</h3>
            <div className="space-y-2">
              {links.map((l) => {
                const a = switches.find((s) => s.id === l.from)?.name;
                const b = switches.find((s) => s.id === l.to)?.name;
                return (
                  <div key={l.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="min-w-[80px]">{a}—{b}</span>
                    <Button size="sm" variant={l.cost === 99999 ? 'secondary' : 'ghost'} onClick={() => toggleLink(l.id)}>
                      {l.cost === 99999 ? 'Enable' : 'Disable'}
                    </Button>
                    <Button size="sm" variant={l.portFast ? 'primary' : 'ghost'} onClick={() => togglePortFast(l.id)}>
                      PortFast
                    </Button>
                    <Button size="sm" variant={l.bpduGuard ? 'primary' : 'ghost'} onClick={() => toggleBpduGuard(l.id)}>
                      BPDU Guard
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="mt-3">
              <Button onClick={() => setBpdu((b) => !b)} variant="secondary">
                {bpdu ? 'Hide BPDUs' : 'Show BPDUs'}
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold">Challenge: Identify the Blocking Port</h3>
            <div className="flex flex-wrap gap-2">
              <select value={guess} onChange={(e) => setGuess(e.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900">
                <option value="">Select a port</option>
                {links.map((l) => {
                  const a = switches.find((s) => s.id === l.from);
                  const b = switches.find((s) => s.id === l.to);
                  return (
                    <option key={l.id} value={`${a?.name} ${a?.id}-${b?.id}`}>
                      {a?.name} to {b?.name}
                    </option>
                  );
                })}
              </select>
              <Button onClick={checkGuess}>Check</Button>
            </div>
            {feedback && <p className="mt-2 text-sm text-cisco-600 dark:text-cisco-400">{feedback}</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const map = {
    root: { label: 'Root', color: 'bg-emerald-500' },
    designated: { label: 'Designated', color: 'bg-blue-500' },
    blocking: { label: 'Blocking', color: 'bg-rose-500' },
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold text-white ${map[role].color}`}>
      {map[role].label}
    </span>
  );
}

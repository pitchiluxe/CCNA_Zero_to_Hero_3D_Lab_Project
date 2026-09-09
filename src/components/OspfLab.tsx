import { useMemo, useState } from 'react';
import { getNetworkAddress, isSameSubnet } from '../utils/ip';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface OspfRouter {
  id: string;
  name: string;
  x: number;
  y: number;
  ospf: boolean;
  routerId: string;
  area: number;
  interfaces: { name: string; ip: string; mask: string; cost: number }[];
}

interface Link {
  from: string;
  to: string;
  up: boolean;
  cost: number;
}

interface Pc {
  id: string;
  name: string;
  x: number;
  y: number;
  ip: string;
  mask: string;
  gateway: string;
}

const INITIAL_ROUTERS: OspfRouter[] = [
  {
    id: 'r1', name: 'R1', x: 80, y: 80, ospf: false, routerId: '1.1.1.1', area: 0,
    interfaces: [
      { name: 'g0/0', ip: '192.168.1.1', mask: '/24', cost: 1 },
      { name: 'g0/1', ip: '10.0.12.1', mask: '/30', cost: 1 },
      { name: 'g0/2', ip: '10.0.13.1', mask: '/30', cost: 10 },
    ],
  },
  {
    id: 'r2', name: 'R2', x: 320, y: 80, ospf: false, routerId: '2.2.2.2', area: 0,
    interfaces: [
      { name: 'g0/0', ip: '10.0.12.2', mask: '/30', cost: 1 },
      { name: 'g0/1', ip: '10.0.24.1', mask: '/30', cost: 1 },
    ],
  },
  {
    id: 'r3', name: 'R3', x: 80, y: 240, ospf: false, routerId: '3.3.3.3', area: 0,
    interfaces: [
      { name: 'g0/0', ip: '10.0.13.2', mask: '/30', cost: 10 },
      { name: 'g0/1', ip: '10.0.34.1', mask: '/30', cost: 1 },
    ],
  },
  {
    id: 'r4', name: 'R4', x: 320, y: 240, ospf: false, routerId: '4.4.4.4', area: 0,
    interfaces: [
      { name: 'g0/0', ip: '10.0.24.2', mask: '/30', cost: 1 },
      { name: 'g0/1', ip: '10.0.34.2', mask: '/30', cost: 1 },
      { name: 'g0/2', ip: '192.168.4.1', mask: '/24', cost: 1 },
    ],
  },
];

const INITIAL_LINKS: Link[] = [
  { from: 'r1', to: 'r2', up: true, cost: 1 },
  { from: 'r1', to: 'r3', up: true, cost: 10 },
  { from: 'r2', to: 'r4', up: true, cost: 1 },
  { from: 'r3', to: 'r4', up: true, cost: 1 },
];

const INITIAL_PCS: Pc[] = [
  { id: 'pc1', name: 'PC-1', x: 40, y: 320, ip: '192.168.1.10', mask: '/24', gateway: '192.168.1.1' },
  { id: 'pc4', name: 'PC-4', x: 360, y: 320, ip: '192.168.4.10', mask: '/24', gateway: '192.168.4.1' },
];

interface OspfRoute {
  dest: string;
  mask: string;
  cost: number;
  nextHopRouter: string;
  viaIface: string;
}

export function OspfLab() {
  const [routers, setRouters] = useState<OspfRouter[]>(INITIAL_ROUTERS);
  const [links, setLinks] = useState<Link[]>(INITIAL_LINKS);
  const [selectedRouter, setSelectedRouter] = useState('r1');
  const [source, setSource] = useState('pc1');
  const [target, setTarget] = useState('pc4');
  const [result, setResult] = useState('');

  const toggleOspf = (id: string) => {
    setRouters((prev) => prev.map((r) => (r.id === id ? { ...r, ospf: !r.ospf } : r)));
  };

  const setRouterId = (id: string, value: string) => {
    setRouters((prev) => prev.map((r) => (r.id === id ? { ...r, routerId: value } : r)));
  };

  const setArea = (id: string, value: string) => {
    setRouters((prev) => prev.map((r) => (r.id === id ? { ...r, area: parseInt(value, 10) || 0 } : r)));
  };

  const setInterfaceCost = (rid: string, ifName: string, cost: string) => {
    const c = parseInt(cost, 10);
    setRouters((prev) =>
      prev.map((r) =>
        r.id === rid
          ? { ...r, interfaces: r.interfaces.map((i) => (i.name === ifName ? { ...i, cost: isNaN(c) ? 1 : c } : i)) }
          : r
      )
    );
  };

  const toggleLink = (from: string, to: string) => {
    setLinks((prev) =>
      prev.map((l) => ((l.from === from && l.to === to) || (l.from === to && l.to === from)) ? { ...l, up: !l.up } : l)
    );
  };

  const neighbors = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const r of routers) {
      map[r.id] = [];
      if (!r.ospf) continue;
      for (const l of links) {
        if (!l.up) continue;
        const peerId = l.from === r.id ? l.to : l.from === r.id ? l.from : null;
        if (!peerId) continue;
        const peer = routers.find((p) => p.id === peerId);
        if (peer && peer.ospf && peer.area === r.area) {
          map[r.id].push(`${peer.name} (${peer.routerId}) — FULL`);
        }
      }
    }
    return map;
  }, [routers, links]);

  const ospfRoutes = useMemo(() => {
    const selected = routers.find((r) => r.id === selectedRouter);
    if (!selected || !selected.ospf) return [];
    return computeOspfRoutes(selected, routers, links);
  }, [routers, links, selectedRouter]);

  const ping = () => {
    const src = INITIAL_PCS.find((p) => p.id === source);
    const dst = INITIAL_PCS.find((p) => p.id === target);
    if (!src || !dst) return;

    const path = traceOspf(src, dst, routers, links);
    if (path) {
      setResult(`Reply from ${dst.ip}: time<1ms. OSPF path: ${path.join(' → ')}`);
    } else {
      setResult('Destination unreachable. Enable OSPF on all routers and ensure links are up.');
    }
  };

  const selected = routers.find((r) => r.id === selectedRouter);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">OSPF Link-State Lab</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enable OSPF, set router IDs and costs, and watch the SPF algorithm compute the shortest path.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Topology</h3>
          <svg viewBox="0 0 400 360" className="w-full rounded border border-slate-200 dark:border-net-700">
            {links.map((l) => {
              const a = findNode(l.from, routers, INITIAL_PCS);
              const b = findNode(l.to, routers, INITIAL_PCS);
              const color = l.up ? '#3b82f6' : '#64748b';
              return (
                <g key={`${l.from}-${l.to}`} onClick={() => toggleLink(l.from, l.to)} className="cursor-pointer">
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={l.up ? 3 : 1} strokeDasharray={l.up ? undefined : '4 4'} />
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 5} textAnchor="middle" className="fill-slate-500 text-[9px]">{l.cost}</text>
                </g>
              );
            })}
            {routers.map((r) => (
              <g key={r.id} onClick={() => setSelectedRouter(r.id)} className="cursor-pointer">
                <circle cx={r.x} cy={r.y} r="24" fill={r.ospf ? '#10b981' : '#64748b'} />
                <text x={r.x} y={r.y + 4} textAnchor="middle" className="fill-white text-[10px] font-bold">{r.name}</text>
                {selectedRouter === r.id && <circle cx={r.x} cy={r.y} r="28" fill="none" stroke="#facc15" strokeWidth="2" />}
              </g>
            ))}
            {INITIAL_PCS.map((p) => (
              <g key={p.id}>
                <rect x={p.x - 20} y={p.y - 15} width="40" height="30" rx="4" fill="#94a3b8" />
                <text x={p.x} y={p.y + 4} textAnchor="middle" className="fill-white text-[9px] font-bold">{p.name}</text>
              </g>
            ))}
          </svg>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Click a link to toggle up/down. Click a router to inspect its OSPF state.</p>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold">OSPF Configuration</h3>
            <div className="space-y-3">
              {routers.map((r) => (
                <div key={r.id} className="rounded border border-slate-200 p-2 text-sm dark:border-net-700">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{r.name}</span>
                    <Button size="sm" variant={r.ospf ? 'primary' : 'ghost'} onClick={() => toggleOspf(r.id)}>
                      {r.ospf ? 'OSPF on' : 'OSPF off'}
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input
                      value={r.routerId}
                      onChange={(e) => setRouterId(r.id, e.target.value)}
                      placeholder="Router ID"
                      className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900"
                    />
                    <input
                      value={r.area}
                      onChange={(e) => setArea(r.id, e.target.value)}
                      placeholder="Area"
                      className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900"
                    />
                  </div>
                  <div className="mt-2 grid gap-1 sm:grid-cols-3">
                    {r.interfaces.map((i) => (
                      <div key={i.name} className="flex items-center gap-1 text-xs">
                        <span className="font-mono">{i.name}</span>
                        <input
                          type="number"
                          value={i.cost}
                          onChange={(e) => setInterfaceCost(r.id, i.name, e.target.value)}
                          className="w-14 rounded border border-slate-200 bg-white px-1 dark:border-net-700 dark:bg-net-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold">Neighbors — {selected?.name}</h3>
            <ul className="text-sm">
              {selected && (neighbors[selected.id] || []).length > 0 ? (
                neighbors[selected.id].map((n, i) => <li key={i} className="text-emerald-600 dark:text-emerald-400">{n}</li>)
              ) : (
                <li className="text-slate-500">No OSPF neighbors. Enable OSPF and ensure links are up in the same area.</li>
              )}
            </ul>
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold">OSPF Routes — {selected?.name}</h3>
            <div className="max-h-40 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 dark:text-slate-400">
                  <tr>
                    <th>Destination</th>
                    <th>Mask</th>
                    <th>Next Hop</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-net-700">
                  {ospfRoutes.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-mono">{r.dest}</td>
                      <td className="py-1 font-mono">{r.mask}</td>
                      <td className="py-1">{r.nextHopRouter}</td>
                      <td className="py-1">{r.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold">Ping Test</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900">
                {INITIAL_PCS.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.ip})</option>)}
              </select>
              <span className="self-center text-slate-500">→</span>
              <select value={target} onChange={(e) => setTarget(e.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900">
                {INITIAL_PCS.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.ip})</option>)}
              </select>
              <Button onClick={ping}>Ping</Button>
            </div>
            {result && <p className="text-sm text-cisco-600 dark:text-cisco-400">{result}</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function findNode(id: string, routers: OspfRouter[], pcs: Pc[]) {
  return [...routers, ...pcs].find((n: any) => n.id === id)!;
}

function computeOspfRoutes(source: OspfRouter, routers: OspfRouter[], links: Link[]): OspfRoute[] {
  // Dijkstra on routers, edge weight = interface cost on source side of the link
  const dist: Record<string, { cost: number; nextHop: string; viaIface: string }> = {};
  const visited = new Set<string>();
  const queue = new Set<string>(routers.map((r) => r.id));

  for (const r of routers) dist[r.id] = { cost: Infinity, nextHop: '', viaIface: '' };
  dist[source.id] = { cost: 0, nextHop: source.id, viaIface: '' };

  while (queue.size) {
    const current = [...queue].reduce((a, b) => (dist[a].cost < dist[b].cost ? a : b));
    queue.delete(current);
    if (dist[current].cost === Infinity) break;

    for (const l of links) {
      if (!l.up) continue;
      const peer = l.from === current ? l.to : l.from === current ? l.from : null;
      if (!peer) continue;
      const r = routers.find((x) => x.id === current)!;
      const iface = r.interfaces.find((i) => {
        const peerIp = routers.find((p) => p.id === peer)?.interfaces.find((pi) => isSameSubnet(pi.ip, i.ip, i.mask));
        return peerIp !== undefined;
      });
      const cost = (iface?.cost ?? 1) + l.cost;
      if (dist[current].cost + cost < dist[peer].cost) {
        dist[peer] = {
          cost: dist[current].cost + cost,
          nextHop: current === source.id ? peer : dist[current].nextHop,
          viaIface: iface?.name ?? '',
        };
      }
    }
  }

  const routes: OspfRoute[] = [];
  for (const r of routers) {
    if (r.id === source.id) continue;
    if (dist[r.id].cost === Infinity) continue;
    for (const i of r.interfaces) {
      const net = getNetworkAddress(i.ip, i.mask);
      if (!net) continue;
      const nextRouter = dist[r.id].nextHop === source.id ? r.id : dist[r.id].nextHop;
      const nextName = routers.find((x) => x.id === nextRouter)?.name ?? nextRouter;
      routes.push({
        dest: net,
        mask: i.mask,
        cost: dist[r.id].cost + i.cost,
        nextHopRouter: nextName,
        viaIface: dist[r.id].viaIface,
      });
    }
  }

  return routes;
}

function traceOspf(src: Pc, dst: Pc, routers: OspfRouter[], links: Link[]): string[] | null {
  const path: string[] = [src.name];

  // Directly connected? Not in this topology.
  const srcRouter = routers.find((r) => r.interfaces.some((i) => i.ip === src.gateway));
  if (!srcRouter) return null;
  let current = srcRouter;
  path.push(current.name);

  for (let i = 0; i < 10; i++) {
    const route = findBestOspfRoute(current, dst.ip, routers, links);
    if (!route) return null;
    if (route.isConnected) {
      path.push(dst.name);
      return path;
    }
    const next = routers.find((r) => r.id === route.nextHopId);
    if (!next) return null;
    current = next;
    path.push(current.name);
  }
  return null;
}

function findBestOspfRoute(router: OspfRouter, targetIp: string, allRouters: OspfRouter[], links: Link[]) {
  if (!router.ospf) return null;
  const routes = computeOspfRoutes(router, allRouters, links);
  const connected = router.interfaces.find((i) => {
    const net = getNetworkAddress(targetIp, i.mask);
    const myNet = getNetworkAddress(i.ip, i.mask);
    return net && myNet && net === myNet;
  });
  if (connected) return { isConnected: true as const };
  const match = routes.find((r) => getNetworkAddress(targetIp, r.mask) === r.dest);
  if (match) {
    const nextId = allRouters.find((r) => r.name === match.nextHopRouter)?.id ?? match.nextHopRouter;
    return { isConnected: false as const, nextHopId: nextId };
  }
  return null;
}

import { useMemo, useState } from 'react';
import { isSameSubnet, getNetworkAddress, maskToPrefix } from '../utils/ip';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface RouteEntry {
  dest: string;
  mask: string;
  nextHop: string;
  metric: number;
  connected: boolean;
}

interface RouterNode {
  id: string;
  name: string;
  x: number;
  y: number;
  interfaces: { name: string; ip: string; mask: string }[];
  routes: RouteEntry[];
}

interface PcNode {
  id: string;
  name: string;
  x: number;
  y: number;
  ip: string;
  mask: string;
  gateway: string;
}

const INITIAL_ROUTERS: RouterNode[] = [
  {
    id: 'r1',
    name: 'R1',
    x: 80,
    y: 160,
    interfaces: [
      { name: 'g0/0', ip: '192.168.1.1', mask: '/24' },
      { name: 'g0/1', ip: '10.0.12.1', mask: '/30' },
    ],
    routes: [],
  },
  {
    id: 'r2',
    name: 'R2',
    x: 200,
    y: 80,
    interfaces: [
      { name: 'g0/0', ip: '10.0.12.2', mask: '/30' },
      { name: 'g0/1', ip: '10.0.23.1', mask: '/30' },
      { name: 'g0/2', ip: '192.168.2.1', mask: '/24' },
    ],
    routes: [],
  },
  {
    id: 'r3',
    name: 'R3',
    x: 320,
    y: 160,
    interfaces: [
      { name: 'g0/0', ip: '10.0.23.2', mask: '/30' },
      { name: 'g0/1', ip: '192.168.3.1', mask: '/24' },
    ],
    routes: [],
  },
];

const INITIAL_PCS: PcNode[] = [
  { id: 'pc1', name: 'PC-1', x: 80, y: 260, ip: '192.168.1.10', mask: '/24', gateway: '192.168.1.1' },
  { id: 'pc3', name: 'PC-3', x: 320, y: 260, ip: '192.168.3.10', mask: '/24', gateway: '192.168.3.1' },
];

const LINKS: { from: string; to: string; up: boolean }[] = [
  { from: 'r1', to: 'pc1', up: true },
  { from: 'r1', to: 'r2', up: true },
  { from: 'r2', to: 'r3', up: true },
  { from: 'r3', to: 'pc3', up: true },
];

export function RoutingLab() {
  const [routers, setRouters] = useState<RouterNode[]>(INITIAL_ROUTERS);
  const [links, setLinks] = useState(LINKS);
  const [selectedRouter, setSelectedRouter] = useState('r1');
  const [source, setSource] = useState('pc1');
  const [target, setTarget] = useState('pc3');
  const [result, setResult] = useState('');

  const allRoutes = useMemo(() => {
    return routers.map((r) => ({
      ...r,
      routes: [
        ...r.interfaces.map((i) => {
          const net = getNetworkAddress(i.ip, i.mask);
          return { dest: net ?? i.ip, mask: i.mask, nextHop: '0.0.0.0', metric: 0, connected: true };
        }),
        ...r.routes,
      ],
    }));
  }, [routers]);

  const trace = (fromId: string, toId: string): string[] | null => {
    const srcPc = INITIAL_PCS.find((p) => p.id === fromId);
    const dstPc = INITIAL_PCS.find((p) => p.id === toId);
    if (!srcPc || !dstPc) return null;

    const path: string[] = [srcPc.name];

    if (isSameSubnet(srcPc.ip, dstPc.ip, srcPc.mask)) {
      return [...path, dstPc.name];
    }

    let current = findRouterByIp(srcPc.gateway, routers);
    if (!current) return null;
    path.push(current.name);

    let hops = 0;
    while (hops < 10) {
      if (isConnectedTo(current, dstPc.ip)) {
        path.push(dstPc.name);
        return path;
      }

      const route = findBestRoute(current, dstPc.ip);
      if (!route) return null;
      if (route.nextHop === '0.0.0.0') return null;

      const next = findRouterByIp(route.nextHop, routers);
      if (!next) return null;
      if (!areAdjacent(current, next, links)) return null;
      if (!nextHopReachable(current, route.nextHop)) return null;

      current = next;
      path.push(current.name);
      hops++;
    }
    return null;
  };

  const ping = () => {
    const path = trace(source, target);
    if (path) setResult(`Reply from ${INITIAL_PCS.find((p) => p.id === target)?.ip}: time<1ms. Path: ${path.join(' → ')}`);
    else setResult('Destination unreachable. Check default gateways and static routes.');
  };

  const selected = allRoutes.find((r) => r.id === selectedRouter);

  const addRoute = (dest: string, mask: string, nextHop: string, metric: string) => {
    const m = parseInt(metric, 10);
    setRouters((prev) =>
      prev.map((r) =>
        r.id === selectedRouter
          ? { ...r, routes: [...r.routes, { dest, mask, nextHop, metric: isNaN(m) ? 1 : m, connected: false }] }
          : r
      )
    );
  };

  const removeRoute = (idx: number) => {
    setRouters((prev) =>
      prev.map((r) =>
        r.id === selectedRouter ? { ...r, routes: r.routes.filter((_, i) => i !== idx) } : r
      )
    );
  };

  const toggleLink = (from: string, to: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.from === from && l.to === to ? { ...l, up: !l.up } : l))
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">Routing Fundamentals</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure static routes and longest prefix match across a multi-router path.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Topology</h3>
          <svg viewBox="0 0 400 320" className="w-full rounded border border-slate-200 dark:border-net-700">
            {links.map((l) => {
              const a = findNode(l.from, routers, INITIAL_PCS);
              const b = findNode(l.to, routers, INITIAL_PCS);
              const color = l.up ? '#3b82f6' : '#64748b';
              return (
                <g key={`${l.from}-${l.to}`}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={l.up ? 3 : 1} strokeDasharray={l.up ? undefined : '4 4'} />
                  <circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r="8" fill="transparent" className="cursor-pointer" onClick={() => toggleLink(l.from, l.to)} />
                </g>
              );
            })}
            {routers.map((r) => (
              <g key={r.id} onClick={() => setSelectedRouter(r.id)} className="cursor-pointer">
                <circle cx={r.x} cy={r.y} r="24" fill={selectedRouter === r.id ? '#049fd9' : '#334155'} />
                <text x={r.x} y={r.y + 4} textAnchor="middle" className="fill-white text-[10px] font-bold">{r.name}</text>
              </g>
            ))}
            {INITIAL_PCS.map((p) => (
              <g key={p.id}>
                <rect x={p.x - 20} y={p.y - 15} width="40" height="30" rx="4" fill="#94a3b8" />
                <text x={p.x} y={p.y + 4} textAnchor="middle" className="fill-white text-[9px] font-bold">{p.name}</text>
              </g>
            ))}
          </svg>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold">Routing Table — {selected?.name}</h3>
            <div className="mb-2 max-h-48 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 dark:text-slate-400">
                  <tr>
                    <th>Destination</th>
                    <th>Mask</th>
                    <th>Next Hop</th>
                    <th>Metric</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-net-700">
                  {selected?.routes.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 font-mono">{r.dest}</td>
                      <td className="py-1 font-mono">{r.mask}</td>
                      <td className="py-1 font-mono">{r.nextHop}</td>
                      <td className="py-1">{r.metric}</td>
                      <td className="py-1">
                        {r.connected ? (
                          <Badge status="up">Connected</Badge>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span>Static</span>
                            <button onClick={() => removeRoute(i)} className="text-rose-600 hover:underline">Remove</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AddRouteForm onAdd={addRoute} />
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

          <Card>
            <h3 className="mb-2 font-semibold">Objectives</h3>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> View connected routes on each router.</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Add static routes to reach remote networks.</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Ping PC-3 from PC-1 end-to-end.</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Observe longest prefix match with a default route.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddRouteForm({ onAdd }: { onAdd: (dest: string, mask: string, nextHop: string, metric: string) => void }) {
  const [dest, setDest] = useState('');
  const [mask, setMask] = useState('');
  const [nextHop, setNextHop] = useState('');
  const [metric, setMetric] = useState('1');

  return (
    <div className="grid gap-2 sm:grid-cols-5">
      <input value={dest} onChange={(e) => setDest(e.target.value)} placeholder="Dest" className="rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900" />
      <input value={mask} onChange={(e) => setMask(e.target.value)} placeholder="Mask" className="rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900" />
      <input value={nextHop} onChange={(e) => setNextHop(e.target.value)} placeholder="Next hop" className="rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900" />
      <input value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="Metric" className="rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900" />
      <Button onClick={() => { onAdd(dest, mask, nextHop, metric); }}>Add</Button>
    </div>
  );
}

function findNode(id: string, routers: RouterNode[], pcs: PcNode[]) {
  return [...routers, ...pcs].find((n: any) => n.id === id)!;
}

function findRouterByIp(ip: string, routers: RouterNode[]) {
  return routers.find((r) => r.interfaces.some((i) => i.ip === ip));
}

function isConnectedTo(router: RouterNode, ip: string) {
  return router.interfaces.some((i) => {
    const net = getNetworkAddress(ip, i.mask);
    const myNet = getNetworkAddress(i.ip, i.mask);
    return net && myNet && net === myNet;
  });
}

function findBestRoute(router: RouterNode, targetIp: string) {
  const routes = [
    ...router.interfaces.map((i) => ({
      dest: getNetworkAddress(i.ip, i.mask) ?? i.ip,
      mask: i.mask,
      nextHop: '0.0.0.0',
      metric: 0,
      connected: true,
    })),
    ...router.routes,
  ];

  const matching = routes
    .map((r) => ({ r, prefix: maskToPrefix(r.mask), inNet: getNetworkAddress(targetIp, r.mask) === r.dest }))
    .filter((x) => x.inNet);

  if (matching.length === 0) return null;
  matching.sort((a, b) => (b.prefix ?? 0) - (a.prefix ?? 0) || a.r.metric - b.r.metric);
  return matching[0].r;
}

function areAdjacent(a: RouterNode, b: RouterNode, links: { from: string; to: string; up: boolean }[]) {
  return links.some((l) => {
    const up = l.up;
    const match = (l.from === a.id && l.to === b.id) || (l.from === b.id && l.to === a.id);
    return match && up;
  });
}

function nextHopReachable(router: RouterNode, nextHop: string) {
  return router.interfaces.some((i) => isSameSubnet(i.ip, nextHop, i.mask));
}

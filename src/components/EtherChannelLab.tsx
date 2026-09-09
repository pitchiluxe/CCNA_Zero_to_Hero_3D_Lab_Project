import { useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface Link {
  id: string;
  name: string;
  up: boolean;
  bundled: boolean;
}

export function EtherChannelLab() {
  const [links, setLinks] = useState<Link[]>([
    { id: 'g0/1', name: 'Gig0/1', up: true, bundled: false },
    { id: 'g0/2', name: 'Gig0/2', up: true, bundled: false },
    { id: 'g0/3', name: 'Gig0/3', up: true, bundled: false },
  ]);
  const [bundleMode, setBundleMode] = useState<'lacp' | 'pagp' | 'static' | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pingResult, setPingResult] = useState('');
  const [traffic, setTraffic] = useState(false);

  const bundleCreated = bundleMode !== null;
  const activeBundled = links.filter((l) => l.bundled && l.up).length;
  const activePhysical = links.filter((l) => l.up).length;
  const throughput = bundleCreated ? activeBundled : activePhysical ? 1 : 0;

  const toggleLink = (id: string) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, up: !l.up } : l)));
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createBundle = (mode: 'lacp' | 'pagp' | 'static') => {
    if (selected.size < 2) {
      setPingResult('Select at least two links to form a bundle.');
      return;
    }
    setLinks((prev) => prev.map((l) => ({ ...l, bundled: selected.has(l.id) })));
    setBundleMode(mode);
    setPingResult(`Port-Channel 1 created with ${mode.toUpperCase()}.`);
  };

  const deleteBundle = () => {
    setLinks((prev) => prev.map((l) => ({ ...l, bundled: false })));
    setBundleMode(null);
    setPingResult('Port-Channel removed.');
  };

  const failMember = () => {
    const candidates = links.filter((l) => l.bundled && l.up);
    if (candidates.length === 0) {
      setPingResult('No active bundle members to fail.');
      return;
    }
    const victim = candidates[Math.floor(Math.random() * candidates.length)];
    setLinks((prev) => prev.map((l) => (l.id === victim.id ? { ...l, up: false } : l)));
    setPingResult(`${victim.name} was brought down. Port-Channel still active with ${candidates.length - 1} member(s).`);
  };

  const ping = () => {
    if (bundleCreated) {
      if (activeBundled > 0) {
        setPingResult(`Reply from PC-2: time<1ms using Port-Channel 1 — aggregate throughput ${throughput} Gbps.`);
      } else {
        setPingResult('Request timed out. All Port-Channel member links are down.');
      }
    } else {
      if (activePhysical > 0) {
        setPingResult(`Reply from PC-2: time<1ms over one physical link — 1 Gbps. Create a bundle to use multiple links.`);
      } else {
        setPingResult('Request timed out. No active link between the switches.');
      }
    }
  };

  const linkPositions = useMemo(() => {
    return [
      { x1: 80, y1: 80, x2: 320, y2: 80 },
      { x1: 80, y1: 160, x2: 320, y2: 160 },
      { x1: 80, y1: 240, x2: 320, y2: 240 },
    ];
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">EtherChannel Lab</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bundle multiple physical links into a Port-Channel for load sharing and redundancy. Observe how aggregate bandwidth and resilience change as links fail.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Topology</h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {bundleCreated ? `Port-Channel 1 (${bundleMode?.toUpperCase()})` : 'No bundle'}
            </div>
          </div>
          <svg viewBox="0 0 400 320" className="w-full rounded border border-slate-200 dark:border-net-700">
            <rect x="40" y="40" width="80" height="240" rx="8" fill="#22c55e" />
            <text x="80" y="270" textAnchor="middle" className="fill-white text-[12px] font-bold">SW1</text>
            <rect x="280" y="40" width="80" height="240" rx="8" fill="#22c55e" />
            <text x="320" y="270" textAnchor="middle" className="fill-white text-[12px] font-bold">SW2</text>

            {links.map((l, i) => {
              const pos = linkPositions[i];
              const color = l.up ? (l.bundled ? '#facc15' : '#3b82f6') : '#64748b';
              const width = l.bundled && bundleCreated ? 6 : 3;
              return (
                <g key={l.id}>
                  <line x1={pos.x1} y1={pos.y1} x2={pos.x2} y2={pos.y2} stroke={color} strokeWidth={width} />
                  {traffic && l.bundled && l.up && (
                    <circle r="5" fill="#facc15">
                      <animate attributeName="cx" values={`${pos.x1};${pos.x2}`} dur={`${1.2 - i * 0.1}s`} repeatCount="indefinite" />
                      <animate attributeName="cy" values={`${pos.y1};${pos.y2}`} dur={`${1.2 - i * 0.1}s`} repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded border border-slate-200 p-2 dark:border-net-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">Active links</p>
              <p className="text-lg font-bold">{bundleCreated ? activeBundled : activePhysical}</p>
            </div>
            <div className="rounded border border-slate-200 p-2 dark:border-net-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">Aggregate</p>
              <p className="text-lg font-bold">{throughput} Gbps</p>
            </div>
            <div className="rounded border border-slate-200 p-2 dark:border-net-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">Mode</p>
              <p className="text-lg font-bold">{bundleMode?.toUpperCase() ?? '—'}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold">Physical Links</h3>
            <div className="space-y-2">
              {links.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded border border-slate-200 p-2 text-sm dark:border-net-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.has(l.id)}
                      onChange={() => toggleSelect(l.id)}
                      disabled={bundleCreated}
                      className="h-4 w-4"
                    />
                    <span className="font-mono">{l.name}</span>
                    {l.bundled && <Badge status="up">Bundled</Badge>}
                  </div>
                  <Button size="sm" variant={l.up ? 'primary' : 'secondary'} onClick={() => toggleLink(l.id)}>
                    {l.up ? 'Up' : 'Down'}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => createBundle('lacp')} disabled={bundleCreated}>LACP active</Button>
              <Button onClick={() => createBundle('pagp')} disabled={bundleCreated} variant="secondary">PAgP</Button>
              <Button onClick={() => createBundle('static')} disabled={bundleCreated} variant="secondary">Static on</Button>
              {bundleCreated && (
                <Button onClick={deleteBundle} variant="ghost">Remove bundle</Button>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold">Test & Troubleshoot</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              <Button onClick={ping}>Ping across switches</Button>
              <Button onClick={() => setTraffic((t) => !t)} variant="secondary">
                {traffic ? 'Hide traffic' : 'Show traffic'}
              </Button>
              <Button onClick={failMember} variant="secondary" disabled={!bundleCreated}>
                Fail one member
              </Button>
            </div>
            {pingResult && <p className="text-sm text-cisco-600 dark:text-cisco-400">{pingResult}</p>}
          </Card>

          <Card>
            <h3 className="mb-2 font-semibold">Objectives</h3>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${bundleCreated ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} /> Create a Port-Channel from at least two links.</li>
              <li className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${throughput > 1 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} /> Observe aggregate bandwidth above 1 Gbps.</li>
              <li className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${bundleCreated && activeBundled < links.filter((l) => l.bundled).length ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} /> Fail a member and verify redundancy.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

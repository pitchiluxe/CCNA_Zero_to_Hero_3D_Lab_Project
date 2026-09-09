import { useMemo, useState } from 'react';
import { LabRuntime } from '../hooks/useLabRuntime';
import { Device, Cable } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface Props {
  runtime: LabRuntime;
}

export function VlanControls({ runtime }: Props) {
  const switches = useMemo(() => runtime.devices.filter((d) => d.type === 'switch'), [runtime.devices]);
  const pcs = useMemo(() => runtime.devices.filter((d) => d.type === 'pc'), [runtime.devices]);

  const [source, setSource] = useState(pcs[0]?.id ?? '');
  const [target, setTarget] = useState(pcs[1]?.id ?? '');
  const [result, setResult] = useState('');

  const getConnectedSwitchPort = (pcId: string) => {
    const cable = runtime.cables.find((c) => c.from === pcId || c.to === pcId);
    if (!cable) return null;
    const switchId = cable.from === pcId ? cable.to : cable.from;
    const switchIfaceId = cable.from === pcId ? cable.toInterface : cable.fromInterface;
    const sw = runtime.devices.find((d) => d.id === switchId);
    const iface = sw?.interfaces.find((i) => i.id === switchIfaceId);
    return { switch: sw, iface };
  };

  const vlanFor = (pcId: string) => {
    const info = getConnectedSwitchPort(pcId);
    if (!info?.iface) return 1;
    if (info.iface.mode === 'trunk') return 1; // PC on a trunk port does not belong to a normal access VLAN
    return info.iface.vlan ?? 1;
  };

  const ping = () => {
    if (!source || !target) return;
    const srcV = vlanFor(source);
    const dstV = vlanFor(target);
    if (srcV !== dstV) {
      setResult(`PCs are in different VLANs (${srcV} vs ${dstV}). No Layer 2 connectivity without a router.`);
      return;
    }
    const path = findVlanPath(source, target, srcV, runtime.devices, runtime.cables);
    if (path) setResult(`Reply from ${target}: time<1ms VLAN=${srcV}. Same-VLAN traffic reaches the destination.`);
    else setResult(`No VLAN ${srcV} path between the two PCs. Check access VLANs and trunk allowed lists.`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-3 font-semibold">Switch Port VLAN Configuration</h3>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Set each switch port to <strong>access</strong> with a VLAN, or <strong>trunk</strong> with an allowed list. Trunks carry multiple VLANs between switches.
        </p>

        <div className="space-y-4">
          {switches.map((sw) => (
            <div key={sw.id} className="rounded-lg border border-slate-200 p-3 dark:border-net-700">
              <p className="mb-2 font-medium">{sw.name}</p>
              <div className="space-y-2">
                {sw.interfaces.map((iface) => (
                  <PortRow key={iface.id} deviceId={sw.id} iface={iface} runtime={runtime} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">VLAN Reachability Test</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900">
            {pcs.map((d) => <option key={d.id} value={d.id}>{d.name} (VLAN {vlanFor(d.id)})</option>)}
          </select>
          <span className="self-center text-slate-500">→</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900">
            {pcs.map((d) => <option key={d.id} value={d.id}>{d.name} (VLAN {vlanFor(d.id)})</option>)}
          </select>
          <Button onClick={ping}>Ping</Button>
        </div>
        {result && <p className="text-sm text-cisco-600 dark:text-cisco-400">{result}</p>}
      </Card>
    </div>
  );
}

function PortRow({ deviceId, iface, runtime }: { deviceId: string; iface: Device['interfaces'][0]; runtime: LabRuntime }) {
  const isTrunk = iface.mode === 'trunk';
  const [allowed, setAllowed] = useState((iface.trunkAllowed ?? []).join(','));

  const handleModeChange = (mode: 'access' | 'trunk') => {
    runtime.setMode(deviceId, iface.id, mode);
  };

  const handleVlanChange = (v: string) => {
    const n = parseInt(v, 10);
    if (!isNaN(n)) runtime.setVlan(deviceId, iface.id, n);
  };

  const updateAllowed = () => {
    const list = allowed.split(/[,\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    runtime.setTrunkAllowed(deviceId, iface.id, list);
  };

  return (
    <div className="grid items-center gap-2 text-sm sm:grid-cols-[1fr,auto,auto]">
      <span className="font-mono">{iface.name}</span>
      <div className="flex items-center gap-2">
        <select
          value={iface.mode ?? 'access'}
          onChange={(e) => handleModeChange(e.target.value as 'access' | 'trunk')}
          className="rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900"
        >
          <option value="access">Access</option>
          <option value="trunk">Trunk</option>
        </select>
        {!isTrunk ? (
          <input
            type="number"
            min={1}
            max={4094}
            value={iface.vlan ?? 1}
            onChange={(e) => handleVlanChange(e.target.value)}
            className="w-20 rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900"
          />
        ) : (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={allowed}
              onChange={(e) => setAllowed(e.target.value)}
              onBlur={updateAllowed}
              placeholder="10,20"
              className="w-24 rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900"
            />
            <Badge status="up">Allowed</Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function findVlanPath(sourceId: string, targetId: string, vlan: number, devices: Device[], cables: Cable[]): boolean {
  const queue: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);

  while (queue.length) {
    const current = queue.shift()!;
    if (current === targetId) return true;

    for (const cable of cables) {
      if (cable.status !== 'up') continue;
      const next = cable.from === current ? cable.to : cable.from === current ? cable.from : null;
      if (!next || visited.has(next)) continue;

      if (!canTraverse(cable, vlan, devices, current, next)) continue;

      visited.add(next);
      queue.push(next);
    }
  }
  return false;
}

function canTraverse(cable: Cable, vlan: number, devices: Device[], from: string, to: string): boolean {
  const fromDev = devices.find((d) => d.id === from);
  const toDev = devices.find((d) => d.id === to);
  if (!fromDev || !toDev) return false;

  // PC -- switch: the switch port must allow the VLAN
  if (fromDev.type === 'pc' || toDev.type === 'pc') {
    const switchId = fromDev.type === 'switch' ? fromDev.id : toDev.id;
    const ifaceId = fromDev.type === 'switch' ? cable.fromInterface : cable.toInterface;
    const sw = devices.find((d) => d.id === switchId);
    const iface = sw?.interfaces.find((i) => i.id === ifaceId);
    if (!iface || iface.status === 'down') return false;
    if (iface.mode === 'trunk') return (iface.trunkAllowed ?? []).includes(vlan);
    return (iface.vlan ?? 1) === vlan;
  }

  // switch -- switch: the link must be a trunk and both ends must allow the VLAN
  if (fromDev.type === 'switch' && toDev.type === 'switch') {
    const a = devices.find((d) => d.id === cable.from)?.interfaces.find((i) => i.id === cable.fromInterface);
    const b = devices.find((d) => d.id === cable.to)?.interfaces.find((i) => i.id === cable.toInterface);
    if (!a || !b || a.status === 'down' || b.status === 'down') return false;
    if (a.mode !== 'trunk' || b.mode !== 'trunk') return false;
    return (a.trunkAllowed ?? []).includes(vlan) && (b.trunkAllowed ?? []).includes(vlan);
  }

  return false;
}

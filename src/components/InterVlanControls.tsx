import { useMemo, useState } from 'react';
import { LabRuntime } from '../hooks/useLabRuntime';
import { Device, Cable } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface Props {
  runtime: LabRuntime;
}

export function InterVlanControls({ runtime }: Props) {
  const router = useMemo(() => runtime.devices.find((d) => d.type === 'router' || d.type === 'switch'), [runtime.devices]);
  const switch1 = useMemo(() => runtime.devices.find((d) => d.type === 'switch'), [runtime.devices]);
  const pcs = useMemo(() => runtime.devices.filter((d) => d.type === 'pc'), [runtime.devices]);

  const [source, setSource] = useState(pcs[0]?.id ?? '');
  const [target, setTarget] = useState(pcs[1]?.id ?? '');
  const [result, setResult] = useState('');

  const vlanFor = (pcId: string) => {
    const info = getConnectedSwitchPort(pcId, runtime.devices, runtime.cables);
    if (!info?.iface) return 1;
    return info.iface.mode === 'trunk' ? 1 : info.iface.vlan ?? 1;
  };

  const routerIpsForVlan = (vlan: number) => {
    if (!router) return undefined;
    return router.interfaces.find((i) => i.vlan === vlan);
  };

  const ping = () => {
    if (!source || !target || !switch1 || !router) return;
    const srcV = vlanFor(source);
    const dstV = vlanFor(target);
    const outcome = checkReachability(source, target, srcV, dstV, runtime.devices, runtime.cables);
    setResult(outcome);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-3 font-semibold">Router-on-a-Stick Configuration</h3>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          A router (or Layer 3 switch) uses subinterfaces/SVIs in each VLAN. The link to the switch is a trunk. Each PC must use the router subinterface in its VLAN as the default gateway.
        </p>

        {router && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium">{router.name} subinterfaces/SVIs</p>
            <div className="space-y-2">
              {router.interfaces.map((iface) => (
                <div key={iface.id} className="grid gap-2 text-sm sm:grid-cols-3">
                  <span className="font-mono">{iface.name}</span>
                  <input
                    type="number"
                    min={1}
                    max={4094}
                    value={iface.vlan ?? ''}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (!isNaN(n)) runtime.setVlan(router.id, iface.id, n);
                    }}
                    placeholder="VLAN"
                    className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900"
                  />
                  <div className="flex gap-1">
                    <input
                      value={iface.ip ?? ''}
                      onBlur={(e) => runtime.setIp(router.id, iface.id, e.target.value)}
                      placeholder="IP"
                      className="w-1/2 rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900"
                    />
                    <input
                      value={iface.mask ?? ''}
                      onBlur={(e) => runtime.setMask(router.id, iface.id, e.target.value)}
                      placeholder="Mask"
                      className="w-1/2 rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {switch1 && (
          <div>
            <p className="mb-2 text-sm font-medium">{switch1.name} ports</p>
            <div className="space-y-2">
              {switch1.interfaces.map((iface) => (
                <div key={iface.id} className="grid items-center gap-2 text-sm sm:grid-cols-[1fr,auto,auto]">
                  <span className="font-mono">{iface.name}</span>
                  <select
                    value={iface.mode ?? 'access'}
                    onChange={(e) => runtime.setMode(switch1.id, iface.id, e.target.value as 'access' | 'trunk')}
                    className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900"
                  >
                    <option value="access">Access</option>
                    <option value="trunk">Trunk</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={4094}
                    value={iface.mode === 'trunk' ? '' : (iface.vlan ?? 1)}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (!isNaN(n)) runtime.setVlan(switch1.id, iface.id, n);
                    }}
                    disabled={iface.mode === 'trunk'}
                    className="w-20 rounded border border-slate-200 bg-white px-2 py-1 disabled:opacity-50 dark:border-net-700 dark:bg-net-900"
                  />
                  {iface.mode === 'trunk' && (
                    <TrunkAllowed deviceId={switch1.id} iface={iface} runtime={runtime} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">PC Gateways</h3>
        <div className="space-y-2">
          {pcs.map((pc) => (
            <div key={pc.id} className="grid items-center gap-2 text-sm sm:grid-cols-[1fr,auto]">
              <span>{pc.name} — VLAN {vlanFor(pc.id)}</span>
              <input
                value={pc.interfaces[0]?.gateway ?? ''}
                onBlur={(e) => runtime.setGateway(pc.id, pc.interfaces[0].id, e.target.value)}
                placeholder="Default gateway"
                className="w-40 rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Inter-VLAN Ping</h3>
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

function TrunkAllowed({ deviceId, iface, runtime }: { deviceId: string; iface: Device['interfaces'][0]; runtime: LabRuntime }) {
  const [value, setValue] = useState((iface.trunkAllowed ?? []).join(','));
  return (
    <div className="ml-2 flex items-center gap-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          const list = value.split(/[,\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
          runtime.setTrunkAllowed(deviceId, iface.id, list);
        }}
        placeholder="10,20"
        className="w-24 rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900"
      />
      <Badge status="up">Trunk</Badge>
    </div>
  );
}

function getConnectedSwitchPort(pcId: string, devices: Device[], cables: Cable[]) {
  const cable = cables.find((c) => c.from === pcId || c.to === pcId);
  if (!cable) return null;
  const switchId = cable.from === pcId ? cable.to : cable.from;
  const switchIfaceId = cable.from === pcId ? cable.toInterface : cable.fromInterface;
  const sw = devices.find((d) => d.id === switchId);
  const iface = sw?.interfaces.find((i) => i.id === switchIfaceId);
  return { switch: sw, iface };
}

function checkReachability(sourceId: string, targetId: string, srcV: number, dstV: number, devices: Device[], cables: Cable[]): string {
  const srcPc = devices.find((d) => d.id === sourceId);
  const dstPc = devices.find((d) => d.id === targetId);
  const router = devices.find((d) => d.type === 'router');
  if (!srcPc || !dstPc || !router) return 'Router or PCs not found.';

  const srcNic = srcPc.interfaces[0];
  const dstNic = dstPc.interfaces[0];

  if (srcV === dstV) {
    const path = findVlanPath(sourceId, targetId, srcV, devices, cables);
    if (path) return `Reply from ${dstNic.ip}: same VLAN (${srcV}) traffic is forwarded.`;
    return `Same VLAN (${srcV}) but no valid path. Check access VLANs and trunks.`;
  }

  const srcGw = srcNic.gateway;
  const dstGw = dstNic.gateway;
  const srcSub = router.interfaces.find((i) => i.vlan === srcV && i.status === 'up');
  const dstSub = router.interfaces.find((i) => i.vlan === dstV && i.status === 'up');

  if (!srcGw) return 'Source PC has no default gateway configured.';
  if (!dstGw) return 'Destination PC has no default gateway configured.';
  if (!srcSub) return `No router subinterface/SVI for VLAN ${srcV}.`;
  if (!dstSub) return `No router subinterface/SVI for VLAN ${dstV}.`;
  if (srcGw !== srcSub.ip) return `Source gateway ${srcGw} does not match the router's VLAN ${srcV} IP ${srcSub.ip}.`;
  if (dstGw !== dstSub.ip) return `Destination gateway ${dstGw} does not match the router's VLAN ${dstV} IP ${dstSub.ip}.`;

  const toRouter = getConnectedSwitchPort(sourceId, devices, cables);
  const fromRouter = getConnectedSwitchPort(targetId, devices, cables);
  if (!toRouter?.iface || !fromRouter?.iface) return 'PCs are not connected to a switch.';

  const pathSrc = findVlanPath(sourceId, router.id, srcV, devices, cables);
  const pathDst = findVlanPath(router.id, targetId, dstV, devices, cables);

  if (pathSrc && pathDst) return `Reply from ${dstNic.ip}: inter-VLAN routed from VLAN ${srcV} to VLAN ${dstV}.`;
  if (!pathSrc) return `Cannot reach the router from VLAN ${srcV}. Check the switch-to-router trunk and allowed VLANs.`;
  if (!pathDst) return `Router cannot reach VLAN ${dstV}. Check the switch-to-router trunk and target port VLAN.`;
  return 'No path found.';
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

  if (fromDev.type === 'pc' || toDev.type === 'pc') {
    const switchId = fromDev.type === 'switch' ? fromDev.id : toDev.id;
    const ifaceId = fromDev.type === 'switch' ? cable.fromInterface : cable.toInterface;
    const sw = devices.find((d) => d.id === switchId);
    const iface = sw?.interfaces.find((i) => i.id === ifaceId);
    if (!iface || iface.status === 'down') return false;
    if (iface.mode === 'trunk') return (iface.trunkAllowed ?? []).includes(vlan);
    return (iface.vlan ?? 1) === vlan;
  }

  if (fromDev.type === 'switch' && toDev.type === 'switch') {
    const a = devices.find((d) => d.id === cable.from)?.interfaces.find((i) => i.id === cable.fromInterface);
    const b = devices.find((d) => d.id === cable.to)?.interfaces.find((i) => i.id === cable.toInterface);
    if (!a || !b || a.status === 'down' || b.status === 'down') return false;
    if (a.mode !== 'trunk' || b.mode !== 'trunk') return false;
    return (a.trunkAllowed ?? []).includes(vlan) && (b.trunkAllowed ?? []).includes(vlan);
  }

  if ((fromDev.type === 'router' && toDev.type === 'switch') || (fromDev.type === 'switch' && toDev.type === 'router')) {
    const switchId = fromDev.type === 'switch' ? fromDev.id : toDev.id;
    const ifaceId = fromDev.type === 'switch' ? cable.fromInterface : cable.toInterface;
    const sw = devices.find((d) => d.id === switchId);
    const iface = sw?.interfaces.find((i) => i.id === ifaceId);
    if (!iface || iface.status === 'down') return false;
    if (iface.mode === 'trunk') return (iface.trunkAllowed ?? []).includes(vlan);
    return (iface.vlan ?? 1) === vlan;
  }

  return false;
}

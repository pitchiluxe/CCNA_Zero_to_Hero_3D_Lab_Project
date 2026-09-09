import { useMemo } from 'react';
import { Send, Radio, Trash2, Unplug } from 'lucide-react';
import { LabRuntime } from '../hooks/useLabRuntime';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface Props {
  runtime: LabRuntime;
}

export function SwitchingControls({ runtime }: Props) {
  const switchDevice = useMemo(() => runtime.devices.find((d) => d.type === 'switch'), [runtime.devices]);
  const pcs = useMemo(() => runtime.devices.filter((d) => d.type === 'pc'), [runtime.devices]);
  const pc1 = pcs[0];
  const pc2 = pcs[1];

  const macTable = switchDevice ? runtime.macTables[switchDevice.id] : undefined;
  const pc2Cable = useMemo(
    () => runtime.cables.find((c) => c.from === switchDevice?.id && c.to === pc2?.id),
    [runtime.cables, switchDevice, pc2]
  );

  return (
    <Card>
      <h3 className="mb-2 font-semibold">Switching Controls</h3>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Watch the switch learn source MAC addresses and flood broadcast/unknown unicast frames.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Button size="sm" onClick={() => pc1 && pc2 && runtime.sendFrame(pc1.id, pc2.id)} disabled={!pc1 || !pc2}>
          <Send className="mr-1 h-4 w-4" /> PC1 → PC2
        </Button>
        <Button size="sm" variant="secondary" onClick={() => pc1 && runtime.sendFrame(pc1.id, 'broadcast')} disabled={!pc1}>
          <Radio className="mr-1 h-4 w-4" /> Broadcast
        </Button>
        <Button size="sm" variant="secondary" onClick={() => switchDevice && runtime.clearMacTable(switchDevice.id)} disabled={!switchDevice}>
          <Trash2 className="mr-1 h-4 w-4" /> Clear MAC
        </Button>
        <Button size="sm" variant="ghost" onClick={() => pc2Cable && runtime.toggleCable(pc2Cable.id)} disabled={!pc2Cable}>
          <Unplug className="mr-1 h-4 w-4" /> Toggle PC-2 link
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">MAC Address Table ({switchDevice?.name ?? 'Switch'})</p>
        {!macTable || Object.keys(macTable).length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No entries yet. Send a frame to populate the table.</p>
        ) : (
          <div className="space-y-2">
            {Object.values(macTable).map((entry) => (
              <div key={entry.mac} className="flex items-center justify-between rounded border border-slate-200 p-2 text-sm dark:border-net-700">
                <span className="font-mono text-xs">{entry.mac}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Port {entry.port}</span>
                  <Badge status="up">{runtime.devices.find((d) => d.id === entry.deviceId)?.name ?? entry.deviceId}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

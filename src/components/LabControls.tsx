import { useState } from 'react';
import { Cable, Device, DeviceType } from '../types';
import { LabRuntime } from '../hooks/useLabRuntime';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface Props {
  runtime: LabRuntime;
  selectedId: string | null;
}

const ADDABLE: { type: DeviceType; label: string }[] = [
  { type: 'pc', label: 'PC' },
  { type: 'switch', label: 'Switch' },
  { type: 'router', label: 'Router' },
  { type: 'server', label: 'Server' },
  { type: 'ap', label: 'AP' },
];

export function LabControls({ runtime, selectedId }: Props) {
  const [connectTarget, setConnectTarget] = useState('');
  const [packetTarget, setPacketTarget] = useState('');

  const selectedDevice = runtime.devices.find((d) => d.id === selectedId);
  const otherDevices = runtime.devices.filter((d) => d.id !== selectedId);

  return (
    <Card>
      <h3 className="mb-3 font-semibold">Lab Controls</h3>

      <div className="mb-4 flex flex-wrap gap-2">
        {ADDABLE.map((d) => (
          <Button key={d.type} size="sm" variant="secondary" onClick={() => runtime.addDevice(d.type)}>
            + {d.label}
          </Button>
        ))}
      </div>

      {selectedDevice && (
        <div className="mb-4 rounded-lg border border-slate-200 p-3 dark:border-net-700">
          <p className="mb-2 text-sm font-medium">Selected: {selectedDevice.name}</p>

          <div className="mb-2 flex items-center gap-2">
            <select
              value={connectTarget}
              onChange={(e) => setConnectTarget(e.target.value)}
              className="flex-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-net-700 dark:bg-net-900"
            >
              <option value="">Connect to...</option>
              {otherDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={() => {
                if (selectedId && connectTarget) {
                  runtime.connect(selectedId, connectTarget);
                  setConnectTarget('');
                }
              }}
            >
              Connect
            </Button>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <select
              value={packetTarget}
              onChange={(e) => setPacketTarget(e.target.value)}
              className="flex-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-net-700 dark:bg-net-900"
            >
              <option value="">Send packet to...</option>
              {otherDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (selectedId && packetTarget) {
                  runtime.sendPacket(selectedId, packetTarget);
                  setPacketTarget('');
                }
              }}
            >
              Send
            </Button>
          </div>

          <Button size="sm" variant="ghost" onClick={() => selectedId && runtime.removeDevice(selectedId)}>
            Remove selected device
          </Button>
        </div>
      )}

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cables</p>
        {runtime.cables.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No cables yet.</p>
        ) : (
          <div className="space-y-2">
            {runtime.cables.map((c) => (
              <CableRow key={c.id} cable={c} devices={runtime.devices} onToggle={() => runtime.toggleCable(c.id)} onRemove={() => runtime.removeCable(c.id)} />
            ))}
          </div>
        )}
      </div>

      <Button size="sm" variant="ghost" className="w-full" onClick={runtime.reset}>
        Reset lab
      </Button>
    </Card>
  );
}

function CableRow({
  cable,
  devices,
  onToggle,
  onRemove,
}: {
  cable: Cable;
  devices: Device[];
  onToggle: () => void;
  onRemove: () => void;
}) {
  const fromName = devices.find((d) => d.id === cable.from)?.name ?? cable.from;
  const toName = devices.find((d) => d.id === cable.to)?.name ?? cable.to;

  return (
    <div className="flex items-center justify-between gap-2 rounded border border-slate-200 p-2 text-sm dark:border-net-700">
      <span className="min-w-0 truncate">
        {fromName} → {toName}
      </span>
      <div className="flex items-center gap-2">
        <Badge status={cable.status}>{cable.status.toUpperCase()}</Badge>
        <button onClick={onToggle} className="rounded p-1 text-cisco-600 hover:bg-slate-100 dark:hover:bg-net-800">
          Toggle
        </button>
        <button onClick={onRemove} className="rounded p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
          ×
        </button>
      </div>
    </div>
  );
}

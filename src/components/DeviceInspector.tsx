import { Device } from '../types';
import { Badge } from './ui/Badge';

interface Props {
  device: Device | null;
  onToggleInterface?: (deviceId: string, ifaceId: string) => void;
}

export function DeviceInspector({ device, onToggleInterface }: Props) {
  if (!device) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center dark:border-net-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">Click a device in the 3D lab to inspect its interfaces and status.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{device.name}</h4>
        <Badge status={device.status}>{device.status.toUpperCase()}</Badge>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Type: <span className="font-medium text-slate-700 dark:text-slate-300">{device.type.toUpperCase()}</span></p>

      {device.interfaces.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Interfaces</p>
          <div className="space-y-2">
            {device.interfaces.map((iface) => (
              <div key={iface.id} className="rounded border border-slate-200 p-2 text-sm dark:border-net-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{iface.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge status={iface.status}>{iface.status.toUpperCase()}</Badge>
                    {onToggleInterface && (
                      <button
                        onClick={() => onToggleInterface(device.id, iface.id)}
                        className="text-xs text-cisco-600 hover:underline dark:text-cisco-400"
                      >
                        Toggle
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-1 grid gap-1 text-xs text-slate-600 dark:text-slate-300">
                  {iface.ip && <p>IP: {iface.ip}</p>}
                  {iface.mask && <p>Mask: {iface.mask}</p>}
                  {iface.gateway && <p>Gateway: {iface.gateway}</p>}
                  {iface.vlan !== undefined && <p>VLAN: {iface.vlan}</p>}
                  {iface.mode && <p>Mode: {iface.mode}</p>}
                  {iface.mode === 'trunk' && iface.trunkAllowed && <p>Allowed: {iface.trunkAllowed.join(', ')}</p>}
                  <p>MAC: {iface.mac}</p>
                  {iface.connectedTo && <p>Connected: {iface.connectedTo}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

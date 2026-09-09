import { useState, useMemo } from 'react';
import { Search, AlertCircle, CheckCircle, Network } from 'lucide-react';
import { LabRuntime } from '../hooks/useLabRuntime';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface Props {
  runtime: LabRuntime;
}

export function IPv4Controls({ runtime }: Props) {
  const hosts = useMemo(() => runtime.devices.filter((d) => d.type === 'pc' || d.type === 'router' || d.type === 'server'), [runtime.devices]);
  const [source, setSource] = useState(hosts[0]?.id ?? '');
  const [target, setTarget] = useState('');
  const [pingResult, setPingResult] = useState('');
  const [issues, setIssues] = useState<string[]>([]);

  const handlePing = () => {
    if (!source || !target) return;
    setPingResult(runtime.ping(source, target));
  };

  const handleCheck = () => {
    setIssues(runtime.checkIPv4Issues());
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Network className="h-5 w-5 text-cisco-500" />
          <h3 className="font-semibold">IPv4 Configuration</h3>
        </div>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Edit a device's IP, subnet mask, and default gateway. Use dotted decimal (e.g. 255.255.255.0) or CIDR (e.g. /24) masks.
        </p>

        <div className="space-y-3">
          {hosts.map((d) => {
            const iface = d.interfaces[0];
            if (!iface) return null;
            return (
              <div key={d.id} className="rounded-lg border border-slate-200 p-3 dark:border-net-700">
                <p className="mb-2 text-sm font-medium">{d.name}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400">IP</label>
                    <input
                      defaultValue={iface.ip ?? ''}
                      onBlur={(e) => runtime.setIp(d.id, iface.id, e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400">Mask</label>
                    <input
                      defaultValue={iface.mask ?? ''}
                      onBlur={(e) => runtime.setMask(d.id, iface.id, e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400">Gateway</label>
                    <input
                      defaultValue={iface.gateway ?? ''}
                      onBlur={(e) => runtime.setGateway(d.id, iface.id, e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Ping</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900"
          >
            {hosts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target IP"
            className="flex-1 rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900"
          />
          <Button onClick={handlePing}>
            <Search className="mr-1 h-4 w-4" /> Ping
          </Button>
        </div>
        {pingResult && (
          <p className={`mt-3 text-sm ${pingResult.toLowerCase().includes('reply') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {pingResult}
          </p>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-cisco-500" />
          <h3 className="font-semibold">Check Config</h3>
        </div>
        <Button variant="secondary" onClick={handleCheck}>
          Find IPv4 issues
        </Button>
        <div className="mt-3 space-y-2">
          {issues.length === 0 ? (
            pingResult ? null : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Click "Find IPv4 issues" to validate the network.</p>
            )
          ) : (
            issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 rounded border border-rose-200 bg-rose-50 p-2 text-sm text-rose-800 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-300">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {issue}
              </div>
            ))
          )}
          {issues.length === 0 && pingResult && (
            <div className="flex items-start gap-2 rounded border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-300">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              No IPv4 issues found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

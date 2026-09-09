import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface AP {
  id: string;
  name: string;
  ssid: string;
  channel: number;
  band: '2.4' | '5';
  security: 'Open' | 'WPA2' | 'WPA3';
  power: number;
}

const INITIAL_APS: AP[] = [
  { id: 'ap1', name: 'AP-1', ssid: 'CCNA-LAB', channel: 1, band: '2.4', security: 'WPA2', power: 50 },
  { id: 'ap2', name: 'AP-2', ssid: 'CCNA-LAB', channel: 6, band: '2.4', security: 'WPA2', power: 50 },
];

export function WirelessLab() {
  const [aps, setAps] = useState<AP[]>(INITIAL_APS);
  const [client, setClient] = useState({ ssid: 'CCNA-LAB', psk: 'cisco123' });
  const [selected, setSelected] = useState('ap1');
  const [result, setResult] = useState('');

  const connect = () => {
    const candidates = aps.filter((a) => a.ssid === client.ssid && a.security !== 'Open');
    if (candidates.length === 0) {
      setResult('No matching AP found.');
      return;
    }
    const best = candidates.reduce((a, b) => (a.power > b.power ? a : b));
    setSelected(best.id);
    setResult(`Connected to ${best.name} on ${best.band} GHz, ch ${best.channel}, ${best.security}.`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">Wireless Lab</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure APs, set SSID, channels, bands, and security, then simulate a client association.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Access Points</h3>
          <div className="space-y-3">
            {aps.map((ap) => (
              <div key={ap.id} className={`rounded border p-3 text-sm ${selected === ap.id ? 'border-cisco-600 bg-cisco-50 dark:bg-net-900' : 'border-slate-200 dark:border-net-700'}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold">{ap.name}</span>
                  <Badge status={ap.security === 'Open' ? 'down' : 'up'}>{ap.security}</Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs text-slate-500">SSID</label>
                  <input value={ap.ssid} onChange={(e) => setAps(aps.map((a) => (a.id === ap.id ? { ...a, ssid: e.target.value } : a)))} className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
                  <label className="text-xs text-slate-500">Channel</label>
                  <input type="number" value={ap.channel} onChange={(e) => setAps(aps.map((a) => (a.id === ap.id ? { ...a, channel: parseInt(e.target.value, 10) || 1 } : a)))} className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
                  <label className="text-xs text-slate-500">Band</label>
                  <select value={ap.band} onChange={(e) => setAps(aps.map((a) => (a.id === ap.id ? { ...a, band: e.target.value as '2.4' | '5' } : a)))} className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900">
                    <option value="2.4">2.4 GHz</option>
                    <option value="5">5 GHz</option>
                  </select>
                  <label className="text-xs text-slate-500">Security</label>
                  <select value={ap.security} onChange={(e) => setAps(aps.map((a) => (a.id === ap.id ? { ...a, security: e.target.value as AP['security'] } : a)))} className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900">
                    <option>Open</option>
                    <option>WPA2</option>
                    <option>WPA3</option>
                  </select>
                  <label className="text-xs text-slate-500">Power %</label>
                  <input type="number" value={ap.power} onChange={(e) => setAps(aps.map((a) => (a.id === ap.id ? { ...a, power: parseInt(e.target.value, 10) || 0 } : a)))} className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">Client</h3>
          <div className="mb-3 grid gap-2">
            <input value={client.ssid} onChange={(e) => setClient({ ...client, ssid: e.target.value })} placeholder="SSID" className="rounded border border-slate-200 bg-white px-3 py-2 dark:border-net-700 dark:bg-net-900" />
            <input value={client.psk} onChange={(e) => setClient({ ...client, psk: e.target.value })} placeholder="Passphrase" className="rounded border border-slate-200 bg-white px-3 py-2 dark:border-net-700 dark:bg-net-900" />
          </div>
          <Button onClick={connect}>Connect</Button>
          {result && <p className="mt-2 text-sm text-cisco-600 dark:text-cisco-400">{result}</p>}

          <div className="mt-4 text-sm text-slate-700 dark:text-slate-300">
            <p><strong>2.4 GHz:</strong> fewer channels, better range, more interference.</p>
            <p><strong>5 GHz:</strong> more channels, higher rates, shorter range.</p>
            <p><strong>Non-overlapping 2.4 GHz channels:</strong> 1, 6, 11.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

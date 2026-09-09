import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { isSameSubnet, getNetworkAddress } from '../utils/ip';

interface Log {
  step: string;
  message: string;
}

export function DhcpLab() {
  const [pool, setPool] = useState({
    network: '192.168.1.0',
    mask: '/24',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    start: '192.168.1.100',
    end: '192.168.1.199',
  });

  const [client, setClient] = useState({
    ip: '',
    mask: '',
    gateway: '',
    dns: '',
    state: 'unassigned',
  });

  const [logs, setLogs] = useState<Log[]>([
    { step: 'Info', message: 'Client has no IP. Press "Request DHCP" to begin DORA.' },
  ]);

  const addLog = (step: string, message: string) => {
    setLogs((prev) => [...prev, { step, message }]);
  };

  const request = () => {
    setLogs([]);
    setClient({ ip: '', mask: '', gateway: '', dns: '', state: 'discovering' });

    // The client is on 192.168.1.10/24 by default (no IP yet, but the server must be in same broadcast domain)
    const clientSubnet = '192.168.1.0';
    const poolNet = getNetworkAddress(pool.network, pool.mask) ?? pool.network;
    const clientNet = getNetworkAddress(clientSubnet, pool.mask) ?? clientSubnet;

    addLog('DISCOVER', 'Client broadcasts DHCPDISCOVER to 255.255.255.255.');

    if (poolNet !== clientNet) {
      addLog('NO OFFER', `The server pool network ${pool.network} does not match the client's subnet ${clientSubnet}. No offer sent.`);
      setClient((c) => ({ ...c, state: 'failed' }));
      return;
    }

    const offered = pool.start;
    addLog('OFFER', `Server unicasts DHCPOFFER: ${offered} ${pool.mask}, gateway ${pool.gateway}, DNS ${pool.dns}.`);

    // Simulate client accepting
    addLog('REQUEST', `Client broadcasts DHCPREQUEST for ${offered}.`);
    addLog('ACK', `Server sends DHCPACK. Lease assigned.`);

    setClient({
      ip: offered,
      mask: pool.mask,
      gateway: pool.gateway,
      dns: pool.dns,
      state: 'bound',
    });
  };

  const release = () => {
    setClient({ ip: '', mask: '', gateway: '', dns: '', state: 'unassigned' });
    setLogs([{ step: 'RELEASE', message: 'Client releases the lease. IP returned to pool.' }]);
  };

  const isValid =
    pool.network &&
    pool.mask &&
    pool.gateway &&
    pool.start &&
    pool.end &&
    isSameSubnet(pool.start, pool.network, pool.mask) &&
    isSameSubnet(pool.end, pool.network, pool.mask);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">DHCP DORA Lab</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure a DHCP pool, then watch the Discover → Offer → Request → Ack flow.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">DHCP Server Pool</h3>
          <div className="space-y-2">
            {[
              { label: 'Network', key: 'network', value: pool.network },
              { label: 'Mask', key: 'mask', value: pool.mask },
              { label: 'Default Gateway', key: 'gateway', value: pool.gateway },
              { label: 'DNS Server', key: 'dns', value: pool.dns },
              { label: 'Start IP', key: 'start', value: pool.start },
              { label: 'End IP', key: 'end', value: pool.end },
            ].map((f) => (
              <div key={f.key} className="grid items-center gap-2 text-sm sm:grid-cols-3">
                <label className="text-slate-500 dark:text-slate-400">{f.label}</label>
                <input
                  value={f.value}
                  onChange={(e) => setPool((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="sm:col-span-2 rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900"
                />
              </div>
            ))}
          </div>
          <div className="mt-3">
            {isValid ? (
              <Badge status="up">Pool valid</Badge>
            ) : (
              <Badge status="down">Pool mismatch or missing</Badge>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold">Client</h3>
            <div className="grid gap-2 text-sm">
              <p><span className="text-slate-500 dark:text-slate-400">State:</span> <Badge status={client.state === 'bound' ? 'up' : client.state === 'failed' ? 'down' : 'neutral'}>{client.state}</Badge></p>
              {client.state === 'bound' && (
                <>
                  <p><span className="text-slate-500">IP:</span> {client.ip}</p>
                  <p><span className="text-slate-500">Mask:</span> {client.mask}</p>
                  <p><span className="text-slate-500">Gateway:</span> {client.gateway}</p>
                  <p><span className="text-slate-500">DNS:</span> {client.dns}</p>
                </>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={request} disabled={!isValid}>Request DHCP</Button>
              <Button onClick={release} variant="secondary" disabled={client.state !== 'bound'}>Release</Button>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold">DORA Log</h3>
            <div className="h-48 overflow-y-auto rounded border border-slate-200 bg-black p-3 font-mono text-sm text-emerald-400 dark:border-net-700">
              {logs.map((l, i) => (
                <div key={i} className="mb-1">
                  <span className="text-yellow-400">[{l.step}]</span> {l.message}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

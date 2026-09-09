import { useState } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface Packet {
  id: number;
  time: number;
  src: string;
  dst: string;
  protocol: string;
  length: number;
  info: string;
}

const PACKETS: Packet[] = [
  { id: 1, time: 0.0, src: '192.168.1.10', dst: '255.255.255.255', protocol: 'DHCP', length: 342, info: 'DHCP Discover' },
  { id: 2, time: 0.1, src: '192.168.1.1', dst: '192.168.1.10', protocol: 'DHCP', length: 342, info: 'DHCP Offer' },
  { id: 3, time: 0.2, src: '192.168.1.10', dst: '192.168.1.1', protocol: 'ARP', length: 42, info: 'Who has 192.168.1.1?' },
  { id: 4, time: 0.3, src: '192.168.1.1', dst: '192.168.1.10', protocol: 'ARP', length: 42, info: '192.168.1.1 is at aa:bb:cc:00:00:01' },
  { id: 5, time: 0.5, src: '192.168.1.10', dst: '8.8.8.8', protocol: 'DNS', length: 78, info: 'Standard query A www.example.com' },
  { id: 6, time: 0.7, src: '8.8.8.8', dst: '192.168.1.10', protocol: 'DNS', length: 120, info: 'Standard query response A 203.0.113.10' },
  { id: 7, time: 1.0, src: '192.168.1.10', dst: '203.0.113.10', protocol: 'TCP', length: 66, info: 'SYN Seq=0' },
  { id: 8, time: 1.2, src: '203.0.113.10', dst: '192.168.1.10', protocol: 'TCP', length: 66, info: 'SYN, ACK Seq=0 Ack=1' },
];

export function WiresharkLab() {
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Packet | null>(null);

  const filtered = PACKETS.filter((p) => {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return p.protocol.toLowerCase().includes(f) || p.src.includes(f) || p.dst.includes(f) || p.info.toLowerCase().includes(f);
  });

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">Wireshark Packet Analysis</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Apply display filters, inspect frames, and identify protocol behavior.
        </p>
      </Card>

      <Card>
        <div className="mb-3">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter (e.g. arp, dns, 192.168)"
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 dark:border-net-700 dark:bg-net-900"
          />
        </div>

        <div className="max-h-64 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <th>No.</th>
                <th>Time</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Protocol</th>
                <th>Len</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-net-700">
              {filtered.map((p) => (
                <tr key={p.id} onClick={() => setSelected(p)} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-net-900">
                  <td>{p.id}</td>
                  <td>{p.time.toFixed(4)}</td>
                  <td className="font-mono">{p.src}</td>
                  <td className="font-mono">{p.dst}</td>
                  <td><Badge status="up">{p.protocol}</Badge></td>
                  <td>{p.length}</td>
                  <td>{p.info}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="mt-4 rounded border border-slate-200 p-3 text-sm dark:border-net-700">
            <p className="font-bold">Frame {selected.id}: {selected.protocol}</p>
            <p className="text-slate-500">Source: {selected.src} → Destination: {selected.dst}</p>
            <p className="text-slate-500">Length: {selected.length} bytes</p>
            <p className="mt-2">{selected.info}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

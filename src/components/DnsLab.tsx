import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

type RecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'PTR';

interface DnsRecord {
  id: string;
  name: string;
  type: RecordType;
  value: string;
}

const INITIAL_RECORDS: DnsRecord[] = [
  { id: '1', name: 'www.example.com', type: 'A', value: '192.168.1.10' },
  { id: '2', name: 'example.com', type: 'A', value: '192.168.1.1' },
  { id: '3', name: 'mail.example.com', type: 'A', value: '192.168.1.20' },
  { id: '4', name: 'example.com', type: 'MX', value: '10 mail.example.com' },
  { id: '5', name: '10.1.168.192.in-addr.arpa', type: 'PTR', value: 'www.example.com' },
];

export function DnsLab() {
  const [records, setRecords] = useState<DnsRecord[]>(INITIAL_RECORDS);
  const [newRecord, setNewRecord] = useState({ name: '', type: 'A' as RecordType, value: '' });
  const [query, setQuery] = useState({ name: 'www.example.com', type: 'A' as RecordType });
  const [trace, setTrace] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');

  const addRecord = () => {
    if (!newRecord.name || !newRecord.value) return;
    setRecords((prev) => [...prev, { ...newRecord, id: `${Date.now()}` }]);
    setNewRecord({ name: '', type: 'A', value: '' });
  };

  const removeRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const resolve = () => {
    const steps: string[] = [];
    const q = query.name.toLowerCase().trim();

    steps.push(`Client query: ${q} IN ${query.type}`);

    // Root server
    steps.push('Resolver queries a root server for the TLD.');
    steps.push(`Root server refers to the .${tld(q)} TLD server.`);

    // TLD server
    steps.push(`TLD server refers to the authoritative name server for ${zone(q)}.`);

    // Authoritative
    steps.push(`Resolver queries the authoritative server for ${zone(q)}.`);

    const exact = records.filter((r) => r.name.toLowerCase() === q && r.type === query.type);
    const cname = records.find((r) => r.name.toLowerCase() === q && r.type === 'CNAME');

    if (exact.length > 0) {
      for (const r of exact) {
        steps.push(`ANSWER: ${r.name} ${r.type} ${r.value}`);
      }
      setAnswer(`NOERROR; ${exact.length} record(s) found.`);
    } else if (cname) {
      steps.push(`CNAME found: ${cname.name} → ${cname.value}`);
      const target = cname.value.toLowerCase().trim();
      const follow = records.filter((r) => r.name.toLowerCase() === target && r.type === query.type);
      if (follow.length > 0) {
        for (const r of follow) {
          steps.push(`ANSWER: ${r.name} ${r.type} ${r.value}`);
        }
        setAnswer(`NOERROR via CNAME; ${follow.length} record(s) found.`);
      } else {
        steps.push(`No ${query.type} record for ${target}.`);
        setAnswer(`NOERROR, but NODATA for type ${query.type} after CNAME.`);
      }
    } else if (records.some((r) => r.name.toLowerCase() === q)) {
      steps.push(`No ${query.type} record, but other types exist for ${q}.`);
      setAnswer(`NOERROR, but NODATA for type ${query.type}.`);
    } else if (records.some((r) => q.endsWith(`.${r.name.toLowerCase()}`) || r.name.toLowerCase().endsWith(`.${q}`))) {
      steps.push(`Domain exists, but the exact name has no records.`);
      setAnswer(`NXDOMAIN or NODATA for ${q} ${query.type}.`);
    } else {
      steps.push(`No record found for ${q}.`);
      setAnswer(`NXDOMAIN: ${q} does not exist in this zone.`);
    }

    setTrace(steps);
  };

  const tld = (name: string) => {
    const parts = name.split('.').filter(Boolean);
    return parts[parts.length - 1] ?? '';
  };

  const zone = (name: string) => {
    const parts = name.split('.').filter(Boolean);
    if (parts.length >= 2) return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    return name;
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">DNS Resolution Lab</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create DNS records and simulate recursive resolution through root, TLD, and authoritative servers.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Zone Records</h3>
          <div className="mb-3 max-h-60 overflow-auto rounded border border-slate-200 dark:border-net-700">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Type</th>
                  <th className="px-2 py-1">Value</th>
                  <th className="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-net-700">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="px-2 py-1 font-mono">{r.name}</td>
                    <td className="px-2 py-1">{r.type}</td>
                    <td className="px-2 py-1 font-mono">{r.value}</td>
                    <td className="px-2 py-1">
                      <button onClick={() => removeRecord(r.id)} className="text-rose-600 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            <input
              value={newRecord.name}
              onChange={(e) => setNewRecord((r) => ({ ...r, name: e.target.value }))}
              placeholder="Name"
              className="rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900"
            />
            <select
              value={newRecord.type}
              onChange={(e) => setNewRecord((r) => ({ ...r, type: e.target.value as RecordType }))}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900"
            >
              <option>A</option>
              <option>AAAA</option>
              <option>CNAME</option>
              <option>MX</option>
              <option>PTR</option>
            </select>
            <input
              value={newRecord.value}
              onChange={(e) => setNewRecord((r) => ({ ...r, value: e.target.value }))}
              placeholder="Value"
              className="rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-net-700 dark:bg-net-900"
            />
            <Button onClick={addRecord}>Add</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold">Query</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              <input
                value={query.name}
                onChange={(e) => setQuery((q) => ({ ...q, name: e.target.value }))}
                placeholder="hostname"
                className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900"
              />
              <select
                value={query.type}
                onChange={(e) => setQuery((q) => ({ ...q, type: e.target.value as RecordType }))}
                className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900"
              >
                <option>A</option>
                <option>AAAA</option>
                <option>CNAME</option>
                <option>MX</option>
                <option>PTR</option>
              </select>
              <Button onClick={resolve}>Resolve</Button>
            </div>
            {answer && <p className="text-sm text-cisco-600 dark:text-cisco-400">{answer}</p>}
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold">Resolution Trace</h3>
            <div className="h-48 overflow-y-auto rounded border border-slate-200 bg-black p-3 font-mono text-sm text-emerald-400 dark:border-net-700">
              {trace.length === 0 && <p className="text-slate-500">Run a query to see the trace.</p>}
              {trace.map((t, i) => (
                <div key={i} className="mb-1">
                  <span className="text-yellow-400">[{i + 1}]</span> {t}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

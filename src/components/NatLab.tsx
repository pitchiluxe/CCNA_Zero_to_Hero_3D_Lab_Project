import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface NatEntry {
  id: string;
  insideLocal: string;
  insideGlobal: string;
  type: 'static' | 'dynamic' | 'pat';
}

export function NatLab() {
  const [entries, setEntries] = useState<NatEntry[]>([
    { id: '1', insideLocal: '192.168.1.10', insideGlobal: '203.0.113.10', type: 'static' },
    { id: '2', insideLocal: '10.0.0.0/24', insideGlobal: '203.0.113.100 - 203.0.113.199', type: 'dynamic' },
    { id: '3', insideLocal: 'any', insideGlobal: '203.0.113.1', type: 'pat' },
  ]);
  const [newEntry, setNewEntry] = useState({ insideLocal: '', insideGlobal: '', type: 'static' as NatEntry['type'] });
  const [test, setTest] = useState('192.168.1.10');
  const [result, setResult] = useState('');

  const add = () => {
    if (!newEntry.insideLocal || !newEntry.insideGlobal) return;
    setEntries([...entries, { ...newEntry, id: `${Date.now()}` }]);
    setNewEntry({ insideLocal: '', insideGlobal: '', type: 'static' });
  };

  const translate = () => {
    const match = entries.find((e) => e.insideLocal === test || e.insideLocal === 'any');
    if (match) setResult(`${test} → ${match.insideGlobal} via ${match.type.toUpperCase()} NAT.`);
    else setResult(`${test} is not in the NAT table. No translation.`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">NAT / PAT Lab</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Build a NAT table with static, dynamic, and PAT overload entries, then test an inside-local to inside-global translation.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">NAT Table</h3>
          <div className="mb-3 space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="grid items-center gap-2 rounded border border-slate-200 p-2 text-sm sm:grid-cols-4 dark:border-net-700">
                <span className="font-mono">{e.insideLocal}</span>
                <span>→</span>
                <span className="font-mono">{e.insideGlobal}</span>
                <Badge status="up">{e.type.toUpperCase()}</Badge>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <input value={newEntry.insideLocal} onChange={(v) => setNewEntry({ ...newEntry, insideLocal: v.target.value })} placeholder="Inside local" className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
            <input value={newEntry.insideGlobal} onChange={(v) => setNewEntry({ ...newEntry, insideGlobal: v.target.value })} placeholder="Inside global" className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
            <select value={newEntry.type} onChange={(v) => setNewEntry({ ...newEntry, type: v.target.value as any })} className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900">
              <option value="static">Static</option>
              <option value="dynamic">Dynamic</option>
              <option value="pat">PAT</option>
            </select>
            <Button onClick={add}>Add</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-semibold">Translation Test</h3>
            <div className="flex flex-wrap gap-2">
              <input value={test} onChange={(e) => setTest(e.target.value)} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900" />
              <Button onClick={translate}>Translate</Button>
            </div>
            {result && <p className="mt-2 text-sm text-cisco-600 dark:text-cisco-400">{result}</p>}
          </Card>

          <Card>
            <h3 className="mb-2 font-semibold">Key Concepts</h3>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li><strong>Static NAT:</strong> one-to-one fixed mapping.</li>
              <li><strong>Dynamic NAT:</strong> one-to-one from a pool, no overload.</li>
              <li><strong>PAT:</strong> many-to-one using ports; the most common form.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

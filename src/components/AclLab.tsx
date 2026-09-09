import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

type Action = 'permit' | 'deny';

interface Rule {
  id: string;
  action: Action;
  protocol: string;
  src: string;
  dst: string;
  port?: string;
}

export function AclLab() {
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', action: 'permit', protocol: 'ip', src: '192.168.1.0/24', dst: 'any' },
    { id: '2', action: 'deny', protocol: 'tcp', src: 'any', dst: '192.168.2.0/24', port: '80' },
  ]);
  const [newRule, setNewRule] = useState<Rule>({ id: '', action: 'permit', protocol: 'ip', src: '', dst: '', port: '' });
  const [test, setTest] = useState({ protocol: 'tcp', src: '192.168.1.10', dst: '192.168.2.10', port: '80' });
  const [result, setResult] = useState('');

  const add = () => {
    if (!newRule.src || !newRule.dst) return;
    setRules([...rules, { ...newRule, id: `${Date.now()}` }]);
    setNewRule({ id: '', action: 'permit', protocol: 'ip', src: '', dst: '', port: '' });
  };

  const check = () => {
    for (const r of rules) {
      if (matches(r, test)) {
        setResult(`Matched rule: ${r.action.toUpperCase()} ${r.protocol} ${r.src} → ${r.dst}. Packet ${r.action.toUpperCase()}ED.`);
        return;
      }
    }
    setResult('No matching rule. Implicit deny applied.');
  };

  const matches = (rule: Rule, t: typeof test) => {
    if (rule.protocol !== 'ip' && rule.protocol !== t.protocol) return false;
    if (!matchIp(t.src, rule.src)) return false;
    if (!matchIp(t.dst, rule.dst)) return false;
    if (rule.port && rule.port !== t.port) return false;
    return true;
  };

  const matchIp = (ip: string, pattern: string) => {
    if (pattern === 'any') return true;
    if (pattern.includes('/')) {
      const [net, mask] = pattern.split('/');
      // naive match for /24 only
      const prefix = parseInt(mask, 10);
      const a = ip.split('.').slice(0, prefix / 8).join('.');
      const b = net.split('.').slice(0, prefix / 8).join('.');
      return a === b;
    }
    return ip === pattern;
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">ACL Lab</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Build an ACL and test whether packets are permitted or denied.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">ACL Rules</h3>
          <div className="mb-3 space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="grid items-center gap-2 rounded border border-slate-200 p-2 text-xs sm:grid-cols-5 dark:border-net-700">
                <Badge status={r.action === 'permit' ? 'up' : 'down'}>{r.action}</Badge>
                <span className="font-mono">{r.protocol}</span>
                <span className="font-mono">{r.src}</span>
                <span className="font-mono">{r.dst}{r.port ? `:${r.port}` : ''}</span>
                <button onClick={() => setRules(rules.filter((x) => x.id !== r.id))} className="text-rose-600 hover:underline">Remove</button>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-6">
            <select value={newRule.action} onChange={(e) => setNewRule({ ...newRule, action: e.target.value as Action })} className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900">
              <option value="permit">permit</option>
              <option value="deny">deny</option>
            </select>
            <input value={newRule.protocol} onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value })} placeholder="proto" className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
            <input value={newRule.src} onChange={(e) => setNewRule({ ...newRule, src: e.target.value })} placeholder="src" className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
            <input value={newRule.dst} onChange={(e) => setNewRule({ ...newRule, dst: e.target.value })} placeholder="dst" className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
            <input value={newRule.port} onChange={(e) => setNewRule({ ...newRule, port: e.target.value })} placeholder="port" className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
            <Button onClick={add}>Add</Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">Packet Test</h3>
          <div className="mb-3 grid gap-2 sm:grid-cols-4">
            <input value={test.protocol} onChange={(e) => setTest({ ...test, protocol: e.target.value })} placeholder="protocol" className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
            <input value={test.src} onChange={(e) => setTest({ ...test, src: e.target.value })} placeholder="src" className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
            <input value={test.dst} onChange={(e) => setTest({ ...test, dst: e.target.value })} placeholder="dst" className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
            <input value={test.port} onChange={(e) => setTest({ ...test, port: e.target.value })} placeholder="port" className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-net-700 dark:bg-net-900" />
          </div>
          <Button onClick={check}>Check packet</Button>
          {result && <p className="mt-2 text-sm text-cisco-600 dark:text-cisco-400">{result}</p>}
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

type Control = {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
};

const INITIAL: Control[] = [
  { id: 'ssh', name: 'SSH v2', enabled: false, description: 'Encrypted remote management' },
  { id: 'aaa', name: 'AAA', enabled: false, description: 'Authentication, Authorization, Accounting' },
  { id: 'snooping', name: 'DHCP Snooping', enabled: false, description: 'Protect against rogue DHCP servers' },
  { id: 'dai', name: 'Dynamic ARP Inspection', enabled: false, description: 'Validate ARP packets' },
  { id: 'portsec', name: 'Port Security', enabled: false, description: 'Limit MACs on access ports' },
];

export function SecurityLab() {
  const [controls, setControls] = useState<Control[]>(INITIAL);
  const [score, setScore] = useState(0);

  const toggle = (id: string) => {
    setControls((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
      setScore(next.filter((c) => c.enabled).length);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">Network Security Lab</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enable and verify best-practice switch and router security controls.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Security Controls</h3>
          <div className="space-y-2">
            {controls.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded border border-slate-200 p-3 dark:border-net-700">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.description}</p>
                </div>
                <Button size="sm" onClick={() => toggle(c.id)} variant={c.enabled ? 'primary' : 'secondary'}>
                  {c.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">Security Posture</h3>
          <p className="text-3xl font-bold">{score} / {controls.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">controls enabled</p>
          {score === controls.length ? (
            <div className="mt-2"><Badge status="up">Hardened</Badge></div>
          ) : score >= 3 ? (
            <div className="mt-2"><Badge status="neutral">Partial</Badge></div>
          ) : (
            <div className="mt-2"><Badge status="down">Vulnerable</Badge></div>
          )}
          <div className="mt-4 text-sm text-slate-700 dark:text-slate-300">
            <p>Best practices:</p>
            <ul className="ml-4 list-disc">
              <li>Disable Telnet; use SSH.</li>
              <li>Enable AAA for user control.</li>
              <li>Turn on DHCP Snooping and DAI to stop spoofing.</li>
              <li>Use port security on access ports.</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

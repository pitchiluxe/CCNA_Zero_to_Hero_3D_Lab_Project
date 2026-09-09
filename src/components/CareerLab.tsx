import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const SKILLS = [
  { id: 'subnet', label: 'Subnetting', done: false },
  { id: 'vlan', label: 'VLANs & Trunking', done: false },
  { id: 'stp', label: 'STP / EtherChannel', done: false },
  { id: 'routing', label: 'Static & OSPF Routing', done: false },
  { id: 'services', label: 'DHCP / DNS / NAT', done: false },
  { id: 'security', label: 'ACLs & Security', done: false },
  { id: 'wireshark', label: 'Packet Analysis', done: false },
  { id: 'troubleshoot', label: 'Troubleshooting', done: false },
];

export function CareerLab() {
  const [skills, setSkills] = useState(SKILLS);
  const [role, setRole] = useState('noc');

  const toggle = (id: string) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  };

  const completed = skills.filter((s) => s.done).length;
  const pct = Math.round((completed / skills.length) * 100);

  const roles: Record<string, string[]> = {
    noc: ['Subnetting', 'Troubleshooting', 'VLANs & Trunking'],
    neteng: ['Routing', 'Switching', 'Automation', 'Security'],
    sec: ['ACLs & Security', 'Packet Analysis', 'Network Security'],
  };

  const gap = roles[role].filter((r) => !skills.some((s) => s.label === r && s.done));

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">Career Mode</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track your skill readiness for NOC, network engineering, and security roles.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Skills Checklist</h3>
          <div className="space-y-2">
            {skills.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 p-2 text-sm dark:border-net-700">
                <input type="checkbox" checked={s.done} onChange={() => toggle(s.id)} className="h-4 w-4" />
                <span className={s.done ? 'line-through text-slate-500' : ''}>{s.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 font-bold">{pct}% ready</p>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">Role Readiness</h3>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="mb-3 rounded border border-slate-200 bg-white px-3 py-2 dark:border-net-700 dark:bg-net-900">
            <option value="noc">NOC Technician</option>
            <option value="neteng">Network Engineer</option>
            <option value="sec">Network Security</option>
          </select>
          {gap.length === 0 ? (
            <Badge status="up">Ready for {role.toUpperCase()}</Badge>
          ) : (
            <>
              <p className="text-sm text-rose-600 dark:text-rose-400">Gaps for {role}:</p>
              <ul className="ml-4 list-disc text-sm">
                {gap.map((g) => <li key={g}>{g}</li>)}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface Task {
  id: string;
  label: string;
  done: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: 't1', label: 'Design VLANs and subnetting', done: false },
  { id: 't2', label: 'Configure switching (trunks, STP, EtherChannel)', done: false },
  { id: 't3', label: 'Configure routing (OSPF / static)', done: false },
  { id: 't4', label: 'Configure DHCP and DNS', done: false },
  { id: 't5', label: 'Apply NAT/PAT for internet access', done: false },
  { id: 't6', label: 'Apply ACLs and security controls', done: false },
  { id: 't7', label: 'Verify end-to-end connectivity', done: false },
  { id: 't8', label: 'Document the design', done: false },
];

export function CapstoneLab() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [notes, setNotes] = useState('');

  const toggle = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const completed = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">Capstone Enterprise Network</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Plan and checklist a complete small-to-medium enterprise network using all of the skills from the course.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Design Checklist</h3>
          <div className="space-y-2">
            {tasks.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 p-2 text-sm dark:border-net-700">
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} className="h-4 w-4" />
                <span className={t.done ? 'line-through text-slate-500' : ''}>{t.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm">{completed} / {tasks.length} tasks completed</p>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">Design Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your network design, IP plan, VLANs, routing protocol, and security controls here..."
            rows={12}
            className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-sm dark:border-net-700 dark:bg-net-900"
          />
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={() => { /* stored locally */ }}>Save Notes</Button>
            {completed === tasks.length && <Badge status="up">Capstone Complete</Badge>}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-2 font-semibold">Suggested IP Plan</h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300">
          <li><strong>VLAN 10 Management:</strong> 10.10.10.0/24</li>
          <li><strong>VLAN 20 Users:</strong> 10.10.20.0/23</li>
          <li><strong>VLAN 30 Servers:</strong> 10.10.30.0/24</li>
          <li><strong>VLAN 40 Voice/Wi-Fi:</strong> 10.10.40.0/24</li>
          <li><strong>WAN / NAT outside:</strong> 203.0.113.0/30</li>
        </ul>
      </Card>
    </div>
  );
}

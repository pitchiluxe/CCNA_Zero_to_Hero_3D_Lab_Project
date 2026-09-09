import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface Scenario {
  id: string;
  title: string;
  symptoms: string[];
  options: string[];
  answer: string;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: '1',
    title: 'No IP on PC',
    symptoms: ['PC cannot reach gateway', 'IP shows 169.254.x.x'],
    options: ['DHCP server is down', 'Switch port is shut', 'Default gateway wrong'],
    answer: 'DHCP server is down',
    explanation: 'APIPA 169.254.x.x means the client could not reach a DHCP server and self-assigned.',
  },
  {
    id: '2',
    title: 'Intermittent connectivity',
    symptoms: ['Link flaps', 'High CRC errors'],
    options: ['Duplex mismatch', 'Wrong VLAN', 'Missing route'],
    answer: 'Duplex mismatch',
    explanation: 'Duplex mismatches cause collisions, flaps, and CRC errors.',
  },
  {
    id: '3',
    title: 'Cannot reach remote network',
    symptoms: ['Local ping works', 'Remote ping fails', 'No default gateway on host'],
    options: ['Default gateway missing', 'Port security violation', 'Wrong DNS'],
    answer: 'Default gateway missing',
    explanation: 'A host needs a default gateway to send packets outside its own subnet.',
  },
];

export function TroubleshootingLab() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const [reveal, setReveal] = useState(false);

  const scenario = SCENARIOS[index];

  const submit = () => {
    setReveal(true);
    if (selected === scenario.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setIndex((i) => (i + 1) % SCENARIOS.length);
    setSelected('');
    setReveal(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">Troubleshooting Center</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Read symptoms, choose the most likely root cause, and learn why.
        </p>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">{scenario.title}</h3>
          <Badge status="neutral">Score: {score} / {SCENARIOS.length}</Badge>
        </div>

        <div className="mb-3 rounded border border-slate-200 p-3 dark:border-net-700">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Symptoms:</p>
          <ul className="ml-4 list-disc text-sm text-slate-600 dark:text-slate-400">
            {scenario.symptoms.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        <div className="space-y-2">
          {scenario.options.map((o) => (
            <label key={o} className={`flex cursor-pointer items-center gap-2 rounded border p-2 text-sm ${selected === o ? 'border-cisco-600 bg-cisco-50 dark:bg-net-900' : 'border-slate-200 dark:border-net-700'}`}>
              <input type="radio" name="answer" value={o} checked={selected === o} onChange={() => setSelected(o)} className="h-4 w-4" />
              <span>{o}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {!reveal ? (
            <Button onClick={submit} disabled={!selected}>Submit</Button>
          ) : (
            <Button onClick={next} variant="secondary">Next</Button>
          )}
        </div>

        {reveal && (
          <div className="mt-4 rounded border border-slate-200 p-3 dark:border-net-700">
            {selected === scenario.answer ? (
              <p className="text-emerald-600 dark:text-emerald-400">Correct! {scenario.explanation}</p>
            ) : (
              <p className="text-rose-600 dark:text-rose-400">Incorrect. {scenario.explanation}</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Calculator, Grid, Dices, Target } from 'lucide-react';
import { useProgress } from '../stores/progress';
import { isValidIp, isValidMask, getNetworkAddress, getBroadcastAddress, maskToPrefix, prefixToMask } from '../utils/ip';
import { countUsableHosts, getSubnetDetails, getSubnets, prefixForHostCount } from '../utils/subnet';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

type Tab = 'calculator' | 'visualizer' | 'drills' | 'challenge';

const DEPARTMENTS = [
  { name: 'Sales', hosts: 50 },
  { name: 'HR', hosts: 10 },
  { name: 'IT', hosts: 20 },
  { name: 'Management', hosts: 5 },
];

export function SubnettingLab() {
  const [tab, setTab] = useState<Tab>('calculator');
  const recordQuizScore = useProgress((s) => s.recordQuizScore);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">Subnetting Masterclass</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Practice IPv4 subnetting: calculate networks, broadcast addresses, usable hosts, and design subnets for real departments.
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'calculator' ? 'primary' : 'ghost'} onClick={() => setTab('calculator')}>
          <Calculator className="mr-1 h-4 w-4" /> Calculator
        </Button>
        <Button variant={tab === 'visualizer' ? 'primary' : 'ghost'} onClick={() => setTab('visualizer')}>
          <Grid className="mr-1 h-4 w-4" /> Visualizer
        </Button>
        <Button variant={tab === 'drills' ? 'primary' : 'ghost'} onClick={() => setTab('drills')}>
          <Dices className="mr-1 h-4 w-4" /> Drills
        </Button>
        <Button variant={tab === 'challenge' ? 'primary' : 'ghost'} onClick={() => setTab('challenge')}>
          <Target className="mr-1 h-4 w-4" /> Challenge
        </Button>
      </div>

      {tab === 'calculator' && <CalculatorTab />}
      {tab === 'visualizer' && <VisualizerTab />}
      {tab === 'drills' && <DrillsTab recordQuizScore={recordQuizScore} />}
      {tab === 'challenge' && <ChallengeTab />}
    </div>
  );
}

function CalculatorTab() {
  const [ip, setIp] = useState('192.168.1.50');
  const [mask, setMask] = useState('/26');
  const [result, setResult] = useState<ReturnType<typeof getSubnetDetails>>(null);

  const compute = () => {
    setResult(getSubnetDetails(ip, mask));
  };

  return (
    <Card>
      <h3 className="mb-3 font-semibold">Subnet Calculator</h3>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">IP Address</label>
          <input value={ip} onChange={(e) => setIp(e.target.value)} className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">Mask (e.g. /26 or 255.255.255.192)</label>
          <input value={mask} onChange={(e) => setMask(e.target.value)} className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900" />
        </div>
        <div className="flex items-end">
          <Button onClick={compute}>Calculate</Button>
        </div>
      </div>

      {result ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ResultItem label="Network" value={result.network} />
          <ResultItem label="Broadcast" value={result.broadcast} />
          <ResultItem label="First host" value={result.first} />
          <ResultItem label="Last host" value={result.last} />
          <ResultItem label="Usable hosts" value={result.usable.toString()} />
          <ResultItem label="CIDR" value={`/${maskToPrefix(mask) ?? '?'}`} />
        </div>
      ) : (
        <p className="text-sm text-rose-600 dark:text-rose-400">Enter a valid IP and mask to calculate.</p>
      )}
    </Card>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 p-3 dark:border-net-700">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-mono font-medium">{value}</p>
    </div>
  );
}

function VisualizerTab() {
  const [network, setNetwork] = useState('192.168.10.0');
  const [mask, setMask] = useState('/24');
  const [newPrefix, setNewPrefix] = useState(26);
  const [subnets, setSubnets] = useState<ReturnType<typeof getSubnets>>(null);

  const generate = () => {
    setSubnets(getSubnets(network, mask, newPrefix));
  };

  return (
    <Card>
      <h3 className="mb-3 font-semibold">Subnet Visualizer</h3>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">Major Network</label>
          <input value={network} onChange={(e) => setNetwork(e.target.value)} className="w-40 rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">Major Mask</label>
          <input value={mask} onChange={(e) => setMask(e.target.value)} className="w-40 rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">New Prefix</label>
          <select value={newPrefix} onChange={(e) => setNewPrefix(parseInt(e.target.value, 10))} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900">
            {Array.from({ length: 9 }, (_, i) => i + 24).map((p) => (
              <option key={p} value={p}>
                /{p}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={generate}>Generate</Button>
      </div>

      {subnets ? (
        <div className="max-h-[400px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <tr>
                <th className="pb-2">Network</th>
                <th className="pb-2">First</th>
                <th className="pb-2">Last</th>
                <th className="pb-2">Broadcast</th>
                <th className="pb-2">Usable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-net-700">
              {subnets.map((s) => (
                <tr key={s.network}>
                  <td className="py-2 font-mono">{s.network}/{newPrefix}</td>
                  <td className="py-2 font-mono">{s.first}</td>
                  <td className="py-2 font-mono">{s.last}</td>
                  <td className="py-2 font-mono">{s.broadcast}</td>
                  <td className="py-2">{s.usable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-rose-600 dark:text-rose-400">Enter a valid major network and mask, then generate.</p>
      )}
    </Card>
  );
}

interface DrillQuestion {
  id: string;
  type: 'network' | 'broadcast' | 'hosts' | 'cidr';
  prompt: string;
  answer: string;
  explanation: string;
}

function DrillsTab({ recordQuizScore }: { recordQuizScore: (topic: string, score: number) => void }) {
  const [question, setQuestion] = useState<DrillQuestion | null>(null);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);
  const [startTime] = useState(Date.now());

  const generate = useMemo(() => () => {
    const types: DrillQuestion['type'][] = ['network', 'broadcast', 'hosts', 'cidr'];
    const type = types[Math.floor(Math.random() * types.length)];
    const octets = [192, 168, Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
    const host = octets.join('.');
    const prefix = Math.floor(Math.random() * 7) + 24; // /24 to /30
    const mask = prefixToMask(prefix) ?? '?';

    if (type === 'network') {
      const net = getNetworkAddress(host, `/${prefix}`) ?? '?';
      setQuestion({
        id: `${Date.now()}`,
        type,
        prompt: `What is the network address of ${host}/${prefix}?`,
        answer: net,
        explanation: `AND the IP with the /${prefix} mask to find the network address.`,
      });
    } else if (type === 'broadcast') {
      const bcast = getBroadcastAddress(host, `/${prefix}`) ?? '?';
      setQuestion({
        id: `${Date.now()}`,
        type,
        prompt: `What is the broadcast address of ${host}/${prefix}?`,
        answer: bcast,
        explanation: `Set all host bits to 1 in the /${prefix} network.`,
      });
    } else if (type === 'hosts') {
      const usable = countUsableHosts(`/${prefix}`);
      setQuestion({
        id: `${Date.now()}`,
        type,
        prompt: `How many usable hosts are in a /${prefix} subnet?`,
        answer: String(usable),
        explanation: `A /${prefix} leaves ${32 - prefix} host bits, so 2^${32 - prefix} - 2 = ${usable} usable hosts.`,
      });
    } else {
      const hosts = [30, 60, 120, 250][Math.floor(Math.random() * 4)];
      const p = prefixForHostCount(hosts) ?? 24;
      setQuestion({
        id: `${Date.now()}`,
        type,
        prompt: `What CIDR prefix (e.g. /24) gives at least ${hosts} usable hosts?`,
        answer: `/${p}`,
        explanation: `A /${p} provides ${countUsableHosts(`/${p}`)} usable hosts, which is enough for ${hosts}.`,
      });
    }
    setInput('');
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (!question) generate();
  }, [question, generate]);

  const submit = () => {
    if (!question) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    const isCorrect = input.trim().toLowerCase() === question.answer.toLowerCase();
    if (isCorrect) {
      const nextCorrect = correct + 1;
      setCorrect(nextCorrect);
      setFeedback({ type: 'correct', text: `Correct! ${question.explanation}` });
      recordQuizScore('Subnetting', Math.round((nextCorrect / nextAttempts) * 100));
      setTimeout(() => generate(), 1200);
    } else {
      setFeedback({ type: 'wrong', text: `The correct answer was ${question.answer}. ${question.explanation}` });
      recordQuizScore('Subnetting', Math.round((correct / nextAttempts) * 100));
    }
  };

  const elapsed = Math.floor((Date.now() - startTime) / 1000);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Subnetting Drills</h3>
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>Score: {correct}/{attempts}</span>
          <span>Time: {elapsed}s</span>
        </div>
      </div>

      {question && (
        <div className="mb-4 rounded-lg border border-slate-200 p-4 dark:border-net-700">
          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">{question.prompt}</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Your answer"
              className="flex-1 rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900"
            />
            <Button onClick={submit}>Submit</Button>
            <Button variant="secondary" onClick={generate}>
              Skip
            </Button>
          </div>
        </div>
      )}

      {feedback && (
        <p className={`text-sm ${feedback.type === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {feedback.text}
        </p>
      )}
    </Card>
  );
}

function ChallengeTab() {
  const [prefixes, setPrefixes] = useState<Record<string, number>>({
    Sales: 26,
    HR: 28,
    IT: 27,
    Management: 29,
  });
  const [result, setResult] = useState<string | null>(null);

  const validate = () => {
    const major = '192.168.10.0';
    const majorMask = '/24';
    const majorNet = getNetworkAddress(major, majorMask);
    if (!majorNet) {
      setResult('Invalid major network.');
      return;
    }

    const majorNum = 256; // /24 has 256 total
    const used: { name: string; prefix: number; count: number }[] = [];

    for (const d of DEPARTMENTS) {
      const p = prefixes[d.name];
      const needed = prefixForHostCount(d.hosts);
      if (needed === null) {
        setResult(`${d.name}: cannot satisfy ${d.hosts} hosts.`);
        return;
      }
      if (p < needed) {
        setResult(`${d.name}: /${p} does not provide enough usable hosts for ${d.hosts} required.`);
        return;
      }
      used.push({ name: d.name, prefix: p, count: Math.pow(2, 32 - p) });
    }

    const total = used.reduce((sum, u) => sum + u.count, 0);
    if (total > majorNum) {
      setResult(`The chosen prefixes require ${total} addresses, but 192.168.10.0/24 has 256.`);
      return;
    }

    const subnets = getSubnets(major, majorMask, Math.max(...used.map((u) => u.prefix)));
    if (!subnets || subnets.length < used.length) {
      setResult('Could not allocate enough subnets from the major network.');
      return;
    }

    setResult('All departments fit within 192.168.10.0/24. Well done!');
  };

  return (
    <Card>
      <h3 className="mb-2 font-semibold">VLSM Design Challenge</h3>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        You have 192.168.10.0/24. Choose a CIDR prefix for each department that provides enough usable hosts.
      </p>

      <div className="space-y-3">
        {DEPARTMENTS.map((d) => (
          <div key={d.name} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-net-700">
            <div className="min-w-[120px] flex-1">
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Needs {d.hosts}+ hosts</p>
            </div>
            <select
              value={prefixes[d.name]}
              onChange={(e) => setPrefixes((p) => ({ ...p, [d.name]: parseInt(e.target.value, 10) }))}
              className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900"
            >
              {Array.from({ length: 9 }, (_, i) => i + 24).map((p) => (
                <option key={p} value={p}>
                  /{p} ({Math.max(0, Math.pow(2, 32 - p) - 2)} hosts)
                </option>
              ))}
            </select>
            {prefixForHostCount(d.hosts) && prefixes[d.name] >= prefixForHostCount(d.hosts)! ? (
              <Badge status="up">Fits</Badge>
            ) : (
              <Badge status="down">Too small</Badge>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button onClick={validate}>Validate Design</Button>
        {result && <p className="mt-3 text-sm text-cisco-600 dark:text-cisco-400">{result}</p>}
      </div>
    </Card>
  );
}

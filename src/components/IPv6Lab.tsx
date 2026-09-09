import { useMemo, useState, useEffect } from 'react';
import { useProgress } from '../stores/progress';
import { isValidIPv6, expandIPv6, compressIPv6, getIPv6Type, macToEUI64, generateLinkLocal, generateSLAAC, IPv6Type } from '../utils/ipv6';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

type Tab = 'types' | 'compress' | 'eui64' | 'drills' | 'challenge';

const TYPE_LABELS: Record<IPv6Type, string> = {
  'unspecified': 'Unspecified address (all zeros)',
  'loopback': 'Loopback (::1)',
  'multicast': 'Multicast (ff00::/8)',
  'link-local': 'Link-local (fe80::/10)',
  'unique-local': 'Unique local (fc00::/7)',
  'global-unicast': 'Global unicast (2000::/3)',
  'unknown': 'Unknown or reserved',
};

export function IPv6Lab() {
  const [tab, setTab] = useState<Tab>('types');

  const render = () => {
    switch (tab) {
      case 'types':
        return <TypesTab />;
      case 'compress':
        return <CompressTab />;
      case 'eui64':
        return <Eui64Tab />;
      case 'drills':
        return <DrillsTab />;
      case 'challenge':
        return <ChallengeTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">IPv6 Fundamentals</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Practice IPv6 notation, compression, address types, and EUI-64 interface identifiers.
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'types' ? 'primary' : 'ghost'} onClick={() => setTab('types')}>Types</Button>
        <Button variant={tab === 'compress' ? 'primary' : 'ghost'} onClick={() => setTab('compress')}>Compress / Expand</Button>
        <Button variant={tab === 'eui64' ? 'primary' : 'ghost'} onClick={() => setTab('eui64')}>EUI-64</Button>
        <Button variant={tab === 'drills' ? 'primary' : 'ghost'} onClick={() => setTab('drills')}>Drills</Button>
        <Button variant={tab === 'challenge' ? 'primary' : 'ghost'} onClick={() => setTab('challenge')}>Challenge</Button>
      </div>

      {render()}
    </div>
  );
}

function TypesTab() {
  const [ip, setIp] = useState('fe80::1');
  const type = isValidIPv6(ip) ? getIPv6Type(ip) : 'unknown';
  const expanded = isValidIPv6(ip) ? expandIPv6(ip) : null;

  return (
    <Card>
      <h3 className="mb-3 font-semibold">Address Type Detector</h3>
      <input
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        placeholder="Enter an IPv6 address"
        className="mb-3 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900"
      />
      {isValidIPv6(ip) ? (
        <div className="space-y-2">
          <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">Type:</span> <Badge status="up">{TYPE_LABELS[type]}</Badge></p>
          {expanded && <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{expanded}</p>}
        </div>
      ) : (
        <p className="text-sm text-rose-600 dark:text-rose-400">Invalid IPv6 address.</p>
      )}

      <div className="mt-4 rounded border border-slate-200 p-3 dark:border-net-700">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Type Reference</p>
        <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <li key={k} className="flex justify-between"><span>{k}</span><span className="text-slate-500 dark:text-slate-400">{v}</span></li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function CompressTab() {
  const [ip, setIp] = useState('2001:0db8:0000:0000:0000:ff00:0042:8329');
  const expanded = expandIPv6(ip);
  const compressed = isValidIPv6(ip) ? compressIPv6(ip) : null;

  return (
    <Card>
      <h3 className="mb-3 font-semibold">Compress / Expand</h3>
      <input
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        placeholder="Enter an IPv6 address"
        className="mb-3 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900"
      />
      {isValidIPv6(ip) ? (
        <div className="space-y-2">
          <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">Expanded:</span> <span className="font-mono">{expanded}</span></p>
          <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">Compressed:</span> <span className="font-mono">{compressed}</span></p>
        </div>
      ) : (
        <p className="text-sm text-rose-600 dark:text-rose-400">Invalid IPv6 address.</p>
      )}
    </Card>
  );
}

function Eui64Tab() {
  const [mac, setMac] = useState('00:1A:2B:3C:4D:5E');
  const [prefix, setPrefix] = useState('2001:db8::/64');
  const eui = macToEUI64(mac);
  const link = generateLinkLocal(mac);
  const slaac = generateSLAAC(prefix, mac);

  return (
    <Card>
      <h3 className="mb-3 font-semibold">EUI-64 Identifier</h3>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">MAC Address</label>
          <input value={mac} onChange={(e) => setMac(e.target.value)} className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400">Global Prefix (for SLAAC)</label>
          <input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900" />
        </div>
      </div>
      {eui ? (
        <div className="space-y-2">
          <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">EUI-64:</span> <span className="font-mono">{eui}</span></p>
          {link && <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">Link-local:</span> <span className="font-mono">{link}</span></p>}
          {slaac ? <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">SLAAC address:</span> <span className="font-mono">{slaac}</span></p> : <p className="text-sm text-rose-600 dark:text-rose-400">Invalid prefix format for SLAAC.</p>}
        </div>
      ) : (
        <p className="text-sm text-rose-600 dark:text-rose-400">Enter a valid MAC address (e.g. 00:1A:2B:3C:4D:5E).</p>
      )}
    </Card>
  );
}

function DrillsTab() {
  const recordQuizScore = useProgress((s) => s.recordQuizScore);
  const [question, setQuestion] = useState<{ prompt: string; answer: string; type: 'compress' | 'type' | 'eui64'; explanation: string } | null>(null);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);
  const [startTime] = useState(Date.now());

  const generate = () => {
    const qType: ('compress' | 'type' | 'eui64')[] = ['compress', 'type', 'eui64'];
    const t = qType[Math.floor(Math.random() * qType.length)];

    if (t === 'compress') {
      const groups = Array.from({ length: 8 }, () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'));
      const expanded = groups.join(':');
      const answer = compressIPv6(expanded)?.toLowerCase() ?? expanded.toLowerCase();
      setQuestion({
        prompt: `Compress: ${expanded}`,
        answer,
        type: t,
        explanation: `The shortest valid compression is ${answer}.`,
      });
    } else if (t === 'type') {
      const { ip, type } = randomIPv6ByType();
      setQuestion({
        prompt: `What is the address type of ${ip}?`,
        answer: type,
        type: t,
        explanation: `${ip} is a ${TYPE_LABELS[type as IPv6Type]}.`,
      });
    } else {
      const mac = randomMac();
      const answer = macToEUI64(mac)!.toLowerCase();
      setQuestion({
        prompt: `What is the EUI-64 identifier for MAC ${mac}?`,
        answer,
        type: t,
        explanation: `Flip the 7th bit of the first octet and insert ff:fe: ${answer}.`,
      });
    }
    setInput('');
    setFeedback(null);
  };

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
      recordQuizScore('IPv6', Math.round((nextCorrect / nextAttempts) * 100));
      setTimeout(() => generate(), 1200);
    } else {
      setFeedback({ type: 'wrong', text: `The correct answer was ${question.answer}. ${question.explanation}` });
      recordQuizScore('IPv6', Math.round((correct / nextAttempts) * 100));
    }
  };

  const elapsed = Math.floor((Date.now() - startTime) / 1000);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">IPv6 Drills</h3>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Score: {correct}/{attempts} · Time: {elapsed}s
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
            <Button variant="secondary" onClick={generate}>Skip</Button>
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
  const [addresses] = useState<[string, IPv6Type][]>(() => [
    ['2001:db8::1', 'global-unicast'],
    ['fe80::1', 'link-local'],
    ['ff02::1', 'multicast'],
    ['fd00::1', 'unique-local'],
    ['::1', 'loopback'],
  ]);
  const [answers, setAnswers] = useState<Record<number, IPv6Type | ''>>({});
  const [result, setResult] = useState<string | null>(null);

  const handleChange = (i: number, v: string) => {
    setAnswers((a) => ({ ...a, [i]: v as IPv6Type }));
  };

  const validate = () => {
    let right = 0;
    for (let i = 0; i < addresses.length; i++) {
      if (answers[i] === addresses[i][1]) right++;
    }
    if (right === addresses.length) setResult('All addresses classified correctly!');
    else setResult(`${right} of ${addresses.length} correct. Try again.`);
  };

  return (
    <Card>
      <h3 className="mb-3 font-semibold">Address Type Challenge</h3>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Select the correct IPv6 address type for each address.</p>
      <div className="space-y-2">
        {addresses.map(([ip], i) => (
          <div key={ip} className="flex flex-wrap items-center gap-3 rounded border border-slate-200 p-2 dark:border-net-700">
            <span className="font-mono text-sm">{ip}</span>
            <select
              value={answers[i] ?? ''}
              onChange={(e) => handleChange(i, e.target.value)}
              className="rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-net-700 dark:bg-net-900"
            >
              <option value="">Select type</option>
              {Object.keys(TYPE_LABELS).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Button onClick={validate}>Check Answers</Button>
        {result && <p className="mt-3 text-sm text-cisco-600 dark:text-cisco-400">{result}</p>}
      </div>
    </Card>
  );
}

function randomMac(): string {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return Array.from({ length: 6 }, hex).join(':');
}

function randomIPv6ByType(): { ip: string; type: IPv6Type } {
  const types: IPv6Type[] = ['global-unicast', 'link-local', 'unique-local', 'multicast', 'loopback'];
  const type = types[Math.floor(Math.random() * types.length)];
  const suffix = Array.from({ length: 4 }, () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')).join(':');
  const prefixMap: Record<string, string> = {
    'global-unicast': '2001:db8',
    'link-local': 'fe80',
    'unique-local': 'fd00',
    'multicast': 'ff02',
    'loopback': '0000:0000:0000:0000:0000:0000:0000',
  };
  const ip = type === 'loopback' ? '::1' : `${prefixMap[type]}:${suffix}`;
  return { ip, type };
}

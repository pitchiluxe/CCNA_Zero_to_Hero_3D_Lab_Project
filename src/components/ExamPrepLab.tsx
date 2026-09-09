import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface Question {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    q: 'What is the default administrative distance of OSPF?',
    options: ['90', '100', '110', '120'],
    answer: 2,
    explanation: 'OSPF has an AD of 110. EIGRP internal is 90.',
  },
  {
    q: 'Which layer of the OSI model does a router primarily operate at?',
    options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'],
    answer: 2,
    explanation: 'Routers make forwarding decisions based on Layer 3 IP addresses.',
  },
  {
    q: 'What is the purpose of a subnet mask?',
    options: ['Identify the host', 'Identify the network portion of an IP', 'Encrypt traffic', 'Assign MAC'],
    answer: 1,
    explanation: 'The subnet mask separates the network portion from the host portion.',
  },
];

export function ExamPrepLab() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [score, setScore] = useState(0);

  const question = QUESTIONS[index];

  const submit = () => {
    if (selected === null) return;
    setReveal(true);
    if (selected === question.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setIndex((i) => (i + 1) % QUESTIONS.length);
    setSelected(null);
    setReveal(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">CCNA Exam Prep</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Quick-fire review questions with explanations.
        </p>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <Badge status="neutral">Score: {score} / {QUESTIONS.length}</Badge>
          <span className="text-sm text-slate-500">Question {index + 1} of {QUESTIONS.length}</span>
        </div>
        <p className="mb-3 font-medium">{question.q}</p>
        <div className="space-y-2">
          {question.options.map((o, i) => (
            <label key={i} className={`flex cursor-pointer items-center gap-2 rounded border p-2 text-sm ${selected === i ? 'border-cisco-600 bg-cisco-50 dark:bg-net-900' : 'border-slate-200 dark:border-net-700'}`}>
              <input type="radio" name="q" checked={selected === i} onChange={() => setSelected(i)} className="h-4 w-4" />
              <span>{o}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {!reveal ? (
            <Button onClick={submit} disabled={selected === null}>Submit</Button>
          ) : (
            <Button onClick={next} variant="secondary">Next</Button>
          )}
        </div>
        {reveal && (
          <p className={`mt-3 text-sm ${selected === question.answer ? 'text-emerald-600' : 'text-rose-600'}`}>
            {selected === question.answer ? 'Correct.' : 'Incorrect.'} {question.explanation}
          </p>
        )}
      </Card>
    </div>
  );
}

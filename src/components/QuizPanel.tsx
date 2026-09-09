import { useState } from 'react';
import { quizQuestions } from '../data/quiz';
import { useProgress } from '../stores/progress';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function QuizPanel() {
  const recordQuizScore = useProgress((s) => s.recordQuizScore);
  const quizScores = useProgress((s) => s.quizScores);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const correct = quizQuestions.filter((q) => answers[q.id] === q.answerIndex).length;
  const total = quizQuestions.length;

  const handleSubmit = () => {
    setSubmitted(true);
    const score = Math.round((correct / total) * 100);
    recordQuizScore('Foundations', score);
  };

  const average = Object.values(quizScores).reduce((a, b) => a + b, 0) / (Object.keys(quizScores).length || 1);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quiz Engine Foundation</h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">Best: {Math.round(average)}%</span>
      </div>

      <div className="space-y-5">
        {quizQuestions.map((q) => (
          <div key={q.id}>
            <p className="mb-2 text-sm font-medium">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === i;
                const isCorrect = i === q.answerIndex;
                let ring = 'border-slate-200 dark:border-net-700';
                if (submitted) {
                  if (isCorrect) ring = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
                  else if (selected) ring = 'border-rose-500 bg-rose-50 dark:bg-rose-900/20';
                } else if (selected) {
                  ring = 'border-cisco-500 bg-cisco-50 dark:bg-cisco-900/20';
                }

                return (
                  <button
                    key={i}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-net-700 ${ring}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{q.explanation}</p>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <Button onClick={handleSubmit} className="mt-6 w-full" disabled={Object.keys(answers).length !== total}>
          Submit
        </Button>
      ) : (
        <div className="mt-6 text-center text-sm">
          <p className="mb-1 font-semibold">Score: {correct}/{total}</p>
          <Button size="sm" variant="secondary" onClick={() => { setSubmitted(false); setAnswers({}); }}>
            Try again
          </Button>
        </div>
      )}
    </Card>
  );
}

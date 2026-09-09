import { Link } from 'react-router-dom';
import { CheckCircle, Circle, Star, Bookmark, Play, Trophy, TrendingUp } from 'lucide-react';
import { phases } from '../../data/phases';
import { labList } from '../../data/labs';
import { useProgress } from '../../stores/progress';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { QuizPanel } from '../QuizPanel';

function matchesSearch(text: string, q: string) {
  return text.toLowerCase().includes(q.toLowerCase());
}

export function Dashboard() {
  const search = useProgress((s) => s.search);
  const completed = useProgress((s) => s.completedLabIds);
  const bookmarks = useProgress((s) => s.bookmarks);
  const quizScores = useProgress((s) => s.quizScores);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);

  const quizAvg =
    Object.keys(quizScores).length === 0
      ? 0
      : Object.values(quizScores).reduce((a, b) => a + b, 0) / Object.keys(quizScores).length;
  const completedCount = completed.length;
  const totalLabs = labList.length;
  const progress = totalLabs ? Math.round((completedCount / totalLabs) * 100) : 0;
  const mastery = Math.round((progress + quizAvg) / 2);

  const query = search.trim().toLowerCase();

  const filteredPhases = phases.filter((p) => {
    if (!query) return true;
    if (matchesSearch(p.title, query) || matchesSearch(p.summary, query)) return true;
    return p.labs.some((lid) => {
      const lab = labList.find((l) => l.id === lid);
      return lab && (matchesSearch(lab.title, query) || matchesSearch(lab.summary, query));
    });
  });

  const filteredLabs = labList.filter(
    (l) =>
      !query ||
      matchesSearch(l.title, query) ||
      matchesSearch(l.summary, query) ||
      matchesSearch(phases.find((p) => p.id === l.phaseId)?.title ?? '', query)
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cisco-100 p-2 text-cisco-700 dark:bg-cisco-900/30 dark:text-cisco-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Course progress</p>
              <p className="text-2xl font-bold">{progress}%</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Labs completed</p>
              <p className="text-2xl font-bold">{completedCount}/{totalLabs}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quiz mastery</p>
              <p className="text-2xl font-bold">{Math.round(quizAvg)}%</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-100 p-2 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Overall mastery</p>
              <p className="text-2xl font-bold">{mastery}%</p>
            </div>
          </div>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Lab Library</h2>
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {filteredLabs.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No labs match your search.</p>
              )}
              {filteredLabs.map((lab) => {
                const isDone = completed.includes(lab.id);
                const isBookmarked = bookmarks.includes(lab.id);

                return (
                  <div
                    key={lab.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-net-700"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold">{lab.title}</h4>
                        {isDone && <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{lab.summary}</p>
                    </div>
                    <div className="flex flex-shrink-0 flex-col gap-2">
                      <Link to={`/lab/${lab.id}`}>
                        <Button size="sm" variant="primary" className="px-2">
                          <Play className="h-4 w-4" />
                        </Button>
                      </Link>
                      <button
                        onClick={() => toggleBookmark(lab.id)}
                        aria-label="Toggle bookmark"
                        className={`rounded p-1.5 ${isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                      >
                        {isBookmarked ? <Bookmark className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <QuizPanel />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-4 text-xl font-bold">Course Roadmap</h2>
            <div className="space-y-4">
              {filteredPhases.map((phase) => {
                const phaseLabs = phase.labs
                  .map((id) => labList.find((l) => l.id === id))
                  .filter((l): l is typeof labList[number] => l !== undefined);
                const done = phaseLabs.filter((l) => completed.includes(l.id)).length;
                const isCompleted = phaseLabs.length > 0 && done === phaseLabs.length;

                const firstLab = phaseLabs[0];
                const link = firstLab ? `/lab/${firstLab.id}` : '#';

                return (
                  <Link
                    key={phase.id}
                    to={link}
                    className="block rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-net-700 dark:hover:bg-net-700/50"
                    onClick={(e) => !firstLab && e.preventDefault()}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold dark:bg-net-700">
                          {phase.number}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{phase.title}</h3>
                            {isCompleted ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-400" />}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{phase.summary}</p>
                        </div>
                      </div>
                      <Badge status={isCompleted ? 'up' : 'neutral'}>
                        {done}/{phaseLabs.length} labs
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { X, Network, MonitorPlay, BookOpen } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-net-700 dark:bg-net-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome to your CCNA 3D lab</h2>
            <p className="text-slate-500 dark:text-slate-400">Learn networking by exploring, configuring, and troubleshooting in 3D.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-slate-100 dark:hover:bg-net-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="mb-6 space-y-4">
          <li className="flex gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 text-cisco-600 dark:text-cisco-500" />
            <span className="text-sm">Follow the phase roadmap from beginner fundamentals to the enterprise capstone.</span>
          </li>
          <li className="flex gap-3">
            <MonitorPlay className="mt-0.5 h-5 w-5 text-cisco-600 dark:text-cisco-500" />
            <span className="text-sm">Enter labs to inspect devices, ports, cables, and status in a 3D network room.</span>
          </li>
          <li className="flex gap-3">
            <Network className="mt-0.5 h-5 w-5 text-cisco-600 dark:text-cisco-500" />
            <span className="text-sm">Track your progress, take quizzes, and build a portfolio-ready lab report.</span>
          </li>
        </ul>

        <Button onClick={onClose} className="w-full">
          Start learning
        </Button>
      </div>
    </div>
  );
}

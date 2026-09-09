import { Link } from 'react-router-dom';
import { Moon, Sun, Search, GraduationCap } from 'lucide-react';
import { useProgress } from '../../stores/progress';

export function Header() {
  const { theme, toggleTheme, search, setSearch, getProgress } = useProgress();
  const progress = getProgress();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-net-700 dark:bg-net-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-cisco-600 dark:text-cisco-500">
          <GraduationCap className="h-6 w-6" />
          <span className="hidden sm:inline">CCNA 3D Lab</span>
        </Link>

        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phases or labs..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-cisco-600 dark:border-net-700 dark:bg-net-800"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-xs text-slate-500 dark:text-slate-400">Course progress</p>
            <p className="text-sm font-semibold">{progress}%</p>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-net-800"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}

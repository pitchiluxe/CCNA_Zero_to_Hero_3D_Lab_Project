import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'App', to: '/app' },
  { label: 'Contact', to: '/contact' },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-cisco-400">
          <GraduationCap className="h-6 w-6" />
          <span>CCNA 3D Lab</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-cisco-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className="rounded p-2 text-slate-300 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-slate-950 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-base font-medium text-slate-300"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </motion.header>
  );
}

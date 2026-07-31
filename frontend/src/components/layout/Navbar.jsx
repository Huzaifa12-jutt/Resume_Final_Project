import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import LensMark from '../common/LensMark';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20 group-hover:shadow-lg transition-all">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">TalentLense</span>
            <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
              ATS Pro
            </span>
          </div>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-4">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

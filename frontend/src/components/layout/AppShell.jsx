import { Link, NavLink } from 'react-router-dom';
import { HiOutlineBriefcase, HiOutlineSparkles } from 'react-icons/hi2';

export default function AppShell({ children }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-950"><span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white"><HiOutlineSparkles /></span>TEEROP</Link>
        <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
          <NavLink to="/jobs" className={({ isActive }) => `rounded-lg px-3 py-2 transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'}`}><HiOutlineBriefcase className="mr-1 inline" />Jobs</NavLink>
          <Link to="/jobs/new" className="rounded-lg bg-indigo-600 px-3 py-2 text-white transition hover:bg-indigo-700">New role</Link>
        </div>
      </nav>
    </header>
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">{children}</main>
  </div>;
}

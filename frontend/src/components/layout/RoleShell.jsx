import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BriefcaseBusiness, Building2, LayoutDashboard, LogOut, MessageSquareText, Search, Settings, Sparkles, Users, Mic } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleShell({ title, subtitle, children, role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = role === 'recruiter'
    ? [
      { to: '/recruiter', label: 'Overview', icon: LayoutDashboard },
      { to: '/recruiter/jobs', label: 'Jobs', icon: BriefcaseBusiness },
      { to: '/recruiter/candidates', label: 'Candidates', icon: Users },
      { to: '/recruiter/analytics', label: 'Analytics', icon: Search },
      { to: '/recruiter/company', label: 'Company', icon: Building2 },
      { to: '/recruiter/settings', label: 'Settings', icon: Settings },
    ]
    : [
      { to: '/candidate', label: 'Overview', icon: LayoutDashboard },
      { to: '/candidate/jobs', label: 'Browse Jobs', icon: BriefcaseBusiness },
      { to: '/candidate/saved', label: 'Saved Jobs', icon: Sparkles },
      { to: '/candidate/applications', label: 'Applications', icon: MessageSquareText },
      { to: '/candidate/interview', label: 'Interview', icon: Mic },
      { to: '/candidate/profile', label: 'Profile', icon: Users },
      { to: '/candidate/settings', label: 'Settings', icon: Settings },
    ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dce8ff,_#eff6ff_35%,_#f8fbff)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to={role === 'recruiter' ? '/recruiter' : '/candidate'} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200/50">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-indigo-600 uppercase">TalentLense</p>
              <p className="text-base font-semibold text-slate-950">{role === 'recruiter' ? 'Recruiter Workspace' : 'Candidate Hub'}</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 sm:block">
              {user?.full_name || user?.name || 'Signed in'}
            </div>
            <button onClick={handleLogout} className="rounded-full border border-indigo-200 bg-white p-2 text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-900">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
        <aside className="w-full lg:sticky lg:top-24 lg:w-72 lg:self-start">
          <nav className="rounded-3xl border border-slate-200/80 bg-white/95 p-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/recruiter' || to === '/candidate'}
                className={({ isActive }) => `mb-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-indigo-50 hover:text-slate-950'}`}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
          <div className="mb-6 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">{title}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{subtitle}</h1>
          </div>
          {children}
        </motion.main>
      </div>
    </div>
  );
}
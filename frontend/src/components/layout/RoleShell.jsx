import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Search,
  Settings,
  Bookmark,
  Users,
  Mic,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TeeropLogo from '../common/TeeropLogo';

export default function RoleShell({ title, subtitle, children, role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = role === 'recruiter'
    ? [
      { to: '/recruiter', label: 'Overview', icon: LayoutDashboard },
      { to: '/recruiter/jobs', label: 'Jobs', icon: BriefcaseBusiness },
      { to: '/recruiter/candidates', label: 'Candidates', icon: Users },
      { to: '/recruiter/messages', label: 'Messages', icon: MessageSquareText },
      { to: '/recruiter/analytics', label: 'Analytics', icon: Search },
      { to: '/recruiter/company', label: 'Company', icon: Building2 },
      { to: '/recruiter/settings', label: 'Settings', icon: Settings },
    ]
    : [
      { to: '/candidate', label: 'Overview', icon: LayoutDashboard },
      { to: '/candidate/jobs', label: 'Browse Jobs', icon: BriefcaseBusiness },
      { to: '/candidate/saved', label: 'Saved Jobs', icon: Bookmark },
      { to: '/candidate/applications', label: 'Applications', icon: BriefcaseBusiness },
      { to: '/candidate/messages', label: 'Messages', icon: MessageSquareText },
      { to: '/candidate/interview', label: 'Interview', icon: Mic },
      { to: '/candidate/profile', label: 'Profile', icon: Users },
      { to: '/candidate/settings', label: 'Settings', icon: Settings },
    ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadge = role === 'recruiter' ? 'Recruiter Hub' : 'Candidate Portal';

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={role === 'recruiter' ? '/recruiter' : '/candidate'} className="flex items-center">
            <TeeropLogo size="md" badge={roleBadge} />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 sm:block">
              {user?.full_name || user?.name || user?.email || 'Signed in'}
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 shadow-xs"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8 w-full">
        <aside className="w-full shrink-0 lg:sticky lg:top-22 lg:w-64 lg:self-start">
          <nav className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xs">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/recruiter' || to === '/candidate'}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex-1 min-w-0">
          {(title || subtitle) && (
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
              {title && <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{title}</p>}
              {subtitle && <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{subtitle}</h1>}
            </div>
          )}
          {children}
        </motion.main>
      </div>
    </div>
  );
}
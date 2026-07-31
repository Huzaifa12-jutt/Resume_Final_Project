import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  Users,
  Award,
  Target,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const APPS_DATA = [
  { day: 'Mon', v: 42 },
  { day: 'Tue', v: 58 },
  { day: 'Wed', v: 49 },
  { day: 'Thu', v: 72 },
  { day: 'Fri', v: 64 },
  { day: 'Sat', v: 38 },
  { day: 'Sun', v: 54 },
];

const FUNNEL = [
  { label: 'Applied',     value: 2480, pct: 100, color: '#2b7fff' },
  { label: 'Screened',    value: 1240, pct: 50,  color: '#3b82f6' },
  { label: 'Shortlisted', value: 342,  pct: 14,  color: '#60a5fa' },
  { label: 'Interviewed', value: 128,  pct: 5,   color: '#93c5fd' },
  { label: 'Hired',       value: 24,   pct: 1,   color: '#bfdbfe' },
];

const RECENT_NOTIFS = [
  { text: 'Analytics dashboard initialized', time: 'Just now', icon: Sparkles, color: '#2b7fff' }
];

function AreaChart({ data, height = 160 }) {
  const max = Math.max(...data.map((d) => d.v));
  const W = 320;
  const H = height;
  const PAD = 18;
  const xs = data.map((_, index) => PAD + (index / (data.length - 1)) * (W - PAD * 2));
  const ys = data.map((d) => H - PAD - ((d.v / max) * (H - PAD * 2)));
  const linePath = xs.map((x, index) => `${index === 0 ? 'M' : 'L'} ${x},${ys[index]}`).join(' ');
  const areaPath = `${linePath} L ${xs[xs.length - 1]},${H - PAD} L ${xs[0]},${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b7fff" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#2b7fff" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#dashboardArea)" />
      <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, index) => (
        <circle key={index} cx={x} cy={ys[index]} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2" />
      ))}
    </svg>
  );
}

export default function RecruiterOverviewPage() {
  useDocumentTitle('Recruiter Dashboard');
  const [stats, setStats] = useState({ 
    total_jobs: 0, 
    total_applications: 0, 
    average_ai_score: 0,
    recent_jobs: [],
    recent_candidates: [],
    applications_by_status: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    atsService
      .getAnalytics()
      .then((data) => {
        setStats({
          total_jobs: data.total_jobs ?? 0,
          total_applications: data.total_applications ?? 0,
          average_ai_score: data.average_ai_score ?? 0,
          recent_jobs: data.recent_jobs ?? [],
          recent_candidates: data.recent_candidates ?? [],
          applications_by_status: data.applications_by_status ?? {}
        });
      })
      .catch(() => {
        setStats({ total_jobs: 0, total_applications: 0, average_ai_score: 0, recent_jobs: [], recent_candidates: [], applications_by_status: {} });
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Total jobs',
      value: loading ? '…' : stats.total_jobs,
      sub: 'Open roles in your pipeline',
      icon: Briefcase,
      trend: '+4%',
      up: true,
    },
    {
      label: 'Total candidates',
      value: loading ? '…' : stats.total_applications,
      sub: 'Applications received this month',
      icon: Users,
      trend: '+18%',
      up: true,
    },
    {
      label: 'Ranked candidates',
      value: 342,
      sub: 'AI shortlisted profiles',
      icon: Award,
      trend: '+9%',
      up: true,
    },
    {
      label: 'Avg match score',
      value: loading ? '…' : `${stats.average_ai_score}%`,
      sub: 'Average AI score for active roles',
      icon: Target,
      trend: '+2%',
      up: true,
    },
  ];

  return (
    <RoleShell
      title="Recruiter dashboard"
      subtitle="Monitor hiring performance, open roles, and candidate activity from one central workspace."
      role="recruiter"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Overview</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Recruiter command center</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              See job metrics, candidate trends, and pipeline activity in a consistent recruiter experience.
            </p>
          </div>
          <Link to="/recruiter/jobs">
            <Button variant="primary" size="md" icon={Sparkles}>
              New job post
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, sub, icon: Icon, trend, up }) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600">
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                <span>{sub}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Applications</h3>
                <p className="text-sm text-slate-500">Weekly volume across open roles.</p>
              </div>
              <Badge variant="indigo" size="md">
                <BarChart3 size={14} className="mr-1.5" /> Trend overview
              </Badge>
            </div>
            <div className="mt-6 overflow-hidden rounded-3xl bg-slate-50 p-5">
              <AreaChart data={APPS_DATA} />
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.2em] text-slate-500">
              {APPS_DATA.map((item) => (
                <span key={item.day}>{item.day}</span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Hiring funnel</h3>
                <p className="text-sm text-slate-500">Pipeline stage conversion rates.</p>
              </div>
              <TrendingUp size={20} className="text-slate-400" />
            </div>
            <div className="mt-6 space-y-4">
              {FUNNEL.map((item) => {
                const count = stats.applications_by_status[item.label] || 0;
                const total = stats.total_applications || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-950">{count.toLocaleString()}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Recent jobs</h3>
                <p className="text-sm text-slate-500">Manage your most active positions.</p>
              </div>
              <Link to="/recruiter/jobs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {stats.recent_jobs.length === 0 ? (
                <div className="text-sm text-slate-500 py-4 text-center">No active jobs yet.</div>
              ) : stats.recent_jobs.map((job) => (
                <div key={job.id} className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{job.title}</p>
                    <p className="text-xs text-slate-500">Engineering</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${job.status === 'active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                      {job.status === 'active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Top candidates</h3>
                  <p className="text-sm text-slate-500">Profiles trending in your pipeline.</p>
                </div>
                <Users size={20} className="text-slate-400" />
              </div>
              <div className="mt-6 space-y-4">
                {stats.recent_candidates.length === 0 ? (
                  <div className="text-sm text-slate-500 py-4 text-center">No ranked candidates yet.</div>
                ) : stats.recent_candidates.map((candidate, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${candidate.color}22`, color: candidate.color }}>
                        {candidate.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{candidate.name}</p>
                        <p className="text-xs text-slate-500">{candidate.role}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm font-semibold text-slate-950">{candidate.score}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Notifications</h3>
                  <p className="text-sm text-slate-500">Latest hiring alerts.</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">4 new</span>
              </div>
              <div className="mt-6 space-y-3">
                {RECENT_NOTIFS.map((note) => (
                  <div key={note.text} className="flex items-start gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: `${note.color}22`, color: note.color }}>
                      <note.icon size={16} />
                    </div>
                    <div className="flex-1 text-sm text-slate-700">
                      <p className="font-medium text-slate-950">{note.text}</p>
                      <p className="mt-1 text-xs text-slate-500">{note.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}

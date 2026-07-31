import { useEffect, useState } from 'react';
import { BarChart3, CircleDashed, TrendingUp } from 'lucide-react';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const statCards = [
  { label: 'Jobs', key: 'total_jobs', icon: BarChart3, color: 'from-indigo-500 to-blue-600' },
  { label: 'Applications', key: 'total_applications', icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
  { label: 'Avg AI Score', key: 'average_ai_score', icon: CircleDashed, color: 'from-amber-500 to-orange-600' },
];

export default function RecruiterAnalyticsPage() {
  useDocumentTitle('Analytics');
  const [analytics, setAnalytics] = useState({ total_jobs: 0, total_applications: 0, applications_by_status: {}, average_ai_score: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        setAnalytics(await atsService.getAnalytics());
      } catch {
        setAnalytics({ total_jobs: 0, total_applications: 0, applications_by_status: {}, average_ai_score: 0 });
      }
    };
    load();
  }, []);

  const statusEntries = Object.entries(analytics.applications_by_status || {});

  return (
    <RoleShell title="Analytics" subtitle="Monitor hiring funnel metrics and candidate score trends." role="recruiter">
      <div className="grid gap-5 lg:grid-cols-3">
        {statCards.map(({ label, key, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-premium hover:shadow-premium-lg transition-shadow">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}>
              <Icon size={20} />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1.5 text-3xl font-bold text-slate-900">{key === 'average_ai_score' ? analytics[key] : analytics[key]}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-premium">
        <h3 className="eyebrow">Status Breakdown</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {statusEntries.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No applications yet.
            </div>
          ) : statusEntries.map(([status, count]) => (
            <div key={status} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{status}</p>
              <p className="mt-2 text-2xl font-bold text-indigo-600">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </RoleShell>
  );
}

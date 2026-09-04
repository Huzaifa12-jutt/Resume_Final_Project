import { useEffect, useState, useCallback } from 'react';
import { BookmarkX, Briefcase, MapPin, Clock, DollarSign, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import StatusBadge from '../../components/common/StatusBadge';

export default function CandidateSavedJobsPage() {
  useDocumentTitle('Saved Jobs');
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = useCallback(async () => {
    setLoading(true);
    try {
      const data = await atsService.listSavedJobs();
      setSavedItems(Array.isArray(data) ? data : []);
    } catch {
      setSavedItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleUnsave = async (jobId) => {
    try {
      await atsService.unsaveJob(jobId);
      toast.success('Job removed from saved');
      await loadSaved();
    } catch (error) {
      toast.error(error.message || 'Unable to unsave job');
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (v) => v ? `$${Number(v).toLocaleString()}` : '';
    return `${fmt(min)}${min && max ? ' - ' : ''}${fmt(max)}`;
  };

  return (
    <RoleShell title="Saved Jobs" subtitle="Your curated shortlist of roles that match your career goals." role="candidate">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-3" />
            Loading saved jobs...
          </div>
        ) : savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
              <BookmarkX size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No saved jobs yet</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              Browse open positions and click the bookmark icon to save roles you're interested in for later.
            </p>
            <a
              href="/candidate/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Browse Jobs <ExternalLink size={16} />
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {savedItems.map((item) => {
              const job = item.job || item;
              const salary = formatSalary(job.salary_min, job.salary_max);
              return (
                <div
                  key={item.id || item.job_id}
                  className="rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900">{job.title || 'Untitled Role'}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} /> {job.location}
                          </span>
                        )}
                        {job.employment_type && (
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} /> {job.employment_type}
                          </span>
                        )}
                        {salary && (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <DollarSign size={12} /> {salary}
                          </span>
                        )}
                        <StatusBadge status={job.status || 'Active'} />
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnsave(item.job_id)}
                      className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                    >
                      Remove
                    </button>
                  </div>
                  {job.description && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Saved on {new Date(item.created_at || Date.now()).toLocaleDateString()}
                    </span>
                    <a
                      href={`/candidate/jobs`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                    >
                      View details <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RoleShell>
  );
}

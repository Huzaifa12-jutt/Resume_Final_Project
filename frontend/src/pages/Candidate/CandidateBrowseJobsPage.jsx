import { useEffect, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function CandidateBrowseJobsPage() {
  useDocumentTitle('Browse Jobs');
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [applyingJobId, setApplyingJobId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await atsService.searchJobs({ keyword: '' });
        setJobs(rows);
      } catch {
        setJobs([]);
      }
    };
    load();
  }, []);

  const filtered = jobs.filter((job) => `${job.title} ${job.description}`.toLowerCase().includes(query.toLowerCase()));

  const apply = async (jobId) => {
    setApplyingJobId(jobId);
    try {
      await atsService.applyToJob(jobId, { cover_letter: '' });
      toast.success('Application submitted.');
    } catch (error) {
      toast.error(error.message || 'Unable to submit application');
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <RoleShell title="Browse jobs" subtitle="Discover open roles and apply with your uploaded resume profile." role="candidate">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Open roles</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Explore opportunities</h2>
          </div>
          <label className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-sm text-indigo-700">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs" className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400" />
          </label>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filtered.map((job) => (
            <div key={job.id} className="rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{job.location || 'Remote'}</p>
                </div>
                <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Active</div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{job.description}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                  <Sparkles size={14} className="text-indigo-600" /> AI match ready
                </div>
                <button onClick={() => apply(job.id)} disabled={applyingJobId === job.id} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
                  {applyingJobId === job.id ? 'Applying…' : 'Apply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleShell>
  );
}

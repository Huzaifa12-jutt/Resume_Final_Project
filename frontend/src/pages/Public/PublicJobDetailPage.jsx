import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, CheckCircle2, Clock3, DollarSign, MapPin, Sparkles, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { atsService } from '../../services/atsService';
import { useAuth } from '../../contexts/AuthContext';

const money = (value) => {
  if (value === null || value === undefined || value === '') return 'Competitive';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export default function PublicJobDetailPage() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await atsService.searchJobs({ keyword: '' });
        const match = rows.find((entry) => String(entry.id) === String(jobId));
        setJob(match || null);
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  const requirements = useMemo(() => job?.required_skills || ['Product thinking', 'Communication', 'Execution'], [job]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/jobs/${jobId}` } } });
      return;
    }

    if (user.role !== 'candidate') {
      toast.error('Please sign in with a candidate account to apply.');
      return;
    }

    try {
      await atsService.applyToJob(jobId, { cover_letter: '' });
      toast.success('Application submitted successfully.');
      navigate('/candidate/applications');
    } catch (error) {
      toast.error(error.message || 'Unable to submit application.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Loading role details...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-600">Role not found</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">This opportunity is no longer available.</h1>
        <p className="mt-3 text-slate-600">The role may have been closed or moved. Explore other openings from our public jobs board.</p>
        <Link to="/jobs" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200">
          <ArrowLeft size={16} /> Browse all jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            <ArrowLeft size={16} /> Back to jobs
          </Link>
          <div className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700">Hiring now</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-teal-100 text-indigo-700">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{job.company_name || 'TalentLense Hiring Team'}</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-950">{job.title}</h1>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5"><MapPin size={12} /> {job.location || 'Remote'}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5"><Clock3 size={12} /> {job.employment_type || 'Full-time'}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5"><DollarSign size={12} /> {money(job.salary_min)} - {money(job.salary_max)}</span>
            </div>

            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Role overview</p>
              <p className="mt-3 text-sm leading-8 text-slate-700">{job.description}</p>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">Key requirements</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {requirements.map((skill) => (
                  <span key={skill} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">{skill}</span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">What you'll do</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                {[
                  'Lead the execution of product or platform work across product and engineering teams.',
                  'Own outcomes from idea to delivery with clear communication and measurable impact.',
                  'Collaborate closely with design, engineering, and stakeholder teams to drive momentum.',
                  'Continuously improve quality, performance, and team velocity through feedback loops.'
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 shrink-0 text-emerald-500" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Apply now</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">Ready to move fast?</h2>

            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="flex items-center gap-2"><Users size={16} className="text-indigo-500" /> Role type</span>
                <span className="font-semibold text-slate-900">{job.employment_type || 'Full-time'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-indigo-500" /> Location</span>
                <span className="font-semibold text-slate-900">{job.location || 'Remote'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="flex items-center gap-2"><BriefcaseBusiness size={16} className="text-indigo-500" /> Openings</span>
                <span className="font-semibold text-slate-900">{job.openings || 1}</span>
              </div>
            </div>

            <button
              onClick={handleApply}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl"
            >
              {user && user.role === 'candidate' ? 'Apply with profile' : 'Continue to login'} <ArrowRight size={16} />
            </button>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-center gap-2 font-semibold"><Sparkles size={16} /> AI screening ready</div>
              <p className="mt-2 text-emerald-700">Your profile, resume, and experience are matched automatically once you apply.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

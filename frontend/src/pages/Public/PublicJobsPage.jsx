import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Building2, Clock3, DollarSign, MapPin, Search, Sparkles, Star, Users } from 'lucide-react';
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

export default function PublicJobsPage() {
  useDocumentTitle('Jobs');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await atsService.searchJobs({ keyword: '' });
        setJobs(Array.isArray(rows) ? rows : []);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredJobs = useMemo(() => {
    const search = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const haystack = `${job.title || ''} ${job.description || ''} ${job.location || ''} ${job.required_skills?.join(' ') || ''}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesLocation = !location || (job.location || 'Remote').toLowerCase().includes(location.toLowerCase());
      return matchesSearch && matchesLocation;
    });
  }, [jobs, location, query]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#f8fafc_35%,_#f8fafc)] text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white shadow-lg shadow-indigo-200/50">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">TalentLense</p>
              <p className="text-sm font-semibold text-slate-900">Public Jobs</p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/profiles" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">Profiles</Link>
            <Link to="/login" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Login</Link>
            <Link to="/register" className="rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200">Join now</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-2xl shadow-indigo-200/40 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-100">
                <BriefcaseBusiness size={12} /> Open roles
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">Find a role that fits your next chapter.</h1>
              <p className="mt-4 max-w-xl text-sm text-slate-200 sm:text-base">Explore modern opportunities, compare teams, and apply with a profile that is already ready for AI screening.</p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 sm:grid-cols-3 lg:min-w-[360px]">
              <div>
                <p className="text-indigo-200">Jobs live</p>
                <p className="mt-1 text-2xl font-bold text-white">{jobs.length}</p>
              </div>
              <div>
                <p className="text-indigo-200">Fast apply</p>
                <p className="mt-1 text-2xl font-bold text-white">24h</p>
              </div>
              <div>
                <p className="text-indigo-200">AI-ranked</p>
                <p className="mt-1 text-2xl font-bold text-white">1-click</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, skill, or role type"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <div className="relative lg:max-w-xs">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>
        </section>

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BriefcaseBusiness className="mx-auto text-slate-400" size={42} />
            <h2 className="mt-4 text-xl font-bold text-slate-900">No roles match your filters</h2>
            <p className="mt-2 text-sm text-slate-500">Try another search term or clear the location filter.</p>
          </div>
        ) : (
          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            {filteredJobs.map((job) => (
              <article key={job.id} className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_22px_60px_rgba(79,70,229,0.12)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-teal-100 text-indigo-700">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">{job.company_name || 'TalentLense Hiring Team'}</p>
                      <h2 className="text-xl font-bold text-slate-950">{job.title}</h2>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{job.status || 'Active'}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5"><MapPin size={12} /> {job.location || 'Remote'}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5"><Clock3 size={12} /> {job.employment_type || 'Full-time'}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5"><DollarSign size={12} /> {money(job.salary_min)} - {money(job.salary_max)}</span>
                </div>

                <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-600">{job.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(job.required_skills || ['Product','AI','Collaboration']).slice(0, 5).map((skill) => (
                    <span key={skill} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">{skill}</span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users size={16} className="text-indigo-500" />
                    {job.openings || 1} open role{(job.openings || 1) > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/jobs/${job.id}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">View details</Link>
                    <button
                      onClick={() => {
                        if (!user) {
                          navigate('/login', { state: { from: { pathname: `/jobs/${job.id}` } } });
                          return;
                        }
                        if (user.role !== 'candidate') {
                          toast.error('Please sign in as a candidate to apply to jobs.');
                          return;
                        }
                        navigate(`/jobs/${job.id}`);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl"
                    >
                      Apply now <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="mt-12 rounded-3xl border border-dashed border-indigo-200 bg-gradient-to-r from-indigo-50 to-teal-50 p-6 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-indigo-600">Why candidates love it</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">Application flow that feels premium and fast.</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <Star className="mx-auto text-amber-500" size={22} />
              <p className="mt-2 font-semibold text-slate-900">AI-matched roles</p>
              <p className="mt-1 text-sm text-slate-500">Your resume is screened against the job description in a single flow.</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <Sparkles className="mx-auto text-pink-500" size={22} />
              <p className="mt-2 font-semibold text-slate-900">Faster shortlist</p>
              <p className="mt-1 text-sm text-slate-500">Design-led experience keeps candidates engaged instead of confused.</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <Building2 className="mx-auto text-emerald-500" size={22} />
              <p className="mt-2 font-semibold text-slate-900">Transparent pipeline</p>
              <p className="mt-1 text-sm text-slate-500">A cleaner story from job view to application to interview and feedback.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

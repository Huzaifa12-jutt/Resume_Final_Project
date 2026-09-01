import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  DollarSign,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import useDocumentTitle from '../../hooks/useDocumentTitle';
import { atsService } from '../../services/atsService';

const money = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return null;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const formatSalary = (min, max) => {
  const minimum = money(min);
  const maximum = money(max);

  if (minimum && maximum) {
    return `${minimum} – ${maximum}`;
  }

  if (minimum) {
    return `From ${minimum}`;
  }

  if (maximum) {
    return `Up to ${maximum}`;
  }

  return 'Competitive';
};

const formatDate = (date) => {
  if (!date) return 'Recently posted';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Recently posted';
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function PublicJobsPage() {
  useDocumentTitle('Find Jobs');

  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      try {
        const rows = await atsService.searchJobs({
          keyword: '',
          status: 'active',
        });

        if (mounted) {
          setJobs(Array.isArray(rows) ? rows : []);
        }
      } catch (error) {
        console.error('Failed to load public jobs:', error);

        if (mounted) {
          setJobs([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const search = query.trim().toLowerCase();
    const locationSearch = location.trim().toLowerCase();

    return jobs.filter((job) => {
      const skills = Array.isArray(job.required_skills)
        ? job.required_skills.join(' ')
        : '';

      const searchableText = `
        ${job.title || ''}
        ${job.description || ''}
        ${job.location || ''}
        ${job.employment_type || ''}
        ${job.remote_type || ''}
        ${job.experience_required || ''}
        ${job.education_required || ''}
        ${skills}
      `.toLowerCase();

      const matchesSearch =
        !search || searchableText.includes(search);

      const jobLocation = (
        job.location ||
        job.remote_type ||
        'Remote'
      ).toLowerCase();

      const matchesLocation =
        !locationSearch || jobLocation.includes(locationSearch);

      return matchesSearch && matchesLocation;
    });
  }, [jobs, query, location]);

  const clearFilters = () => {
    setQuery('');
    setLocation('');
  };

  const hasFilters = query.trim() || location.trim();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =========================================================
          HEADER
      ========================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white shadow-lg shadow-indigo-200/50 transition duration-300 group-hover:scale-105">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">
                TalentLense
              </p>

              <p className="text-sm font-semibold text-slate-900">
                Career opportunities
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              to="/jobs"
              className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
            >
              Jobs
            </Link>

            <Link
              to="/login"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Create account
            </Link>
          </nav>

          {/* Mobile login */}
          <Link
            to="/login"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 md:hidden"
          >
            Login
          </Link>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================== */}
      <main>
        {/* =======================================================
            HERO
        ======================================================== */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div className="max-w-3xl">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
                  <BriefcaseBusiness size={13} />
                  Explore open positions
                </div>

                {/* Heading */}
                <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Find work that
                  <span className="block bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    fits your future.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Discover open roles from companies looking for talented
                  people. Explore the opportunity first, then apply when
                  you are ready.
                </p>

                {/* Quick stats */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
                    <BriefcaseBusiness
                      size={15}
                      className="text-indigo-600"
                    />
                    <span>
                      <strong className="text-slate-900">
                        {jobs.length}
                      </strong>{' '}
                      active jobs
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
                    <Sparkles
                      size={15}
                      className="text-teal-600"
                    />
                    AI-powered screening
                  </div>
                </div>
              </div>

              {/* Hero side card */}
              <div className="hidden w-72 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.10)] lg:block">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-indigo-100 text-indigo-700">
                  <Sparkles size={22} />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-950">
                  Smarter applications
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Build your candidate profile once and use it across the
                  opportunities you are interested in.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500"
                    />
                    Resume-based screening
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500"
                    />
                    Candidate profile
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500"
                    />
                    Application tracking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SEARCH
        ======================================================== */}
        <section className="relative z-10 mx-auto -mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="grid gap-3 md:grid-cols-[1fr_0.55fr_auto]">
              {/* Search */}
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by job title, skill, or keyword"
                  className="h-12 w-full rounded-2xl border border-transparent bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* Location */}
              <div className="relative">
                <MapPin
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="h-12 w-full rounded-2xl border border-transparent bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* Clear */}
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <X size={16} />
                  Clear
                </button>
              ) : (
                <div className="hidden h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 px-6 text-sm font-semibold text-white md:flex">
                  Find jobs
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =======================================================
            JOBS
        ======================================================== */}
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          {/* Section heading */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">
                Opportunities
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Latest open positions
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {loading
                  ? 'Loading available opportunities...'
                  : `${filteredJobs.length} position${
                      filteredJobs.length === 1 ? '' : 's'
                    } available`}
              </p>
            </div>

            {!loading && hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white"
                >
                  <div className="h-2 animate-pulse bg-slate-200" />

                  <div className="p-6">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />

                      <div className="flex-1">
                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                        <div className="mt-3 h-6 w-48 animate-pulse rounded bg-slate-200" />
                      </div>
                    </div>

                    <div className="mt-6 h-20 animate-pulse rounded-2xl bg-slate-100" />

                    <div className="mt-5 flex gap-2">
                      <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-7 w-16 animate-pulse rounded-full bg-slate-100" />
                    </div>

                    <div className="mt-6 h-px bg-slate-100" />

                    <div className="mt-5 h-10 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            /* Empty state */
            <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <BriefcaseBusiness size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">
                No jobs found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                We could not find any positions matching your current
                search. Try a different keyword or location.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            /* Job cards */
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {filteredJobs.map((job) => {
                const skills = Array.isArray(job.required_skills)
                  ? job.required_skills
                  : [];

                const openings = Number(job.openings) || 1;

                return (
                  <article
                    key={job.id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_15px_45px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_25px_65px_rgba(79,70,229,0.12)]"
                  >
                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 opacity-80 transition group-hover:opacity-100" />

                    <div className="flex flex-1 flex-col p-6">
                      {/* Job header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-teal-100 text-indigo-700 transition duration-300 group-hover:scale-105">
                            <Building2 size={20} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {job.company_name ||
                                'TalentLense Hiring Team'}
                            </p>

                            <h3 className="mt-1 line-clamp-2 text-xl font-bold leading-tight text-slate-950">
                              {job.title}
                            </h3>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                          {job.status || 'Active'}
                        </span>
                      </div>

                      {/* Meta information */}
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-600">
                          <MapPin
                            size={14}
                            className="shrink-0 text-indigo-500"
                          />
                          <span className="truncate">
                            {job.location ||
                              job.remote_type ||
                              'Remote'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-600">
                          <Clock3
                            size={14}
                            className="shrink-0 text-indigo-500"
                          />
                          <span className="truncate">
                            {job.employment_type || 'Full-time'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-600">
                          <DollarSign
                            size={14}
                            className="shrink-0 text-emerald-500"
                          />
                          <span className="truncate">
                            {formatSalary(
                              job.salary_min,
                              job.salary_max
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-600">
                          <Users
                            size={14}
                            className="shrink-0 text-indigo-500"
                          />
                          <span>
                            {openings} open
                            {openings > 1 ? 'ings' : 'ing'}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-5">
                        <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                          {job.description ||
                            'No job description available.'}
                        </p>
                      </div>

                      {/* Skills */}
                      <div className="mt-5 min-h-[34px]">
                        {skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {skills.slice(0, 5).map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700"
                              >
                                {skill}
                              </span>
                            ))}

                            {skills.length > 5 && (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500">
                                +{skills.length - 5} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500">
                            Skills not specified
                          </span>
                        )}
                      </div>

                      {/* Bottom area */}
                      <div className="mt-auto pt-6">
                        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Posted
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-600">
                              {formatDate(job.created_at)}
                            </p>
                          </div>

                          {/* IMPORTANT:
                              No Apply button here.
                              User must open the full job page first.
                          */}
                          <Link
                            to={`/jobs/${job.id}`}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/40 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                          >
                            View details
                            <ArrowRight
                              size={15}
                              className="transition-transform duration-300 group-hover:translate-x-0.5"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* =====================================================
              BOTTOM CTA
          ====================================================== */}
          {!loading && filteredJobs.length > 0 && (
            <section className="mt-12 overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-8 text-white shadow-[0_25px_70px_rgba(15,23,42,0.15)] sm:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
                    <Sparkles size={13} />
                    TalentLense
                  </div>

                  <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                    Ready to take the next step?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                    Create your candidate profile, upload your resume,
                    and be ready to apply when you find the right role.
                  </p>
                </div>

                <Link
                  to="/register"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Create candidate profile
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          )}
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-slate-800">
              TalentLense
            </p>

            <p className="mt-1">
              AI-powered resume screening and candidate matching.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <Link
              to="/jobs"
              className="transition hover:text-indigo-600"
            >
              Jobs
            </Link>


            <Link
              to="/login"
              className="transition hover:text-indigo-600"
            >
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  Users,
  Wallet,
  CalendarDays,
  Globe2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import atsService from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useAuth } from '../../contexts/AuthContext';

export default function PublicJobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated, isCandidate } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [error, setError] = useState('');

  useDocumentTitle(job?.title || 'Job Details');

  /*
   * ------------------------------------------------------------
   * Always start this page from the top.
   * ------------------------------------------------------------
   */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [jobId]);

  /*
   * ------------------------------------------------------------
   * Load job
   * ------------------------------------------------------------
   */
  useEffect(() => {
    let mounted = true;

    const loadJob = async () => {
      setLoading(true);
      setError('');
      setJob(null);

      try {
        const data = await atsService.getJob(jobId);

        if (mounted) {
          setJob(data);
        }
      } catch (err) {
        console.error('Failed to load public job:', err);

        if (mounted) {
          setError(
            err?.message ||
              'Unable to load this job. It may no longer be available.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (jobId) {
      loadJob();
    }

    return () => {
      mounted = false;
    };
  }, [jobId]);

  /*
   * ------------------------------------------------------------
   * Format helpers
   * ------------------------------------------------------------
   */

  const formatSalary = useMemo(() => {
    if (!job) return null;

    const min = job.salary_min;
    const max = job.salary_max;

    if (min == null && max == null) {
      return null;
    }

    const format = (value) =>
      Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      });

    if (min != null && max != null) {
      return `${format(min)} - ${format(max)}`;
    }

    if (min != null) {
      return `From ${format(min)}`;
    }

    return `Up to ${format(max)}`;
  }, [job]);

  const formatDate = (date) => {
    if (!date) return null;

    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(date));
    } catch {
      return null;
    }
  };

  const skills = useMemo(() => {
    if (!job?.required_skills) {
      return [];
    }

    if (Array.isArray(job.required_skills)) {
      return job.required_skills.filter(Boolean);
    }

    if (typeof job.required_skills === 'string') {
      return job.required_skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  }, [job]);

  /*
   * ------------------------------------------------------------
   * Apply flow
   * ------------------------------------------------------------
   *
   * Phase 3 behavior:
   *
   * Visitor
   *    ↓
   * Apply
   *    ↓
   * Authenticated?
   *    ├── No → Login
   *    └── Yes
   *          ↓
   *       Candidate?
   *          ├── No → Candidate dashboard / unauthorized
   *          └── Yes
   *                ↓
   *            Check profile
   *                ↓
   *            Check resume
   *                ↓
   *              Apply
   *
   * We preserve the job ID in the URL when redirecting
   * to login/register.
   */
  const handleApply = async () => {
    /*
     * ----------------------------------------------------------
     * 1. User is not authenticated
     * ----------------------------------------------------------
     */

    if (!isAuthenticated) {
      const redirectPath = `/jobs/${jobId}`;

      navigate(
        `/login?redirect=${encodeURIComponent(redirectPath)}`
      );

      return;
    }

    /*
     * ----------------------------------------------------------
     * 2. Authenticated user is not a candidate
     * ----------------------------------------------------------
     */

    if (!isCandidate) {
      toast.error(
        'Only candidate accounts can apply for jobs.'
      );

      return;
    }

    /*
     * ----------------------------------------------------------
     * 3. Check candidate profile
     * ----------------------------------------------------------
     */

    setApplyLoading(true);

    try {
      const profile = await atsService.getProfile();

      /*
       * Your backend requires a resume before application.
       *
       * We check the profile first so the candidate can be
       * directed to profile setup instead of receiving a
       * generic application error.
       */

      let hasResume = false;

      if (profile) {
        hasResume = Boolean(
          profile.resume_file_path ||
          profile.resume_url ||
          profile.resume
        );
      }

      /*
       * If the API profile doesn't expose resume information,
       * ask the backend for the resume URL.
       */
      if (!hasResume) {
        try {
          const resume = await atsService.getResumeUrl();

          hasResume = Boolean(
            resume?.url ||
            resume?.resume_url ||
            resume?.resume_file_path
          );
        } catch {
          hasResume = false;
        }
      }

      if (!hasResume) {
        toast.error(
          'Please complete your candidate profile and upload your resume first.'
        );

        navigate(
          `/candidate/profile?returnTo=${encodeURIComponent(
            `/jobs/${jobId}`
          )}`
        );

        return;
      }

      /*
       * --------------------------------------------------------
       * 4. Submit application
       * --------------------------------------------------------
       */

      await atsService.applyToJob(jobId, {
        cover_letter: '',
      });

      toast.success('Application submitted successfully.');

      /*
       * Take candidate to their applications after successful
       * submission.
       */
      navigate('/candidate/applications');
    } catch (err) {
      console.error('Application failed:', err);

      const message =
        err?.message ||
        'Unable to submit your application.';

      /*
       * If backend says application already exists, don't
       * redirect the user to profile.
       */
      if (
        message.toLowerCase().includes('already') ||
        message.toLowerCase().includes('applied')
      ) {
        toast.error('You have already applied for this job.');
      } else if (
        message.toLowerCase().includes('resume')
      ) {
        toast.error(
          'Please upload your resume before applying.'
        );

        navigate(
          `/candidate/profile?returnTo=${encodeURIComponent(
            `/jobs/${jobId}`
          )}`
        );
      } else {
        toast.error(message);
      }
    } finally {
      setApplyLoading(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * Loading state
   * ------------------------------------------------------------
   */

  if (loading) {
    return <JobDetailSkeleton />;
  }

  /*
   * ------------------------------------------------------------
   * Error / not found
   * ------------------------------------------------------------
   */

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50">

        <PublicHeader />

        <main className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="w-full max-w-md text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle size={28} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-950">
              Job not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {error ||
                'This job may have been closed, removed, or is no longer available.'}
            </p>

            <Link
              to="/jobs"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              <ArrowLeft size={16} />
              Browse Jobs
            </Link>

          </div>
        </main>

      </div>
    );
  }

  const createdDate = formatDate(job.created_at);

  return (
    <div className="min-h-screen bg-slate-50">

      <PublicHeader />

      <main>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="px-4 pb-6 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <div className="mx-auto max-w-7xl">

            <Link
              to="/jobs"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-700"
            >
              <ArrowLeft size={16} />
              Back to Jobs
            </Link>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* Accent */}
              <div className="h-1.5 bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-600" />

              <div className="p-6 md:p-8 lg:p-10">

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

                  {/* Job information */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-start gap-4">

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-xl font-bold text-teal-700 ring-1 ring-teal-100">
                        {job.title?.charAt(0)?.toUpperCase() || 'J'}
                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-semibold text-teal-700">
                          Open Position
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2">

                          {job.status === 'active' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Actively Hiring
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                    <h1 className="mt-6 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl lg:text-5xl">
                      {job.title}
                    </h1>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">

                      {job.location && (
                        <JobMeta
                          icon={MapPin}
                          text={job.location}
                        />
                      )}

                      {job.remote_type && (
                        <JobMeta
                          icon={Globe2}
                          text={job.remote_type}
                        />
                      )}

                      {job.employment_type && (
                        <JobMeta
                          icon={Briefcase}
                          text={job.employment_type}
                        />
                      )}

                      {job.experience_required && (
                        <JobMeta
                          icon={Clock3}
                          text={job.experience_required}
                        />
                      )}

                    </div>

                  </div>

                  {/* Apply */}
                  <div className="w-full shrink-0 lg:w-auto">

                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={applyLoading}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-teal-700/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {applyLoading ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Applying...
                        </>
                      ) : (
                        <>
                          Apply for this Job
                          <ArrowRight
                            size={17}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </button>

                    {!isAuthenticated && (
                      <p className="mt-3 text-center text-xs text-slate-400">
                        Sign in or create an account to apply
                      </p>
                    )}

                  </div>

                </div>

                {/* Quick information */}
                <div className="mt-8 grid gap-3 border-t border-slate-100 pt-7 sm:grid-cols-2 lg:grid-cols-4">

                  {job.employment_type && (
                    <QuickInfo
                      icon={Briefcase}
                      label="Employment"
                      value={job.employment_type}
                    />
                  )}

                  {job.location && (
                    <QuickInfo
                      icon={MapPin}
                      label="Location"
                      value={job.location}
                    />
                  )}

                  {formatSalary && (
                    <QuickInfo
                      icon={Wallet}
                      label="Salary"
                      value={formatSalary}
                    />
                  )}

                  {job.openings != null && (
                    <QuickInfo
                      icon={Users}
                      label="Openings"
                      value={String(job.openings)}
                    />
                  )}

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">

            {/* =================================================
                LEFT
            ================================================== */}

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-2">

              {/* Description */}
              <section>

                <SectionTitle>
                  About the Role
                </SectionTitle>

                <div className="mt-5 whitespace-pre-line text-[15px] leading-8 text-slate-600">
                  {job.description || (
                    <span className="text-slate-400">
                      No job description has been provided.
                    </span>
                  )}
                </div>

              </section>

              {/* Required skills */}
              {skills.length > 0 && (
                <section className="mt-10 border-t border-slate-100 pt-8">

                  <SectionTitle>
                    Required Skills
                  </SectionTitle>

                  <p className="mt-2 text-sm text-slate-500">
                    Skills and technologies expected for this position.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2.5">

                    {skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700"
                      >
                        {skill}
                      </span>
                    ))}

                  </div>

                </section>
              )}

              {/* Education */}
              {job.education_required && (
                <section className="mt-10 border-t border-slate-100 pt-8">

                  <SectionTitle>
                    Education Requirements
                  </SectionTitle>

                  <div className="mt-5 flex items-start gap-4 rounded-2xl bg-slate-50 p-5">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                      <GraduationCap size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Education
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {job.education_required}
                      </p>
                    </div>

                  </div>

                </section>
              )}

            </article>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================== */}

            <aside className="space-y-6">

              {/* Apply card */}
              <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-6">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
                  <Briefcase size={20} />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-slate-950">
                  Interested in this role?
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Apply through TalentLense and let the recruiter review
                  your candidate profile and resume.
                </p>

                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applyLoading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {applyLoading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Applying...
                    </>
                  ) : (
                    <>
                      Apply Now
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

              </div>

              {/* Job overview */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="text-xl font-semibold text-slate-950">
                  Job Overview
                </h2>

                <div className="mt-6 space-y-5">

                  <OverviewRow
                    icon={Briefcase}
                    label="Employment Type"
                    value={job.employment_type}
                  />

                  <OverviewRow
                    icon={MapPin}
                    label="Location"
                    value={job.location}
                  />

                  <OverviewRow
                    icon={Globe2}
                    label="Work Arrangement"
                    value={job.remote_type}
                  />

                  <OverviewRow
                    icon={Clock3}
                    label="Experience"
                    value={job.experience_required}
                  />

                  <OverviewRow
                    icon={GraduationCap}
                    label="Education"
                    value={job.education_required}
                  />

                  <OverviewRow
                    icon={Users}
                    label="Openings"
                    value={job.openings}
                  />

                  {formatSalary && (
                    <OverviewRow
                      icon={Wallet}
                      label="Salary"
                      value={formatSalary}
                    />
                  )}

                  {createdDate && (
                    <OverviewRow
                      icon={CalendarDays}
                      label="Posted"
                      value={createdDate}
                    />
                  )}

                </div>

              </div>

              {/* Skills card */}
              {skills.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <CheckCircle2 size={18} />
                    </div>

                    <h2 className="text-lg font-semibold text-slate-950">
                      Skills
                    </h2>

                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">

                    {skills.map((skill, index) => (
                      <span
                        key={`${skill}-sidebar-${index}`}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}

                  </div>

                </div>
              )}

            </aside>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-xs text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

          <span>
            © {new Date().getFullYear()} TalentLense. All rights reserved.
          </span>

          <span>
            AI-powered resume screening & candidate ranking
          </span>

        </div>

      </footer>

    </div>
  );
}


/* =============================================================
   Header
============================================================= */

function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        <Link
          to="/"
          className="flex items-center gap-3"
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-lg font-bold text-white shadow-sm">
            T
          </div>

          <span className="text-lg font-bold tracking-tight text-slate-950">
            TalentLense
          </span>

        </Link>

        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
        >
          <ArrowLeft size={15} />
          Browse Jobs
        </Link>

      </div>

    </header>
  );
}


/* =============================================================
   Job meta
============================================================= */

function JobMeta({ icon: Icon, text }) {
  if (!text) return null;

  return (
    <span className="inline-flex items-center gap-2">
      <Icon
        size={16}
        className="shrink-0 text-teal-600"
      />
      {text}
    </span>
  );
}


/* =============================================================
   Quick information
============================================================= */

function QuickInfo({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
        <Icon size={17} />
      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>

      </div>

    </div>
  );
}


/* =============================================================
   Section title
============================================================= */

function SectionTitle({ children }) {
  return (
    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
      {children}
    </h2>
  );
}


/* =============================================================
   Overview row
============================================================= */

function OverviewRow({ icon: Icon, label, value }) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  return (
    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-teal-700">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-800">
          {value}
        </p>

      </div>

    </div>
  );
}


/* =============================================================
   Loading skeleton
============================================================= */

function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">

      <PublicHeader />

      <main className="px-4 py-8 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />

          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white">

            <div className="h-1.5 bg-slate-200" />

            <div className="p-6 md:p-8 lg:p-10">

              <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">

                <div className="flex-1">

                  <div className="flex gap-4">

                    <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />

                    <div className="space-y-2">

                      <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />

                      <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />

                    </div>

                  </div>

                  <div className="mt-6 h-12 max-w-2xl animate-pulse rounded-xl bg-slate-200" />

                  <div className="mt-5 flex gap-4">

                    <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />

                  </div>

                </div>

                <div className="h-12 w-48 animate-pulse rounded-xl bg-slate-200" />

              </div>

              <div className="mt-8 grid gap-3 border-t border-slate-100 pt-7 sm:grid-cols-2 lg:grid-cols-4">

                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}

              </div>

            </div>

          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">

            <div className="h-[700px] animate-pulse rounded-3xl border border-slate-200 bg-white lg:col-span-2" />

            <div className="space-y-6">

              <div className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white" />

              <div className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white" />

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
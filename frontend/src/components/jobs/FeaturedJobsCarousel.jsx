import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Briefcase,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import atsService from '../../services/atsService';

export default function FeaturedJobsCarousel() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Load active jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const rows = await atsService.searchJobs({
          keyword: '',
          status: 'active',
        });

        setJobs(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error('Failed to load landing page jobs:', error);
        toast.error('Unable to load available jobs.');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Automatic carousel
  useEffect(() => {
    if (jobs.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % jobs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [jobs.length, isPaused]);

  const nextJob = () => {
    if (!jobs.length) return;

    setCurrentIndex((current) => (current + 1) % jobs.length);
  };

  const previousJob = () => {
    if (!jobs.length) return;

    setCurrentIndex((current) =>
      current === 0 ? jobs.length - 1 : current - 1
    );
  };

  // Loading state
  if (loading) {
    return (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="h-[400px] animate-pulse rounded-[32px] border border-slate-200 bg-white" />
        </div>
      </section>
    );
  }

  // No jobs
  if (!jobs.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-slate-50 px-6 py-24">

      {/* Background decoration */}
      <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">

        {/* Section heading */}
        <div className="mb-12 text-center">
          <span className="inline-flex rounded-full border border-teal-100 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 shadow-sm">
            Open Positions
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Find your next opportunity
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Explore the latest opportunities from companies hiring through
            TalentLense.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >

          {/* Outer glass container */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/80 p-2 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">

            {/* Fixed-height carousel */}
            <div className="relative h-[430px] overflow-hidden rounded-[26px] bg-gradient-to-br from-white via-white to-teal-50/60 md:h-[400px]">

              {jobs.map((job, index) => {
                const isActive = index === currentIndex;

                return (
                  <div
                    key={job.id}
                    className={`absolute inset-0 p-7 md:p-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? 'translate-x-0 opacity-100'
                        : index < currentIndex
                          ? '-translate-x-full opacity-0'
                          : 'translate-x-full opacity-0'
                    }`}
                  >

                    {/* Card content */}
                    <div className="flex h-full flex-col">

                      {/* Top content */}
                      <div>

                        {/* Company information */}
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                          <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-xl font-bold text-teal-700 shadow-sm">
                              {job.company_name?.charAt(0)?.toUpperCase() || 'T'}
                            </div>

                            <div>
                              <p className="font-semibold text-teal-700">
                                {job.company_name || 'Company'}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {job.department || 'Open Position'}
                              </p>
                            </div>

                          </div>

                          {/* Job counter */}
                          <div className="hidden rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-medium text-slate-400 md:block">
                            {String(index + 1).padStart(2, '0')} /{' '}
                            {String(jobs.length).padStart(2, '0')}
                          </div>

                        </div>

                        {/* Job title */}
                        <h3 className="mt-7 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                          {job.title}
                        </h3>

                        {/* Job metadata */}
                        <div className="mt-5 flex flex-wrap gap-3">

                          {job.location && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                              <MapPin
                                size={14}
                                className="text-teal-600"
                              />
                              {job.location}
                            </span>
                          )}

                          {job.employment_type && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                              <Briefcase
                                size={14}
                                className="text-teal-600"
                              />
                              {job.employment_type}
                            </span>
                          )}

                          {job.created_at && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                              <Clock
                                size={14}
                                className="text-teal-600"
                              />
                              Recently posted
                            </span>
                          )}

                        </div>

                        {/* Skills */}
                        {Array.isArray(job.skills) &&
                          job.skills.length > 0 && (
                            <div className="mt-4 flex max-h-9 flex-wrap gap-2 overflow-hidden">

                              {job.skills.slice(0, 4).map((skill, skillIndex) => (
                                <span
                                  key={`${skill}-${skillIndex}`}
                                  className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700"
                                >
                                  {skill}
                                </span>
                              ))}

                            </div>
                          )}

                        {/* Short description */}
                        <p className="mt-6 max-w-3xl overflow-hidden text-sm leading-7 text-slate-500 line-clamp-3 md:text-base">
                          {job.description ||
                            'Explore this opportunity and learn more about the role.'}
                        </p>

                      </div>

                      {/* Bottom controls */}
                      <div className="mt-auto flex items-center justify-between gap-4 pt-6">

                        {/* Read More */}
                        <button
                          type="button"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="group inline-flex items-center gap-2 rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-700/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-xl"
                        >
                          Read More

                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </button>

                        {/* Navigation */}
                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={previousJob}
                            aria-label="Previous job"
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <ArrowLeft size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={nextJob}
                            aria-label="Next job"
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <ArrowRight size={18} />
                          </button>

                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Carousel indicators */}
          {jobs.length > 1 && (
            <div className="mt-7 flex items-center justify-center gap-2">

              {jobs.map((job, index) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Show ${job.title}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === currentIndex
                      ? 'w-8 bg-teal-700'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}

            </div>
          )}

          {/* Carousel status */}
          {jobs.length > 1 && (
            <p className="mt-4 text-center text-[11px] font-medium uppercase tracking-wider text-slate-400">
              {isPaused ? 'Paused' : 'Auto rotating'}
            </p>
          )}

        </div>
      </div>
    </section>
  );
}
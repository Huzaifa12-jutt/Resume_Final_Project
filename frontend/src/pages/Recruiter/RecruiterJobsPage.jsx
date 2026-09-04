import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, ArrowRight, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';

const formatDate = (value) => {
  const date = new Date(value || Date.now());
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function RecruiterJobsPage() {
  useDocumentTitle('Manage Jobs');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({ title: '', description: '' });
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const createFormRef = useRef(null);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await atsService.listRecruiterJobs();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch (error) {
      toast.error(error.message || 'Unable to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const statuses = useMemo(() => {
    const unique = new Set();
    jobs.forEach((job) => {
      if (job.status) unique.add(job.status);
    });
    return ['all', ...Array.from(unique)];
  }, [jobs]);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const content = `${job.title || ''} ${job.description || ''}`.toLowerCase();
        const matchesSearch = content.includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' ||
          (job.status || 'active').toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      }),
    [jobs, query, statusFilter]
  );

  const scrollToCreateForm = () => {
    setShowCreateForm(true);
    requestAnimationFrame(() => {
      createFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await atsService.createRecruiterJob(form);
      toast.success('Job created.');
      setForm({ title: '', description: '' });
      await loadJobs();
      setStatusFilter('all');
      setQuery('');
      scrollToCreateForm();
    } catch (error) {
      toast.error(error.message || 'Unable to create job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm('Delete this job? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingJobId(jobId);
    try {
      await atsService.deleteRecruiterJob(jobId);
      toast.success('Job deleted.');
      await loadJobs();
    } catch (error) {
      toast.error(error.message || 'Unable to delete job');
    } finally {
      setDeletingJobId(null);
    }
  };

  return (
    <RoleShell
      title="Recruiter workspace"
      subtitle="Job pipelines"
      role="recruiter"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jobs by title or description..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-12 pr-4 text-sm text-slate-900 shadow-xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 shadow-xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 lg:w-48"
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-indigo-50/50 px-4 py-2.5 lg:w-40 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Total</span>
            <span className="text-lg font-semibold text-slate-950">{jobs.length}</span>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={scrollToCreateForm}
            icon={PlusCircle}
            className="w-full justify-center lg:w-auto"
          >
            Create job
          </Button>
        </div>

        {showCreateForm && (
          <Card ref={createFormRef} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Create role</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">Add a new job posting</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={submit} className="mt-6 grid gap-5 lg:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Role title
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                  placeholder="Senior Product Designer"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 lg:row-span-2">
                Job description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-2 min-h-[9.5rem] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 lg:min-h-[calc(100%-1.75rem)]"
                  placeholder="Describe the role and expectations"
                  required
                />
              </label>

              <Button type="submit" variant="primary" size="lg" icon={PlusCircle} className="w-full justify-center lg:self-end" isLoading={saving}>
                Publish role
              </Button>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-[32px] border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
              Loading jobs
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-950">No jobs found</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                There are no roles matching your search or filter. Adjust the terms or add a new job to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,360px))] justify-start gap-6">
              {filteredJobs.map((job) => {
                const created = formatDate(job.created_at || job.createdAt);
                const applications = job.total_candidates ?? job.applications ?? job.candidates?.length ?? 0;
                const status = job.status || 'active';

                return (
                  <Card key={job.id || job._id} className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 p-6 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Role</p>
                          <h3 className="mt-2 text-xl font-semibold text-slate-950">{job.title}</h3>
                        </div>
                        <StatusBadge status={status} />
                      </div>

                      <p className="mt-4 min-h-[4.5rem] text-sm leading-6 text-slate-600 line-clamp-3">
                        {job.description || 'No description available.'}
                      </p>

                      <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl bg-slate-50 p-3 text-center">
                          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Applied</p>
                          <p className="mt-1.5 text-lg font-semibold text-slate-950">{applications}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 text-center">
                          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Created</p>
                          <p className="mt-1.5 text-sm font-semibold leading-tight text-slate-950">{created}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 text-center">
                          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Candidates</p>
                          <p className="mt-1.5 text-lg font-semibold text-slate-950">{applications}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:flex sm:items-center sm:justify-between">
                      <Link
                        to={`/recruiter/jobs/${job.id || job._id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 sm:w-auto"
                      >
                        Open Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        icon={Trash2}
                        disabled={deletingJobId === (job.id || job._id)}
                        onClick={() => handleDelete(job.id || job._id)}
                        className="w-full sm:w-auto"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                );
              })}

              <button
                type="button"
                onClick={scrollToCreateForm}
                className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-6 text-slate-500 transition-all hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-600"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition">
                  <PlusCircle size={22} />
                </div>
                <span className="text-sm font-semibold">Add another role</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </RoleShell>
  );
}
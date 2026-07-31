import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Sparkles, UserRound, Plus } from 'lucide-react';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Button from '../../components/common/Button';

export default function CandidateOverviewPage() {
  useDocumentTitle('Candidate Dashboard');
  const [profile, setProfile] = useState({ profile_completion: 0 });
  const [applications, setApplications] = useState([]);
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setProfile(await atsService.getProfile());
      } catch {
        setProfile({ profile_completion: 0 });
      }
      try {
        setApplications(await atsService.listApplications());
      } catch {
        setApplications([]);
      }
      try {
        const saved = await atsService.listSavedJobs();
        setSavedJobsCount(saved?.length || 0);
      } catch {
        setSavedJobsCount(0);
      }
    };
    load();
  }, []);

  return (
    <RoleShell title="Candidate dashboard" subtitle="Keep your profile sharp and stay on top of your applications." role="candidate">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: 'Profile completion', value: `${profile.profile_completion || 0}%`, icon: UserRound },
          { label: 'Applications', value: applications.length, icon: BriefcaseBusiness },
          { label: 'Saved opportunities', value: savedJobsCount, icon: Sparkles },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <Icon size={20} />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Recent activity</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Your applications</h2>
          </div>
          <Link to="/candidate/applications" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-6 grid gap-3">
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-sm text-indigo-700">No applications yet. Browse jobs and apply when you are ready.</div>
          ) : applications.map((application) => (
            <div key={application.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <p className="font-semibold text-slate-950">{application.job_title || 'Unknown Position'}</p>
              <p className="mt-1 text-sm text-slate-500">Status: {application.status || 'Applied'}</p>
            </div>
          ))}
        </div>
      </div>
    </RoleShell>
  );
}

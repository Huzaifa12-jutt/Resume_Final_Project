import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function CandidateApplicationsPage() {
  useDocumentTitle('My Applications');
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setApplications(await atsService.listApplications());
      } catch {
        setApplications([]);
      }
    };
    load();
  }, []);

  return (
    <RoleShell title="Applications" subtitle="Track every application from a single place." role="candidate">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            <FileText size={24} className="mb-3 text-slate-400" />
            No applications yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {applications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-950">Application {application.id}</p>
                <p className="mt-1 text-sm text-slate-500">Status: {application.status || 'Applied'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleShell>
  );
}

import { useEffect, useState } from 'react';
import { FileText, Calendar, MapPin, Briefcase } from 'lucide-react';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const statusColors = {
  'Applied': 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Review': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Shortlisted': 'bg-green-50 text-green-700 border-green-200',
  'Interview': 'bg-purple-50 text-purple-700 border-purple-200',
  'Accepted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function CandidateApplicationsPage() {
  useDocumentTitle('My Applications');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setApplications(await atsService.listApplications());
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <RoleShell title="Applications" subtitle="Track every application from a single place." role="candidate">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-10 text-sm text-slate-500">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            <FileText size={24} className="mb-3 text-slate-400" />
            No applications yet. Browse jobs and apply when you are ready.
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50 hover:bg-slate-100 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-950">
                      {application.job_title || 'Unknown Position'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {application.company_name || 'Company'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                      {application.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {application.location}
                        </div>
                      )}
                      {application.employment_type && (
                        <div className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {application.employment_type}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Applied: {formatDate(application.applied_at)}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusColors[application.status] || statusColors['Applied']}`}>
                    {application.status || 'Applied'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleShell>
  );
}

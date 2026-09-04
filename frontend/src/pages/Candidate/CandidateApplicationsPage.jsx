import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, MapPin, Briefcase, MessageSquare, Loader2 } from 'lucide-react';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import { messagingService } from '../../services/messagingService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

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
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingChatId, setStartingChatId] = useState(null);

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

  const handleMessageRecruiter = async (applicationId) => {
    setStartingChatId(applicationId);
    try {
      const conversation = await messagingService.getOrCreateConversation(applicationId);
      if (conversation?.id) {
        navigate(`/candidate/messages/${conversation.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Could not open conversation with recruiter');
    } finally {
      setStartingChatId(null);
    }
  };

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
              <div key={application.id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50 hover:bg-slate-100/80 transition">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">
                        {application.job_title || 'Unknown Position'}
                      </h3>
                      <StatusBadge status={application.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600 font-medium">
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

                  <div className="shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => handleMessageRecruiter(application.id)}
                      disabled={startingChatId === application.id}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 shadow-xs transition-all active:scale-95"
                    >
                      {startingChatId === application.id ? (
                        <Loader2 size={14} className="animate-spin text-indigo-600" />
                      ) : (
                        <MessageSquare size={14} className="text-indigo-600" />
                      )}
                      <span>Message Recruiter</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleShell>
  );
}

import { useEffect, useState } from 'react';
import { Search, Users, Loader2 } from 'lucide-react';
import RoleShell from '../../components/layout/RoleShell';
import { atsService } from '../../services/atsService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const tierFromScore = (score) => {
  if (score >= 75) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
};

export default function RecruiterCandidatesPage() {
  useDocumentTitle('Candidates');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Use new endpoint to get all candidates including Gmail fetched ones
        const allCandidates = await atsService.listRecruiterCandidates();
        setCandidates(Array.isArray(allCandidates) ? allCandidates : []);
      } catch {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = candidates.filter((candidate) =>
    `${candidate.name} ${candidate.email} ${candidate.source || ''}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <RoleShell title="Candidate Pipeline" subtitle="Review resumes and ranking results for each role." role="recruiter">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-premium">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Candidates</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Your ranked applicant pool</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidates..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center py-12 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading candidates...
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={Users}
              title="No candidates found"
              description={query ? 'Try a different search term.' : 'Upload resumes to a job to see them appear here.'}
              actionText={query ? 'Clear search' : undefined}
              onAction={query ? () => setQuery('') : undefined}
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {filtered.map((candidate, index) => (
              <div
                key={`${candidate.id || candidate.candidate_id}-${index}`}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-200 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">{candidate.name || 'Unnamed'}</p>
                    {candidate.overall_score && (
                      <Badge variant={tierFromScore(candidate.overall_score)}>
                        {Math.round(candidate.overall_score)}%
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 truncate">{candidate.email || 'No email'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {candidate.source === 'gmail' ? (
                      <span className="font-medium text-indigo-600">From Gmail</span>
                    ) : candidate.jobTitle ? (
                      <>Applied to <span className="font-medium text-slate-600">{candidate.jobTitle}</span></>
                    ) : (
                      <span className="font-medium text-slate-400">No job assigned</span>
                    )}
                  </p>
                </div>
                {!candidate.overall_score && (
                  <span className="text-xs text-slate-400 font-medium">Unranked</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleShell>
  );
}
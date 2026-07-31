import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useJobDashboard from '../../hooks/useJobDashboard';
import useJobs from '../../hooks/useJobs';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardStats from '../../components/dashboard/DashboardStats';
import DashboardActions from '../../components/dashboard/DashboardActions';
import CandidatesTable from '../../components/dashboard/CandidatesTable';
import UploadModal from '../../components/dashboard/UploadModal';
import CandidateDetailsModal from '../../components/dashboard/CandidateDetailsModal';
import ChatWindow from '../../components/chat/ChatWindow';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { FiAlertCircle } from 'react-icons/fi';
import RoleShell from '../../components/layout/RoleShell';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const RecruiterJobDashboardPage = () => {
  useDocumentTitle('Job Dashboard');
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { deleteJob } = useJobs();

  const {
    job,
    candidates,
    rawCandidates,
    stats,
    isLoading,
    isUploading,
    isGeneratingSamples,
    isRanking,
    isExporting,
    searchQuery,
    setSearchQuery,
    tierFilter,
    setTierFilter,
    sortBy,
    setSortBy,
    uploadCandidates,
    generateSamples,
    runRanking,
    exportCSV,
    deleteCandidate,
  } = useJobDashboard(jobId);

  // Modals & Panels State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [deletingCandidateId, setDeletingCandidateId] = useState(null);
  const [isDeleteJobConfirmOpen, setIsDeleteJobConfirmOpen] = useState(false);
  const [isDeletingJob, setIsDeletingJob] = useState(false);

  const handleDeleteJobConfirm = async () => {
    setIsDeletingJob(true);
    try {
      await deleteJob(jobId);
      navigate('/');
    } catch (error) {
      // Handled by toast
    } finally {
      setIsDeletingJob(false);
    }
  };

  const handleDeleteCandidateConfirm = async () => {
    if (!deletingCandidateId) return;
    try {
      await deleteCandidate(deletingCandidateId);
      setDeletingCandidateId(null);
    } catch (error) {
      // Handled by toast
    }
  };

  if (isLoading) {
    return (
      <RoleShell title="Loading..." role="recruiter">
        <div className="py-20">
          <Loader size="lg" />
        </div>
      </RoleShell>
    );
  }

  if (!job) {
    return (
      <RoleShell title="Not Found" role="recruiter">
        <div className="py-16">
          <EmptyState
            icon={FiAlertCircle}
            title="Job Position Not Found"
            description="The position you are looking for might have been deleted or does not exist."
            actionText="Back to Jobs Dashboard"
            onAction={() => navigate('/recruiter/jobs')}
          />
        </div>
      </RoleShell>
    );
  }

  return (
    <RoleShell title={job.title} subtitle="Manage candidates, review AI scores, and take actions." role="recruiter">
      <div className="relative space-y-6">
        {/* Header */}
        <DashboardHeader job={job} onDelete={() => setIsDeleteJobConfirmOpen(true)} />

        {/* Stats Overview */}
        <DashboardStats stats={stats} />

        {/* Action Toolbar */}
        <DashboardActions
          onUploadClick={() => setIsUploadOpen(true)}
          onGenerateSamples={generateSamples}
          onRunRanking={runRanking}
          onExportCSV={exportCSV}
          onToggleChat={() => setIsChatOpen((prev) => !prev)}
          isGeneratingSamples={isGeneratingSamples}
          isRanking={isRanking}
          isExporting={isExporting}
          hasCandidates={rawCandidates.length > 0}
          isChatOpen={isChatOpen}
        />

        {/* Candidates Table */}
        <CandidatesTable
          candidates={candidates}
          rawCandidates={rawCandidates}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          tierFilter={tierFilter}
          onTierFilterChange={setTierFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onSelectCandidate={(candidate) => setSelectedCandidate(candidate)}
          onDeleteCandidate={(candidateId) => setDeletingCandidateId(candidateId)}
          onUploadClick={() => setIsUploadOpen(true)}
        />

        {/* Modals & Slide-overs */}
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUpload={uploadCandidates}
        />

        <CandidateDetailsModal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          candidate={selectedCandidate}
        />

        <ChatWindow
          jobId={jobId}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />

        <ConfirmDialog
          isOpen={isDeleteJobConfirmOpen}
          onClose={() => setIsDeleteJobConfirmOpen(false)}
          onConfirm={handleDeleteJobConfirm}
          title="Delete Job Position"
          message={`Are you sure you want to delete "${job.title}"? All uploaded candidate resumes and evaluation metrics will be permanently removed.`}
          confirmText="Delete Job"
          isLoading={isDeletingJob}
        />

        <ConfirmDialog
          isOpen={!!deletingCandidateId}
          onClose={() => setDeletingCandidateId(null)}
          onConfirm={handleDeleteCandidateConfirm}
          title="Delete Candidate"
          message="Are you sure you want to delete this candidate from the position?"
          confirmText="Delete Candidate"
        />
      </div>
    </RoleShell>
  );
};

export default RecruiterJobDashboardPage;
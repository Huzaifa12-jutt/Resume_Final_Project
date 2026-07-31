import React from 'react';
import { FiUpload, FiCpu, FiAward, FiDownload, FiMessageSquare } from 'react-icons/fi';
import Button from '../common/Button';

const DashboardActions = ({
  onUploadClick,
  onGenerateSamples,
  onRunRanking,
  onExportCSV,
  onToggleChat,
  isGeneratingSamples,
  isRanking,
  isExporting,
  hasCandidates,
  isChatOpen,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-premium-sm mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          onClick={onUploadClick}
          icon={FiUpload}
          variant="primary"
          size="md"
        >
          Bulk Upload Resumes
        </Button>

        <Button
          onClick={onGenerateSamples}
          icon={FiCpu}
          variant="secondary"
          size="md"
          isLoading={isGeneratingSamples}
        >
          Generate Sample Resumes (Test Data)
        </Button>

        <Button
          onClick={onRunRanking}
          icon={FiAward}
          variant="outline"
          size="md"
          isLoading={isRanking}
          disabled={!hasCandidates}
        >
          Run AI Ranking
        </Button>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          onClick={onExportCSV}
          icon={FiDownload}
          variant="secondary"
          size="md"
          isLoading={isExporting}
          disabled={!hasCandidates}
        >
          Export CSV
        </Button>

        <Button
          onClick={onToggleChat}
          icon={FiMessageSquare}
          variant={isChatOpen ? 'primary' : 'secondary'}
          size="md"
        >
          {isChatOpen ? 'Close AI Chat' : 'Open AI Chat'}
        </Button>
      </div>
    </div>
  );
};

export default DashboardActions;

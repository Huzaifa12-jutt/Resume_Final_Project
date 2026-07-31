import React from 'react';
import { FiUsers, FiFilter } from 'react-icons/fi';
import CandidateRow from './CandidateRow';
import SearchInput from '../common/SearchInput';
import EmptyState from '../common/EmptyState';

const CandidatesTable = ({
  candidates,
  rawCandidates,
  searchQuery,
  onSearchChange,
  tierFilter,
  onTierFilterChange,
  sortBy,
  onSortByChange,
  onSelectCandidate,
  onDeleteCandidate,
  onUploadClick,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      {/* Controls Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Candidates List</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing {candidates.length} of {rawCandidates.length} total applicants
          </p>
        </div>

        {rawCandidates.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search candidates or skills..."
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <FiFilter className="text-gray-400 h-4 w-4 shrink-0" />
              <select
                value={tierFilter}
                onChange={(e) => onTierFilterChange(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Tiers</option>
                <option value="green">Strong Match (≥75%)</option>
                <option value="yellow">Moderate Match (50-74%)</option>
                <option value="red">Weak Match (&lt;50%)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="rank">Sort by Rank</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      {candidates.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 sticky top-0 z-10 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-header-group">
                <tr>
                  <th className="px-6 py-3.5 w-16 text-center">Rank</th>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Match Score</th>
                  <th className="px-6 py-3.5">Tier</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {candidates.map((candidate) => (
                  <CandidateRow
                    key={candidate.id || candidate._id}
                    candidate={candidate}
                    onSelect={onSelectCandidate}
                    onDelete={onDeleteCandidate}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards view container */}
          <div className="p-4 space-y-3 md:hidden">
            {candidates.map((candidate) => (
              <CandidateRow
                key={candidate.id || candidate._id}
                candidate={candidate}
                onSelect={onSelectCandidate}
                onDelete={onDeleteCandidate}
              />
            ))}
          </div>
        </>
      ) : rawCandidates.length > 0 ? (
        <div className="p-8">
          <EmptyState
            icon={FiUsers}
            title="No candidate matched filters"
            description="Try resetting your search query or tier filters to view applicants."
            actionText="Reset Filters"
            onAction={() => {
              onSearchChange('');
              onTierFilterChange('all');
            }}
          />
        </div>
      ) : (
        <div className="p-8">
          <EmptyState
            icon={FiUsers}
            title="No Candidates Found"
            description="Upload PDF resumes or generate sample resumes to start evaluation."
            actionText="Upload Resumes"
            onAction={onUploadClick}
          />
        </div>
      )}
    </div>
  );
};

export default CandidatesTable;

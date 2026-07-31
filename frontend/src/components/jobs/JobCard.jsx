import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCheckCircle, FiStar, FiCalendar, FiTrash2 } from 'react-icons/fi';
import Card from '../common/Card';
import Badge from '../common/Badge';

const JobCard = ({ job, onDelete }) => {
  const navigate = useNavigate();

  const createdDate = job.created_at
    ? new Date(job.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const totalCandidates = job.total_candidates ?? job.candidates?.length ?? 0;
  const rankedCandidates = job.ranked_candidates ?? job.candidates?.filter(c => c.score !== undefined && c.score !== null).length ?? 0;
  const avgScore = job.average_score !== undefined && job.average_score !== null
    ? Math.round(job.average_score)
    : null;

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(job.id || job._id);
  };

  return (
    <Card
      hoverable
      onClick={() => navigate(`/jobs/${job.id || job._id}`)}
      className="p-6 transition-all duration-200 hover:border-indigo-200 hover:shadow-lg flex flex-col justify-between group relative"
    >
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {job.title}
            </h3>
            <div className="flex items-center text-xs text-gray-400 mt-1 space-x-1">
              <FiCalendar className="h-3.5 w-3.5" />
              <span>Created {createdDate}</span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            title="Delete Job"
            className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex items-center justify-center text-gray-400 mb-1">
            <FiUsers className="h-4 w-4" />
          </div>
          <span className="block text-sm font-semibold text-gray-800">{totalCandidates}</span>
          <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Total</span>
        </div>

        <div className="bg-indigo-50/50 rounded-lg p-2">
          <div className="flex items-center justify-center text-indigo-500 mb-1">
            <FiCheckCircle className="h-4 w-4" />
          </div>
          <span className="block text-sm font-semibold text-indigo-700">{rankedCandidates}</span>
          <span className="block text-[10px] text-indigo-600 uppercase tracking-wider">Ranked</span>
        </div>

        <div className="bg-emerald-50/50 rounded-lg p-2">
          <div className="flex items-center justify-center text-emerald-500 mb-1">
            <FiStar className="h-4 w-4" />
          </div>
          <span className="block text-sm font-semibold text-emerald-700">
            {avgScore !== null ? `${avgScore}%` : 'N/A'}
          </span>
          <span className="block text-[10px] text-emerald-600 uppercase tracking-wider">Avg Score</span>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
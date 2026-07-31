import React from 'react';
import { FiEye, FiTrash2, FiMail, FiPhone } from 'react-icons/fi';
import Badge from '../common/Badge';

const CandidateRow = ({ candidate, onSelect, onDelete }) => {
  const score = candidate.score !== undefined && candidate.score !== null ? Math.round(candidate.score) : null;

  let tierVariant = 'gray';
  let tierText = 'Unranked';
  if (score !== null) {
    if (score >= 75) {
      tierVariant = 'green';
      tierText = 'Strong Match';
    } else if (score >= 50) {
      tierVariant = 'yellow';
      tierText = 'Moderate';
    } else {
      tierVariant = 'red';
      tierText = 'Weak Match';
    }
  }

  const id = candidate.id || candidate._id;

  return (
    <>
      {/* Desktop Table Row */}
      <tr className="hidden md:table-row hover:bg-indigo-50/30 transition-colors group border-b border-gray-100 last:border-0">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
          {candidate.rank ? (
            <span className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-700 text-xs">
              #{candidate.rank}
            </span>
          ) : (
            <span className="text-gray-300">-</span>
          )}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-semibold text-gray-900">{candidate.name || 'Anonymous'}</div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {candidate.email || <span className="text-gray-300">N/A</span>}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {candidate.phone || <span className="text-gray-300">N/A</span>}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          {score !== null ? (
            <span className="text-sm font-extrabold text-gray-900">{score}%</span>
          ) : (
            <span className="text-xs text-gray-400">Unranked</span>
          )}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <Badge variant={tierVariant}>{tierText}</Badge>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          <button
            onClick={() => onSelect(candidate)}
            className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            title="View Details"
          >
            <FiEye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete Candidate"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </td>
      </tr>

      {/* Mobile Card View */}
      <div className="md:hidden bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {candidate.rank && (
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                #{candidate.rank}
              </span>
            )}
            <h4 className="font-bold text-gray-900 text-base">{candidate.name || 'Anonymous'}</h4>
          </div>
          <Badge variant={tierVariant}>{tierText}</Badge>
        </div>

        <div className="space-y-1 text-xs text-gray-500">
          {candidate.email && (
            <div className="flex items-center space-x-1">
              <FiMail className="h-3 w-3" />
              <span>{candidate.email}</span>
            </div>
          )}
          {candidate.phone && (
            <div className="flex items-center space-x-1">
              <FiPhone className="h-3 w-3" />
              <span>{candidate.phone}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">Score: </span>
            <span className="text-sm font-bold text-gray-900">
              {score !== null ? `${score}%` : 'Unranked'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelect(candidate)}
              className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg"
            >
              View
            </button>
            <button
              onClick={() => onDelete(id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CandidateRow;

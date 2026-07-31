import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Card from '../common/Card';
import {
  FiMail,
  FiPhone,
  FiAward,
  FiBriefcase,
  FiBookOpen,
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';

const CandidateDetailsModal = ({ isOpen, onClose, candidate }) => {
  if (!candidate) return null;

  const score = candidate.score !== undefined && candidate.score !== null ? Math.round(candidate.score) : null;

  let tierVariant = 'gray';
  let tierLabel = 'Unranked';
  if (score !== null) {
    if (score >= 75) {
      tierVariant = 'green';
      tierLabel = 'Strong Match (Green)';
    } else if (score >= 50) {
      tierVariant = 'yellow';
      tierLabel = 'Moderate Match (Yellow)';
    } else {
      tierVariant = 'red';
      tierLabel = 'Weak Match (Red)';
    }
  }

  const skills = Array.isArray(candidate.skills)
    ? candidate.skills
    : typeof candidate.skills === 'string'
    ? candidate.skills.split(',').map((s) => s.trim())
    : [];

  const matchedSkills = Array.isArray(candidate.matched_skills)
    ? candidate.matched_skills
    : [];

  const missingSkills = Array.isArray(candidate.missing_skills)
    ? candidate.missing_skills
    : [];

  const strengths = Array.isArray(candidate.strengths) ? candidate.strengths : [];
  const weaknesses = Array.isArray(candidate.weaknesses) ? candidate.weaknesses : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Header Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">{candidate.name || 'Anonymous Candidate'}</h2>
              <Badge variant={tierVariant}>{tierLabel}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {candidate.email && (
                <div className="flex items-center space-x-1.5">
                  <FiMail className="h-3.5 w-3.5 text-gray-400" />
                  <span>{candidate.email}</span>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center space-x-1.5">
                  <FiPhone className="h-3.5 w-3.5 text-gray-400" />
                  <span>{candidate.phone}</span>
                </div>
              )}
            </div>
          </div>

          {score !== null && (
            <div className="flex flex-col items-center justify-center bg-indigo-50/60 rounded-2xl p-3 px-6 border border-indigo-100 text-center shrink-0">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Overall Match</span>
              <span className="text-3xl font-black text-indigo-700">{score}%</span>
            </div>
          )}
        </div>

        {/* Score Breakdown / Summary */}
        {candidate.summary && (
          <Card className="p-4 bg-gray-50/50">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AI Executive Summary</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{candidate.summary}</p>
          </Card>
        )}

        {/* Skills Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
            <FiAward className="mr-2 h-4 w-4 text-indigo-600" />
            Skill Evaluation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100">
              <h4 className="text-xs font-semibold text-emerald-800 flex items-center mb-2">
                <FiCheckCircle className="mr-1.5 text-emerald-600" />
                Matched Requirements
              </h4>
              {matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map((s, idx) => (
                    <Badge key={idx} variant="green">{s}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No specific skill matches detected</p>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-rose-50/40 rounded-xl p-4 border border-rose-100">
              <h4 className="text-xs font-semibold text-rose-800 flex items-center mb-2">
                <FiXCircle className="mr-1.5 text-rose-600" />
                Missing Requirements
              </h4>
              {missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.map((s, idx) => (
                    <Badge key={idx} variant="red">{s}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No missing critical skills detected</p>
              )}
            </div>
          </div>

          {/* All Skills */}
          {skills.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-400 mb-1">Extracted Candidate Skills:</h4>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, idx) => (
                  <Badge key={idx} variant="gray">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Strengths & Weaknesses */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strengths.length > 0 && (
              <Card className="p-4 border-l-4 border-l-emerald-500">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Key Strengths</h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {strengths.map((st, i) => (
                    <li key={i} className="flex items-start">
                      <FiCheck className="h-4 w-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {weaknesses.length > 0 && (
              <Card className="p-4 border-l-4 border-l-amber-500">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Gaps & Concerns</h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {weaknesses.map((wk, i) => (
                    <li key={i} className="flex items-start">
                      <FiAlertCircle className="h-4 w-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

        {/* Experience & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Experience */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center">
              <FiBriefcase className="mr-2 h-4 w-4 text-indigo-600" />
              Work Experience
            </h3>
            <Card className="p-4 space-y-2">
              {candidate.experience ? (
                typeof candidate.experience === 'string' ? (
                  <p className="text-sm text-gray-700 whitespace-pre-line">{candidate.experience}</p>
                ) : Array.isArray(candidate.experience) ? (
                  candidate.experience.map((exp, i) => (
                    <div key={i} className="text-sm text-gray-700 border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                      <p className="font-semibold text-gray-900">{exp.title || exp.role}</p>
                      <p className="text-xs text-gray-500">{exp.company} • {exp.duration}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No experience listed</p>
                )
              ) : (
                <p className="text-xs text-gray-400">No experience listed</p>
              )}
            </Card>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center">
              <FiBookOpen className="mr-2 h-4 w-4 text-indigo-600" />
              Education & Certifications
            </h3>
            <Card className="p-4 space-y-2">
              {candidate.education ? (
                typeof candidate.education === 'string' ? (
                  <p className="text-sm text-gray-700">{candidate.education}</p>
                ) : (
                  <p className="text-sm text-gray-700">{JSON.stringify(candidate.education)}</p>
                )
              ) : (
                <p className="text-xs text-gray-400">No education listed</p>
              )}

              {candidate.certifications && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 mb-1">Certifications:</h4>
                  <p className="text-xs text-gray-700">{Array.isArray(candidate.certifications) ? candidate.certifications.join(', ') : candidate.certifications}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CandidateDetailsModal;

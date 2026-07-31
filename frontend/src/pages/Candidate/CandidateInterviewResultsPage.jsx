import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiDownload, FiRefreshCw, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import interviewService from '../../services/interviewService';
import Loader from '../../components/common/Loader';

const CandidateInterviewResultsPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [interviewId]);

  const loadResults = async () => {
    try {
      const data = await interviewService.getInterviewDetails(interviewId);
      setResults(data);
    } catch (error) {
      console.error('Failed to load interview results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Excellent': return 'from-green-500 to-emerald-500';
      case 'Good': return 'from-blue-500 to-cyan-500';
      case 'Average': return 'from-yellow-500 to-orange-500';
      case 'Poor': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-blue-600 bg-blue-50';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const downloadReport = () => {
    if (!results) return;
    
    const reportContent = `
Interview Results Report
========================
Date: ${new Date(results.created_at).toLocaleDateString()}
Score: ${results.score}%
Rating: ${results.rating}

Overall Feedback:
${results.feedback}

Strengths:
${results.strengths.map(s => `- ${s}`).join('\n')}

Areas for Improvement:
${results.weaknesses.map(w => `- ${w}`).join('\n')}

Detailed Results:
${results.answers.map((a, i) => `
Question ${i + 1}: ${a.question}
Your Answer: ${a.answer}
Score: ${a.score}/10
Feedback: ${a.feedback}
`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-results-${interviewId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load interview results</p>
        <button
          onClick={() => navigate('/candidate/interview')}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/candidate/interview')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
        <button
          onClick={downloadReport}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow"
        >
          <FiDownload className="h-4 w-4" />
          <span>Download Report</span>
        </button>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Interview Results</h2>
            <p className="text-gray-600">
              Completed on {new Date(results.completed_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getRatingColor(results.rating)} text-white shadow-lg`}>
              <span className="text-3xl font-bold">{results.score}%</span>
            </div>
            <p className="mt-2 font-semibold text-gray-900">{results.rating}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{results.answers.length}</p>
            <p className="text-sm text-gray-600">Total Questions</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {results.answers.filter(a => a.score >= 7).length}
            </p>
            <p className="text-sm text-gray-600">Correct</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-600">
              {results.answers.filter(a => a.score < 7).length}
            </p>
            <p className="text-sm text-gray-600">Incorrect</p>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Feedback</h3>
        <p className="text-gray-700 leading-relaxed">{results.feedback}</p>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center space-x-2 mb-4">
            <FiTrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Strengths</h3>
          </div>
          {results.strengths.length > 0 ? (
            <ul className="space-y-2">
              {results.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2 text-gray-700">
                  <FiCheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No specific strengths identified</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
          <div className="flex items-center space-x-2 mb-4">
            <FiTrendingDown className="h-5 w-5 text-red-600" />
            <h3 className="text-xl font-bold text-gray-900">Areas for Improvement</h3>
          </div>
          {results.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {results.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start space-x-2 text-gray-700">
                  <FiXCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No specific areas for improvement identified</p>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Question-by-Question Results</h3>
        <div className="space-y-4">
          {results.answers.map((answer, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(answer.score)}`}>
                      {answer.score}/10
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{answer.question}</p>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Your Answer:</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{answer.answer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Feedback:</p>
                  <p className="text-gray-700">{answer.feedback}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => navigate('/candidate/interview')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 flex items-center space-x-2"
        >
          <FiRefreshCw className="h-5 w-5" />
          <span>Take Another Interview</span>
        </button>
      </div>
    </div>
  );
};

export default CandidateInterviewResultsPage;

import React, { useState, useEffect } from 'react';
import { FiMic, FiPlay, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiUpload, FiFileText } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import interviewService from '../../services/interviewService';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';

const CandidateInterviewPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeText, setResumeText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    loadHistory();
    loadResume();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await interviewService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load interview history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResume = async () => {
    try {
      console.log('🔵 Loading resume from profile...');
      const profileResponse = await api.get('/ats/candidate-profile');
      console.log('🔵 Profile response:', profileResponse.data);

      // Check if resume exists in any form
      const hasRawText = profileResponse.data?.raw_text && profileResponse.data.raw_text.length > 50;
      const hasSkills = profileResponse.data?.skills && Array.isArray(profileResponse.data.skills) && profileResponse.data.skills.length > 0;
      const hasSummary = profileResponse.data?.summary && profileResponse.data.summary.length > 50;

      console.log('🔵 hasRawText:', hasRawText);
      console.log('🔵 hasSkills:', hasSkills);
      console.log('🔵 hasSummary:', hasSummary);

      // Try multiple fields for resume text
      let resumeText = profileResponse.data?.raw_text ||
                       (hasSkills ? profileResponse.data.skills.join(', ') : '') ||
                       profileResponse.data?.summary ||
                       '';

      console.log('🔵 Extracted resume text length:', resumeText.length);
      console.log('🔵 Resume text preview:', resumeText.substring(0, 100));

      if (resumeText.length > 50) {
        setResumeText(resumeText);
        console.log('✅ Resume loaded successfully');
      } else {
        console.log('🔴 Resume text too short or empty, showing upload option');
        setShowUpload(true);
      }
    } catch (error) {
      console.error('🔴 Failed to load resume from profile:', error);
      setShowUpload(true);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/ats/candidate-profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('🔵 Resume upload response:', response.data);

      // Reload profile to get the parsed resume text
      const profileResponse = await api.get('/ats/candidate-profile');
      const newResumeText = profileResponse.data?.raw_text || profileResponse.data?.summary || '';

      if (newResumeText.length > 50) {
        setResumeText(newResumeText);
        setShowUpload(false);
        alert('Resume uploaded successfully!');
      } else {
        alert('Resume uploaded but could not extract text. Please try again.');
      }
    } catch (error) {
      console.error('🔴 Failed to upload resume:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const startInterview = async () => {
    if (!resumeText) {
      alert('Please complete your profile with resume text first.');
      navigate('/candidate/profile');
      return;
    }

    setGenerating(true);
    try {
      const response = await interviewService.generateInterview({
        resume_text: resumeText,
        question_count: questionCount,
        job_id: null
      });
      navigate(`/candidate/interview/session/${response.interview_id}`, {
        state: { questions: response.questions }
      });
    } catch (error) {
      console.error('Failed to generate interview:', error);
      alert('Failed to generate interview. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const viewResults = (interviewId) => {
    navigate(`/candidate/interview/results/${interviewId}`);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4">
          <FiMic className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          AI Interview Simulator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Practice your interview skills with AI-generated questions tailored to your resume and experience.
        </p>
      </div>

      {/* Start Interview Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Start New Interview</h2>
            <p className="text-gray-600">
              AI will generate personalized questions based on your resume
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
              <div className="flex gap-3">
                {[5, 10, 15].map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      questionCount === count
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <FiCheckCircle className="h-4 w-4 mr-1 text-green-500" />
                {questionCount} Questions
              </span>
              <span className="flex items-center">
                <FiClock className="h-4 w-4 mr-1 text-blue-500" />
                2 min/question
              </span>
              <span className="flex items-center">
                <FiRefreshCw className="h-4 w-4 mr-1 text-purple-500" />
                AI Evaluation
              </span>
            </div>
          </div>
          <button
            onClick={startInterview}
            disabled={generating || !resumeText}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {generating ? (
              <>
                <Loader size="sm" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FiPlay className="h-5 w-5" />
                <span>Start Interview</span>
              </>
            )}
          </button>
        </div>
        {showUpload && !resumeText && (
          <div className="mt-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 p-6">
            <div className="flex flex-col items-center text-center">
              <FiFileText className="h-12 w-12 text-indigo-400 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Upload Resume for Interview</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your resume to start the AI interview
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                <FiUpload className="h-4 w-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Resume'}</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
        {resumeText && (
          <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            <p className="font-medium">✅ Resume found</p>
            <p className="text-xs text-green-700 mt-1">{resumeText.substring(0, 100)}...</p>
          </div>
        )}
      </div>

      {/* Interview History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Interview History</h2>
        {history.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
            <FiMic className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No interviews completed yet</p>
            <p className="text-sm text-gray-400">Start your first interview to see results here</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item) => (
              <div
                key={item.interview_id}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => item.status === 'completed' && viewResults(item.interview_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    {item.score !== null && (
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">{item.score}%</span>
                        {item.score >= 75 && (
                          <span className="text-sm text-green-600 font-medium">Good Performance</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status === 'completed' ? (
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <FiXCircle className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateInterviewPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiSend, FiMic } from 'react-icons/fi';
import interviewService from '../../services/interviewService';
import Loader from '../../components/common/Loader';

const CandidateInterviewSessionPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { questions: initialQuestions } = location.state || { questions: [] };

  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!questions.length) {
      navigate('/candidate/interview');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const currentQuestion = questions[currentQuestionIndex];
      await interviewService.submitAnswer({
        interview_id: interviewId,
        question_id: currentQuestion.id,
        answer: answer
      });

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setAnswer('');
        setTimeLeft(120);
      } else {
        setCompleted(true);
        // Auto evaluate after last question
        await interviewService.evaluateInterview(interviewId);
        navigate(`/candidate/interview/results/${interviewId}`);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/candidate/interview')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center space-x-2">
          <FiClock className="h-5 w-5 text-indigo-600" />
          <span className={`font-mono text-lg ${timeLeft <= 30 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
              currentQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {currentQuestion.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
              {currentQuestion.category}
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900">
            {currentQuestion.question}
          </h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-700"
            disabled={submitting || completed}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FiMic className="h-4 w-4" />
              <span>Voice input coming soon</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || completed || !answer.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader size="sm" />
                  <span>Submitting...</span>
                </>
              ) : currentQuestionIndex < questions.length - 1 ? (
                <>
                  <span>Next Question</span>
                  <FiArrowLeft className="h-5 w-5 rotate-180" />
                </>
              ) : (
                <>
                  <span>Complete Interview</span>
                  <FiSend className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3">Tips for answering:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start space-x-2">
            <span className="text-indigo-600">•</span>
            <span>Be specific and provide examples from your experience</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-600">•</span>
            <span>Use the STAR method (Situation, Task, Action, Result)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-600">•</span>
            <span>Keep your answer concise but comprehensive</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-600">•</span>
            <span>Manage your time wisely - you have 2 minutes per question</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CandidateInterviewSessionPage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import RecruiterNavbar from '../components/layout/RecruiterNavbar';
import CandidateNavbar from '../components/layout/CandidateNavbar';
import { FiRepeat } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DashboardLayout = ({ children }) => {
  const { user, isRecruiter, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleToggleRole = () => {
    const nextRole = isRecruiter ? 'candidate' : 'recruiter';
    switchRole(nextRole);
    navigate(nextRole === 'recruiter' ? '/recruiter' : '/candidate');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Role-specific navbar */}
      {isRecruiter ? <RecruiterNavbar /> : <CandidateNavbar />}

      {/* Role Switcher Banner */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-1.5 flex items-center justify-center">
        <button
          onClick={handleToggleRole}
          className="flex items-center space-x-2 text-xs font-semibold text-indigo-700 hover:text-blue-900 transition-colors"
        >
          <FiRepeat className="h-3.5 w-3.5" />
          <span>Switch to {isRecruiter ? 'Candidate Portal' : 'Recruiter Hub'}</span>
        </button>
      </div>

      {/* Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

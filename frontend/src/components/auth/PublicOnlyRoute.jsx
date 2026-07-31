import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from '../common/Loader';

const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  // If already authenticated, redirect to their role dashboard using replace: true
  if (isAuthenticated && user) {
    const targetDashboard = user.role === 'recruiter' ? '/recruiter' : '/candidate';
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
};

export default PublicOnlyRoute;

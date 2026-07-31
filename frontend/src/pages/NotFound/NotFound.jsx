import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const NotFound = () => {
  useDocumentTitle('Page Not Found');
  const { isAuthenticated, user } = useAuth();

  const homeHref = isAuthenticated
    ? user?.role === 'recruiter' ? '/recruiter' : '/candidate'
    : '/';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-5 max-w-sm">
        <div className="text-8xl font-black text-gray-200 leading-none select-none">404</div>
        <h1 className="text-2xl font-black text-gray-900">Page not found</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={homeHref}
          className="inline-flex items-center px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
        >
          ← Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
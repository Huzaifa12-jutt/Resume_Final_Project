import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const Unauthorized = () => {
  useDocumentTitle('Access Denied');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (user?.role === 'recruiter') {
      navigate('/recruiter', { replace: true });
    } else if (user?.role === 'candidate') {
      navigate('/candidate', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl max-w-md w-full text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <ShieldOff size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">403 — Access Denied</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          You don't have authorization to view this area. Your current account role is{' '}
          <strong className="text-slate-900 capitalize">{user?.role || 'Guest'}</strong>.
        </p>
        <div className="pt-4">
          <Button onClick={handleReturn} className="w-full shadow-md shadow-indigo-600/20" icon={ArrowLeft}>
            Return to your workspace
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

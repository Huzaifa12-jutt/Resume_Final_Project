import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const Login = () => {
  useDocumentTitle('Sign In');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('recruiter');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      const redirectPath = location.state?.from?.pathname || (user.role === 'recruiter' ? '/recruiter' : '/candidate');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      // Error handled by AuthContext
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your TalentLense account to continue.">
      {/* Role Toggle Selector */}
      <div className="mb-6 bg-slate-100 p-1 rounded-xl flex">
        <button
          type="button"
          onClick={() => setRole('recruiter')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            role === 'recruiter' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Recruiter / HR
        </button>
        <button
          type="button"
          onClick={() => setRole('candidate')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            role === 'candidate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Candidate / Job Seeker
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="you@company.com"
              {...register('email', { required: 'Email address is required' })}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-900">Password</label>
            <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            {...register('rememberMe')}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Remember me
        </label>

        <Button type="submit" size="lg" className="w-full mt-1 shadow-md shadow-indigo-600/20" isLoading={isSubmitting}>
          Sign In as {role === 'recruiter' ? 'Recruiter' : 'Candidate'} <ArrowRight size={16} className="ml-1.5" />
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;

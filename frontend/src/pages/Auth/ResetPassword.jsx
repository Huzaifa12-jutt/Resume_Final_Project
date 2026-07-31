import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, CheckCircle2, Mail, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const ResetPassword = () => {
  useDocumentTitle('Reset Password');
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: searchParams.get('email') || '',
      code: searchParams.get('code') || '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword({
        email: data.email,
        code: data.code,
        password: data.password,
      });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error?.message || 'Unable to reset password.');
    }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong new password for your account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email', { required: 'Email address is required' })}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">Reset Code</label>
          <div className="relative">
            <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter reset code"
              {...register('code', { required: 'Reset code is required' })}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
          {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full mt-2 shadow-md shadow-indigo-600/20" isLoading={isSubmitting} icon={CheckCircle2}>
          Update Password & Sign In
        </Button>
      </form>

      <div className="mt-8 text-center text-sm">
        <Link to="/login" className="text-slate-500 hover:text-slate-900 font-medium">
          Cancel and return to login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;

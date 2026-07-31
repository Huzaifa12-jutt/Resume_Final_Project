import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Send, MailCheck, ArrowLeft, ShieldCheck, Lock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: 'Bank-level encryption' },
  { icon: Lock, text: 'Password never exposed' },
  { icon: Zap, text: 'Reset in under 60 seconds' },
];

const ForgotPassword = () => {
  useDocumentTitle('Forgot Password');
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword({ email: data.email });
      setSentEmail(data.email);
      setSubmitted(true);
      toast.success(`Reset instructions sent to ${data.email}`);
    } catch (error) {
      toast.error(error?.message || 'Unable to send reset instructions. Please try again.');
    }
  };

  return (
    <AuthLayout
      title={submitted ? 'Check your inbox' : 'Forgot your password?'}
      subtitle={
        submitted
          ? undefined
          : "Enter your email and we'll send a reset code so you can get back into your account quickly."
      }
    >
      {!submitted ? (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  autoFocus
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-1 shadow-md shadow-indigo-600/20"
              isLoading={isSubmitting}
              icon={Send}
            >
              Send Reset Instructions
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                  <Icon size={16} />
                </div>
                <span className="text-sm font-medium text-slate-600">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-medium">
              <ArrowLeft size={15} />
              Back to Sign In
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <MailCheck size={30} className="text-emerald-600" />
          </div>

          <p className="text-sm leading-6 text-slate-500 max-w-xs">
            We've sent a password reset link to{' '}
            <strong className="text-slate-900">{sentEmail}</strong>. Click the link inside to set a new password.
          </p>

          <div className="w-full rounded-2xl bg-slate-50 p-4 text-left">
            <p className="mb-2 text-xs font-semibold text-slate-700">Didn't receive it?</p>
            <ul className="list-disc space-y-1.5 pl-4 text-xs leading-5 text-slate-500">
              <li>Check your spam or junk folder</li>
              <li>Make sure the email address is correct</li>
              <li>The link expires in 15 minutes</li>
            </ul>
          </div>

          <button
            type="button"
            className="text-sm font-medium text-indigo-600 hover:underline"
            onClick={() => setSubmitted(false)}
          >
            Try a different email
          </button>

          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 font-medium">
            <ArrowLeft size={15} />
            Back to Sign In
          </Link>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
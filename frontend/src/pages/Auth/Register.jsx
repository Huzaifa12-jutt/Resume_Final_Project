import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, BriefcaseBusiness, UserRound, CheckCircle2, UserPlus } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const roleOptions = [
  {
    value: 'recruiter',
    label: 'Recruiter',
    desc: 'Manage jobs, upload resumes, rank candidates, and hire talent.',
    icon: BriefcaseBusiness,
  },
  {
    value: 'candidate',
    label: 'Candidate',
    desc: 'Create your profile, upload your resume, and apply for jobs.',
    icon: UserRound,
  },
];

const Register = () => {
  useDocumentTitle('Create Account');
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerAuth(data.name, data.email, data.password, role);
      navigate('/verify-email', { state: { email: data.email }, replace: true });
    } catch (error) {
      // Handled by AuthContext
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join thousands of recruiters and job seekers using TalentLense."
      sideTitle="Join TalentLense"
      sideText="Register as a recruiter to manage hiring, or a candidate to apply for roles — every account keeps one role for good."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Alex Morgan"
              {...register('name', { required: 'Full name is required' })}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {role === 'recruiter' && (
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">Company Name</label>
            <div className="relative">
              <BriefcaseBusiness size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Acme Corp"
                {...register('companyName', { required: 'Company name is required' })}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
              />
            </div>
            {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
          </div>
        )}

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
          <label className="block text-sm font-medium text-slate-900 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">Confirm Password</label>
          <div className="relative">
            <CheckCircle2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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

        {/* Role selection — required, single choice */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Role Selection</label>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((r) => {
              const selected = role === r.value;
              return (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`text-left rounded-2xl border p-4 transition-all ${
                    selected ? 'border-indigo-600 bg-indigo-50/60 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${
                      selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <r.icon size={18} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{r.label}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{r.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full mt-2 shadow-md shadow-indigo-600/20" isLoading={isSubmitting} icon={UserPlus}>
          Create Account
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;

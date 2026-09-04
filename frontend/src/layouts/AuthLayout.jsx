import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import TeeropLogo from '../components/common/TeeropLogo';

const AuthLayout = ({
  children,
  title,
  subtitle,
  sideTitle = 'Hire smarter, not harder.',
  sideText = 'TEEROP parses, ranks, and surfaces your best candidates in seconds — so you can focus on people, not paperwork.',
}) => {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column: gradient branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 via-blue-800/40 to-blue-600/30" />

        <Link to="/" className="relative z-10 flex items-center">
          <TeeropLogo size="md" tone="light" />
        </Link>

        {/* Floating proof cards */}
        <div className="relative z-10 flex flex-col items-center gap-4 py-6">
          <div className="w-full max-w-sm rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Top match</p>
                <p className="text-base font-semibold">Sarah Chen</p>
              </div>
              <span className="text-2xl font-extrabold text-white">96%</span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-white/70">Senior Product Designer</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-white to-blue-200" />
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl bg-white/95 text-slate-900 shadow-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-bold">Resume parsed</p>
              <p className="text-[11px] text-slate-400">12 skills detected · 5 yrs experience</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          <h1 className="text-3xl font-bold leading-tight">{sideTitle}</h1>
          <p className="text-blue-100 text-sm leading-relaxed max-w-sm">{sideText}</p>
          <p className="pt-6 text-xs text-blue-200/70">© {new Date().getFullYear()} TEEROP. All rights reserved.</p>
        </div>
      </div>

      {/* Right Column: form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-16 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link to="/" className="lg:hidden flex items-center mb-6">
              <TeeropLogo size="md" />
            </Link>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

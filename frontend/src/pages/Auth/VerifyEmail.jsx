import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, RotateCw, LayoutDashboard, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../layouts/AuthLayout';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const VerifyEmail = () => {
  useDocumentTitle('Verify Email');
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmailCode, resendCode } = useAuth();

  const email = location.state?.email || 'you@company.com';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);

  /* countdown */
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  /* OTP input helpers */
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = [...digits];
    text.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      toast.error('Please enter all 6 digits.');
      return;
    }
    setIsVerifying(true);
    try {
      await verifyEmailCode(email, code);
      setIsSuccess(true);
      // Token is now saved by AuthContext, navigate directly to dashboard
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch {
      /* handled by AuthContext */
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    await resendCode(email);
    setTimer(45);
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <AuthLayout
      title={isSuccess ? 'Email verified!' : 'Verify your email'}
      subtitle={
        isSuccess
          ? "Your account has been successfully verified. Redirecting you to sign in shortly."
          : undefined
      }
    >
      {isSuccess ? (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle2 size={30} className="text-emerald-600" />
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full origin-left animate-[verifyfill_2.4s_ease-out_forwards] rounded-full bg-emerald-500" />
          </div>

          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <LayoutDashboard size={16} />
            Continue to Sign In
          </button>

          <style>{`@keyframes verifyfill { from { width: 0%; } to { width: 100%; } }`}</style>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <ShieldCheck size={18} />
            </div>
            <p className="text-sm text-slate-600">
              We sent a six digit verification code to <strong className="text-slate-900">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} noValidate className="space-y-6">
            <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  autoComplete="one-time-code"
                  className={`h-14 w-12 rounded-xl border text-center text-xl font-bold text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 ${d ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50'
                    }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-70"
            >
              {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {isVerifying ? 'Verifying…' : 'Verify Email'}
            </button>

            <div className="flex flex-col items-center gap-2">
              {timer > 0 ? (
                <p className="text-sm text-slate-500">Resend code in {timer}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
                >
                  <RotateCw size={13} />
                  Resend Code
                </button>
              )}

              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <span>Wrong email?</span>
                <Link to="/register" className="font-medium text-indigo-600 hover:underline">
                  Change Email
                </Link>
              </div>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  );
};

export default VerifyEmail;
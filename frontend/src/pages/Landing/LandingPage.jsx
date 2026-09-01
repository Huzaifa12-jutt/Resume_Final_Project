import React, { useEffect, useState } from 'react';
import { href, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Aperture,
  Award,
  Bot,
  CheckCircle2,
  FileText,
  Globe,
  Layers,
  MessageCircle,
  ListChecks,
  ListOrdered,
  Menu,
  PieChart,
  PlayCircle,
  ScanEye,
  Sparkles,
  Star,
  TrendingUp,
  AtSign,
  Upload as UploadIcon,
  UserCheck,
  X,
} from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import FeaturedJobsCarousel from '../../components/jobs/FeaturedJobsCarousel';

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Jobs', href: '#jobs' },
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Contact', href: '#contact' },
];

const companies = ['TEEROP', 'Apex', 'UrbanNest', 'Nexa', 'Vanta', 'Orbit'];

const features = [
  { icon: FileText, title: 'AI Resume Parsing', description: 'Instantly extract skills, experience, and education into clean structured data from any resume format.' },
  { icon: ListChecks, title: 'AI Candidate Ranking', description: 'Automatically score and rank applicants against your job description with explainable match insights.' },
  { icon: UploadIcon, title: 'Bulk Resume Upload', description: 'Drop in hundreds of resumes at once and let TalentLense process the entire batch in the background.' },
  { icon: Layers, title: 'Smart Job Description Generator', description: 'Generate clear, structured job descriptions from a short prompt about the role you need to fill.' },
  { icon: Bot, title: 'AI HR Assistant', description: 'Chat with an intelligent assistant to compare candidates, draft outreach, and answer hiring questions.' },
  { icon: PieChart, title: 'Application Tracking', description: "Track every applicant's status from submission to offer in one clean, modern dashboard." },
];

const steps = [
  { icon: UploadIcon, title: 'Create Job', desc: 'Describe the role and let TalentLense draft the requirements with you.' },
  { icon: ScanEye, title: 'Upload Resumes', desc: 'Add resumes one at a time or receive them directly from applicants.' },
  { icon: ListOrdered, title: 'AI Analysis', desc: 'Every resume is parsed and scored against the role automatically.' },
  { icon: UserCheck, title: 'Hire Best Candidate', desc: 'Review ranked profiles and move forward with confidence.' },
];

const testimonials = [
  { name: 'Britt Mercer', role: 'Head of Talent, Quantum', quote: 'TEEROP cut our screening time dramatically. We spend our energy talking to great people instead of sorting PDFs.' },
  { name: 'Daniel Reyes', role: 'Recruiting Lead, Vertex', quote: 'The AI ranking is remarkably accurate and the assistant feels like a real teammate on the hiring team.' },
  { name: 'Priya Nair', role: 'Founder, Stackly', quote: 'We went from a spreadsheet of resumes to a ranked shortlist in minutes. It changed how we hire.' },
];

export function TeeropLogo({ large = false }) {
  // Dynamically scale both the icon and the text based on the 'large' prop
  const containerClass = large ? 'flex items-center gap-3 sm:gap-4' : 'flex items-center gap-2 sm:gap-2.5';
  const iconSize = large ? 'w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16' : 'w-7 h-7 sm:w-8 sm:h-8';
  const textSize = large
    ? 'text-[2.2rem] sm:text-[3.2rem] lg:text-[4.25rem]'
    : 'text-[1.1rem] sm:text-[1.2rem]';

  return (
    <div className={`select-none ${containerClass}`}>
      {/* Custom SVG Brand Icon */}
      <svg
        className={`${iconSize} drop-shadow-md shrink-0`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="teeropPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />   {/* Cyan 500 */}
            <stop offset="100%" stopColor="#2563eb" /> {/* Blue 600 */}
          </linearGradient>
          <linearGradient id="teeropSecondary" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" />   {/* Teal 500 */}
            <stop offset="100%" stopColor="#0ea5e9" /> {/* Sky 500 */}
          </linearGradient>
        </defs>

        {/* Outer Hexagon - Represents structured data and process */}
        <path
          d="M50 5 L89 27.5 V72.5 L50 95 L11 72.5 V27.5 Z"
          fill="url(#teeropPrimary)"
          fillOpacity="0.12"
        />
        <path
          d="M50 5 L89 27.5 V72.5 L50 95 L11 72.5 V27.5 Z"
          stroke="url(#teeropPrimary)"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Inner Stylized 'T' - Represents the brand and technical precision */}
        <path
          d="M32 32 H68 A 4 4 0 0 1 72 36 V44 A 4 4 0 0 1 68 48 H56 V68 A 4 4 0 0 1 52 72 H48 A 4 4 0 0 1 44 68 V48 H32 A 4 4 0 0 1 28 44 V36 A 4 4 0 0 1 32 32 Z"
          fill="url(#teeropSecondary)"
        />

        {/* Core Node - Represents AI intelligence/focus */}
        <circle cx="50" cy="50" r="4" fill="#ffffff" className="animate-pulse" />
      </svg>

      {/* Brand Wordmark Typography */}
      <span
        className={`font-black leading-none uppercase ${textSize}`}
        style={{
          letterSpacing: large ? '-0.065em' : '-0.04em',
          background: 'linear-gradient(90deg, #06b6d4 0%, #14b8a6 26%, #0ea5e9 48%, #2563eb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 12px 28px rgba(6, 182, 212, 0.15)',
        }}
      >
        TEEROP
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navbar — sticky, blurred, smooth-scroll with active-section state   */
/* ------------------------------------------------------------------ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks.map((l) => document.querySelector(l.href)).filter(Boolean);
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      {
        rootMargin: '-20% 0px -50% 0px',
        threshold: 0,
      }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href) => (e) => {
    e.preventDefault();

    setActive(href); // <-- add this

    document.querySelector(href)?.scrollIntoView({
      behavior: 'smooth',
    });

    setOpen(false);
  };
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="transition hover:opacity-90">
          <TeeropLogo />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={scrollTo(link.href)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${active === link.href ? 'text-teal-600 bg-teal-50' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
            Login
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:shadow-xl hover:shadow-teal-600/30 hover:scale-105"
          >
            Get Started
          </Link>
        </div>

        <button onClick={() => setOpen((v) => !v)} className="md:hidden p-2 text-slate-600" aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-6 space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={scrollTo(link.href)} className="block text-sm font-semibold text-slate-700">
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/login" onClick={() => setOpen(false)} className="w-full text-center rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700">
              Login
            </Link>
            <Link to="/register" onClick={() => setOpen(false)} className="w-full text-center rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  useDocumentTitle('Home', false);
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>
        {/* Hero */}
        <section id="home" className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_82%_8%,_rgba(37,99,235,0.12),_transparent_24%),radial-gradient(circle_at_50%_80%,_rgba(125,211,252,0.12),_transparent_32%)]" />
          <div className="pointer-events-none absolute -left-16 top-20 h-72 w-72 rounded-full bg-sky-200/20 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-12 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
           {/* LEFT COLUMN: Text and Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700 shadow-sm backdrop-blur-sm">
                <Sparkles size={12} /> Professional AI hiring platform
              </span>

              <div className="mt-6">
                <TeeropLogo large={true} />
              </div>

              <h1 className="mt-5 text-[2.65rem] sm:text-[3.6rem] lg:text-[5rem] font-black text-slate-900 tracking-[-0.07em] leading-[0.9]">
                Hire smarter,<br className="hidden sm:block" /> <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 bg-clip-text text-transparent">faster, and with more clarity.</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                TEEROP helps modern teams screen resumes, rank candidates against the role, and move the right talent forward with AI-powered hiring intelligence.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/register?role=candidate"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-700 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-sky-500/20 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/25 w-full sm:w-auto justify-center"
                >
                  Apply as candidate <ArrowRight size={18} />
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-8 py-3.5 text-base font-bold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30 w-full sm:w-auto justify-center"
                >
                  <PlayCircle size={18} /> Explore jobs
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
                  <CheckCircle2 size={14} className="text-sky-600" /> 4x faster screening
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
                  <CheckCircle2 size={14} className="text-sky-600" /> Real-time ranking
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Animated UI Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-5 relative"
            >
              {/* Outer Card Wrapper - Continuous floating animation */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative rounded-[2rem] border border-slate-200/80 bg-slate-950 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
              >
                <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-cyan-200/20 via-sky-200/10 to-blue-200/20 blur-2xl" />
                <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-700 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                  <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-sky-200 shadow-[0_0_18px_rgba(186,230,253,0.9)]" />
                  <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-sky-200/20 blur-3xl" />

                  <div className="relative flex min-h-[300px] flex-col justify-between">
                    <div className="flex items-center justify-between text-white/90">
                      <span className="text-[10px] font-bold uppercase tracking-[0.26em]">TEEROP</span>
                      <motion.span 
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em]"
                      >
                        Live
                      </motion.span>
                    </div>

                    {/* Animated Big Text */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6, ease: 'backOut' }}
                      className="space-y-3 pt-6"
                    >
                      <span
                        className="block text-[4.2rem] sm:text-[4.7rem] font-black uppercase leading-none tracking-[-0.08em] text-white drop-shadow-[0_10px_20px_rgba(14,116,144,0.35)]"
                        style={{ textShadow: '0 12px 28px rgba(14, 116, 144, 0.35)' }}
                      >
                        TEEROP
                      </span>
                    </motion.div>

                    <div className="rounded-2xl border border-white/20 bg-slate-950/20 p-3 backdrop-blur-sm mt-8">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-cyan-50/90">
                        <span>match score</span>
                        <motion.span
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ delay: 1.6 }}
                        >
                          98%
                        </motion.span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                        {/* Animated Progress Bar Fill */}
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: "98%" }}
                          transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                          className="h-full rounded-full bg-white" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm overflow-hidden">
                  {/* Candidate 1 - Slides in */}
                  <motion.div 
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.5, ease: 'easeOut' }}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">#1</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                        <p className="text-[10px] text-slate-500">React · TypeScript · Next.js</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-cyan-700">96%</span>
                  </motion.div>

                  {/* Candidate 2 - Slides in slightly after */}
                  <motion.div 
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4, duration: 0.5, ease: 'easeOut' }}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">#2</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">David Chen</p>
                        <p className="text-[10px] text-slate-500">Vue · JavaScript · Tailwind</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-slate-700">84%</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Trusted by */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            Trusted by modern hiring teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-slate-400 font-semibold text-sm grayscale opacity-70">
            {companies.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>

        <section id="jobs" className="scroll-mt-24">
          <FeaturedJobsCarousel />
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50/50 via-indigo-50/30 to-purple-50/50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-sky-600">Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Everything you need to hire smarter</h2>
              <p className="text-slate-500 text-base">
                A complete AI toolkit that removes the manual work from screening and lets you focus on people.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-200"
                >
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-5 ${i % 3 === 0 ? 'bg-gradient-to-br from-sky-50 to-cyan-100 text-sky-700' :
                    i % 3 === 1 ? 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700' :
                      'bg-gradient-to-br from-cyan-50 to-sky-100 text-sky-700'
                    }`}>
                    <f.icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">How It Works</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">From upload to hire in four steps</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <div key={s.title} className="relative p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="h-8 w-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <s.icon size={18} className="text-indigo-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-slate-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose TalentLense — manual vs AI comparison */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Why Choose TEEROP</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Manual hiring vs. AI hiring</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Manual Hiring</h3>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li>Hours spent reading every resume by hand</li>
                  <li>Inconsistent, subjective evaluation criteria</li>
                  <li>Slow candidate feedback and follow-up</li>
                  <li>No clear visibility into pipeline health</li>
                </ul>
              </div>
              <div className="bg-indigo-50/40 rounded-2xl border-2 border-indigo-100 shadow-sm p-8">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-4">AI Hiring with TEEROP</h3>
                <ul className="space-y-3 text-sm text-slate-700 font-medium">
                  <li>Resumes parsed and ranked in seconds</li>
                  <li>Consistent, explainable scoring for every candidate</li>
                  <li>AI assistant answers questions instantly</li>
                  <li>Real-time analytics across every open role</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Testimonials</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Loved by hiring teams</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {t.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.name}</p>
                      <p className="text-[11px] text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto rounded-[2rem] bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-700 text-white p-10 sm:p-16 text-center shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.1),_transparent_50%),radial-gradient(circle_at_70%_80%,_rgba(255,255,255,0.08),_transparent_50%)]" />
            <Aperture className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-white/10" />
            <h2 className="relative text-3xl sm:text-4xl font-bold tracking-tight">Ready to Transform Your Hiring Process?</h2>
            <p className="relative mt-4 text-sky-100 max-w-xl mx-auto">
              Join hiring teams using TEEROP to find the best talent faster than ever before.
            </p>
            <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 hover:scale-105"
              >
                Start Recruiting <ArrowRight size={18} />
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/20 hover:scale-105"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
            <div>                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Contact Us</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Get in touch</h2>
              <p className="text-slate-500 mb-8">
                Have questions about TEEROP or want to see a personalized hiring workflow? Send us a message and our team will get back to you shortly.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <AtSign size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Email</p>
                    <a href="mailto:contact@teerop.com" className="text-sm hover:text-indigo-600 transition">contact@teerop.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Phone</p>
                    <a href="tel:+923195682932" className="text-sm hover:text-indigo-600 transition">+92 319 5682932</a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Address</p>
                    <p className="text-sm">Islamabad, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Thanks for reaching out! We will get back to you soon."); }}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                  <input type="text" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                  <textarea rows={4} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 resize-none"></textarea>
                </div>
                <button type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center text-white font-bold text-lg">
                <TeeropLogo />
              </div>
              <p className="text-xs leading-relaxed">AI-powered applicant tracking for modern hiring teams.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
              <div className="flex gap-3">
                <a href="mailto:hello@talentlense.com" className="p-2 rounded-lg bg-slate-800 hover:text-white" aria-label="Contact"><AtSign size={16} /></a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span>© {new Date().getFullYear()} TEEROP. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

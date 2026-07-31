import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import LensMark from '../../components/common/LensMark';
import useDocumentTitle from '../../hooks/useDocumentTitle';

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Contact', href: '#contact' },
];

const companies = ['Northwind', 'Quantum', 'Stackly', 'Nebula', 'Vertex', 'Orbital'];

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
  { name: 'Britt Mercer', role: 'Head of Talent, Quantum', quote: '                TalentLense cut our screening time dramatically. We spend our energy talking to great people instead of sorting PDFs.' },
  { name: 'Daniel Reyes', role: 'Recruiting Lead, Vertex', quote: 'The AI ranking is remarkably accurate and the assistant feels like a real teammate on the hiring team.' },
  { name: 'Priya Nair', role: 'Founder, Stackly', quote: 'We went from a spreadsheet of resumes to a ranked shortlist in minutes. It changed how we hire.' },
];

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
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href) => (e) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center">
            <LensMark size={16} tone="light" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">TalentLense</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={scrollTo(link.href)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${active === link.href ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
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
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,_rgba(37,99,235,0.08),_transparent_45%),radial-gradient(circle_at_85%_0%,_rgba(79,70,229,0.08),_transparent_40%)]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Sparkles size={12} /> Powered by AI Resume Ranking Engine
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
                Find the Right Talent <span className="text-indigo-600">Faster with AI</span>
              </h1>

              <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                TalentLense screens resumes, ranks candidates against your job description, and surfaces
                your best applicants in seconds — so your team can focus on people, not paperwork.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 w-full sm:w-auto justify-center"
                >
                  Get Started <ArrowRight size={18} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50 w-full sm:w-auto justify-center"
                >
                  <PlayCircle size={18} /> Learn More
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="lg:col-span-5 relative"
            >
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <Award size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">AI Match Engine</h4>
                      <p className="text-xs text-slate-400">Senior Frontend Engineer</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                    98% Match
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs items-center justify-center">#1</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                      <p className="text-[10px] text-slate-400">React, TypeScript, Next.js</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-indigo-700">96%</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs items-center justify-center">#2</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">David Chen</p>
                      <p className="text-[10px] text-slate-400">Vue, JavaScript, Tailwind</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-700">84%</span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/60 flex items-center gap-2 border border-indigo-100">
                  <TrendingUp size={16} className="text-indigo-600 shrink-0" />
                  <span className="text-xs text-indigo-700">Analytics update in real time as resumes are processed.</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 size={14} className="text-emerald-500" /> 12 skills detected · 5 yrs experience
                </div>
              </div>
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

        {/* Features */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Everything you need to hire smarter</h2>
              <p className="text-slate-500 text-base">
                A complete AI toolkit that removes the manual work from screening and lets you focus on people.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center mb-5">
                    <f.icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </div>
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
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Why Choose TalentLense</p>
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
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-4">AI Hiring with TalentLense</h3>
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
          <div className="max-w-5xl mx-auto rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 sm:p-16 text-center shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
            <Aperture className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-white/10" />
            <h2 className="relative text-3xl sm:text-4xl font-bold tracking-tight">Ready to Transform Your Hiring Process?</h2>
            <p className="relative mt-4 text-blue-100 max-w-xl mx-auto">
              Join hiring teams using TalentLense to find the best talent faster than ever before.
            </p>
            <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-slate-900 shadow-md transition hover:bg-slate-100"
              >
                Start Recruiting <ArrowRight size={18} />
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/20"
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
                Have questions about TalentLense or want to see a personalized demo? Send us a message and our team will get back to you shortly.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <AtSign size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Email</p>
                    <a href="mailto:hello@talentlense.com" className="text-sm hover:text-indigo-600 transition">hello@talentlens.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Office</p>
                    <p className="text-sm">San Francisco, CA</p>
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
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <LensMark size={14} tone="light" />
                </div>
                TalentLense
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
            <span>© {new Date().getFullYear()} TalentLense. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

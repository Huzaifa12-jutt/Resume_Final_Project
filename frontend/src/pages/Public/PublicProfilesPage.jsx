import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Building2, Mail, MapPin, Sparkles, Star } from 'lucide-react';

const candidateProfiles = [
  { name: 'Aisha Khan', role: 'Senior Product Designer', location: 'Islamabad', score: 96, skills: ['UX', 'Design Systems', 'Figma', 'Research'], accent: 'from-indigo-500 to-violet-500' },
  { name: 'Zain Malik', role: 'Full Stack Engineer', location: 'Lahore', score: 94, skills: ['React', 'Node.js', 'GraphQL', 'AI'], accent: 'from-teal-500 to-cyan-500' },
  { name: 'Sana Rahman', role: 'Growth Strategist', location: 'Karachi', score: 91, skills: ['Marketing', 'SEO', 'Lifecycle', 'Analytics'], accent: 'from-amber-500 to-orange-500' },
];

const hiringProfiles = [
  { name: 'Hassan Noor', role: 'Head of People', location: 'Remote', expertise: 'Talent strategy', accent: 'from-pink-500 to-rose-500' },
  { name: 'Nadia Ali', role: 'Hiring Manager', location: 'Dubai', expertise: 'Product hiring', accent: 'from-emerald-500 to-teal-500' },
  { name: 'Omar Siddiq', role: 'Talent Partner', location: 'Remote', expertise: 'AI & platform teams', accent: 'from-violet-500 to-purple-500' },
];

export default function PublicProfilesPage() {
  const [activeTab, setActiveTab] = useState('candidates');

  const profiles = useMemo(
    () => (activeTab === 'candidates' ? candidateProfiles : hiringProfiles),
    [activeTab]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">TalentLense</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/jobs" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300">Jobs</Link>
            <Link to="/login" className="rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200">Login</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">People directory</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Profiles that build trust before the first call.</h1>
          <p className="mt-4 mx-auto max-w-2xl text-slate-600">A polished public view for candidates and hiring teams makes the pipeline feel more credible and easier to navigate from the first touchpoint.</p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {[
              { id: 'candidates', label: 'Candidates' },
              { id: 'team', label: 'Hiring team' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <div key={profile.name} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${profile.accent} text-lg font-bold text-white`}>
                  {profile.name.split(' ').map((part) => part[0]).slice(0,2).join('')}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{profile.name}</h2>
                  <p className="text-sm text-slate-500">{profile.role || profile.expertise}</p>
                </div>
              </div>

              {activeTab === 'candidates' && (
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
                  <span className="flex items-center gap-2"><Star size={14} className="fill-current" /> Match score</span>
                  <span className="font-bold">{profile.score}%</span>
                </div>
              )}

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {profile.location}</p>
                <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {profile.email || 'hello@talentlense.ai'}</p>
                {activeTab === 'team' && (
                  <p className="flex items-center gap-2"><Building2 size={14} className="text-slate-400" /> {profile.expertise}</p>
                )}
              </div>

              {activeTab === 'candidates' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{skill}</span>
                  ))}
                </div>
              )}

              <div className="mt-5 border-t border-slate-100 pt-4">
                <Link to={activeTab === 'candidates' ? '/jobs' : '/jobs'} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                  {activeTab === 'candidates' ? 'View candidate profile' : 'Meet the hiring team'} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] border border-dashed border-indigo-200 bg-gradient-to-r from-indigo-50 to-teal-50 p-8 text-center">
          <BriefcaseBusiness className="mx-auto text-indigo-600" size={26} />
          <h3 className="mt-3 text-2xl font-bold text-slate-900">Need a more premium, company-branded profile experience?</h3>
          <p className="mt-2 text-sm text-slate-600">This layer is already structured for a real profile directory, team pages, and candidate spotlight cards without adding backend friction.</p>
        </section>
      </main>
    </div>
  );
}

import React from 'react';

const HowItWorks = () => {
  const steps = [
    { num: '01', title: 'Create Position', desc: 'Define job title, requirements, and key skills.' },
    { num: '02', title: 'Upload Resumes', desc: 'Drag and drop candidate PDF resumes in bulk.' },
    { num: '03', title: 'AI Analysis', desc: 'Our AI engine parses & evaluates skills semantically.' },
    { num: '04', title: 'Rank & Hire', desc: 'Review top candidate tiers, export data, and hire.' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Simple Process</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            How TEEROP Works
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
              <span className="text-4xl font-black text-indigo-600/30">{s.num}</span>
              <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

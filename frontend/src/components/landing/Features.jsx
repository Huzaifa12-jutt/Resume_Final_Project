import React from 'react';
import { FiFileText, FiAward, FiCpu, FiMessageSquare, FiPieChart, FiDownload } from 'react-icons/fi';
import Card from '../common/Card';

const Features = () => {
  const featureList = [
    {
      icon: FiFileText,
      title: 'AI Resume Parsing',
      description: 'Instantly extract structured skills, work experience, and education from PDF resumes.',
    },
    {
      icon: FiAward,
      title: 'Semantic Skill Ranking',
      description: 'Rank candidates based on contextual relevance and skill alignment, not simple keywords.',
    },
    {
      icon: FiCpu,
      title: 'Tier Classification',
      description: 'Automatically categorize applicants into Green (≥75%), Yellow (50-74%), and Red (<50%) match tiers.',
    },
    {
      icon: FiMessageSquare,
      title: 'AI HR Assistant',
      description: 'Ask natural language questions about applicants, candidate experience, or skill gaps.',
    },
    {
      icon: FiPieChart,
      title: 'Recruitment Analytics',
      description: 'Visual statistics for average match scores, score distribution, and top candidate highlights.',
    },
    {
      icon: FiDownload,
      title: 'CSV & Report Export',
      description: 'Export candidate rankings and analysis data in one click for hiring committee reviews.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50/50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Platform Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Everything You Need for Data-Driven Recruitment
          </p>
          <p className="text-base text-gray-500">
            Engineered to streamline modern recruitment workflows for talent acquisition teams and candidates alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

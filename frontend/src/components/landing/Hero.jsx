import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiCpu, FiAward, FiUsers } from 'react-icons/fi';
import Button from '../common/Button';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-white pt-12 pb-20 lg:pt-20 lg:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-bold tracking-wide uppercase">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Next-Gen AI Resume Screening Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-none">
              Screen <span className="text-indigo-600">100s of Resumes</span> in Seconds, Not Hours
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Transform your recruitment process with semantic skill matching, instant candidate rankings, and an interactive AI HR Assistant. Built for recruiters and job seekers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-indigo-500/25 px-8">
                  Get Started Free <FiArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">
                  Sign In to Portal
                </Button>
              </Link>
            </div>

            <div className="pt-6 flex items-center justify-center lg:justify-start space-x-6 text-xs font-semibold text-gray-500">
              <span className="flex items-center">
                <FiCheckCircle className="text-emerald-500 mr-1.5 h-4 w-4" /> No Credit Card Needed
              </span>
              <span className="flex items-center">
                <FiCheckCircle className="text-emerald-500 mr-1.5 h-4 w-4" /> Instant Setup
              </span>
              <span className="flex items-center">
                <FiCheckCircle className="text-emerald-500 mr-1.5 h-4 w-4" /> 100% Secure
              </span>
            </div>
          </div>

          {/* Right Hero Visual Cards */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <FiAward className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">AI Match Engine</h4>
                    <p className="text-xs text-gray-400">Senior Frontend Engineer</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                  98% Match
                </span>
              </div>

              {/* Sample Floating Candidate Row 1 */}
              <div className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between border border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="flex h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs items-center justify-center">
                    #1
                  </span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Sarah Jenkins</p>
                    <p className="text-[10px] text-gray-400">React, TypeScript, Next.js</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-indigo-700">96% Score</span>
              </div>

              {/* Sample Floating Candidate Row 2 */}
              <div className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between border border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="flex h-7 w-7 rounded-full bg-gray-200 text-gray-700 font-bold text-xs items-center justify-center">
                    #2
                  </span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">David Chen</p>
                    <p className="text-[10px] text-gray-400">Vue, JavaScript, Tailwind</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-gray-700">84% Score</span>
              </div>

              {/* Mini AI Chat prompt preview */}
              <div className="p-3 rounded-xl bg-indigo-50/60 text-xs text-indigo-700 flex items-center space-x-2 border border-indigo-100">
                <FiCpu className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="italic truncate">"AI: Sarah matches 9/9 required technical skills."</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

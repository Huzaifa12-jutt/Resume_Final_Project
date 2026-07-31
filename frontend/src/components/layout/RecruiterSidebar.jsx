import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiBriefcase,
  FiUsers,
  FiMessageSquare,
  FiSettings,
  FiPieChart,
} from 'react-icons/fi';

const RecruiterSidebar = ({ collapsed, onCloseMobile }) => {
  const links = [
    { to: '/recruiter', icon: FiGrid, label: 'Dashboard', end: true, gradient: 'from-blue-500 to-cyan-500' },
    { to: '/recruiter/jobs', icon: FiBriefcase, label: 'Job Positions', gradient: 'from-purple-500 to-pink-500' },
    { to: '/recruiter/candidates', icon: FiUsers, label: 'Candidates', gradient: 'from-emerald-500 to-teal-500' },
    { to: '/recruiter/analytics', icon: FiPieChart, label: 'Analytics', gradient: 'from-orange-500 to-amber-500' },
    { to: '/recruiter/chat', icon: FiMessageSquare, label: 'AI HR Chat', gradient: 'from-indigo-500 to-purple-500' },
    { to: '/recruiter/settings', icon: FiSettings, label: 'Settings', gradient: 'from-gray-500 to-slate-500' },
  ];

  return (
    <nav className="p-3 space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-r ${link.gradient} text-white shadow-lg shadow-gray-900/10 font-semibold transform scale-[1.02]`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default RecruiterSidebar;

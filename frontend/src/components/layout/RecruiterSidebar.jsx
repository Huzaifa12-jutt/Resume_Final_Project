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
    { to: '/recruiter', icon: FiGrid, label: 'Dashboard', end: true },
    { to: '/recruiter/jobs', icon: FiBriefcase, label: 'Job Positions' },
    { to: '/recruiter/candidates', icon: FiUsers, label: 'Candidates' },
    { to: '/recruiter/analytics', icon: FiPieChart, label: 'Analytics' },
    { to: '/recruiter/chat', icon: FiMessageSquare, label: 'AI HR Chat' },
    { to: '/recruiter/settings', icon: FiSettings, label: 'Settings' },
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
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
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

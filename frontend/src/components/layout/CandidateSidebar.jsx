import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiSearch,
  FiFileText,
  FiUser,
  FiSettings,
  FiBookmark,
} from 'react-icons/fi';

const CandidateSidebar = ({ collapsed, onCloseMobile }) => {
  const links = [
    { to: '/candidate', icon: FiGrid, label: 'Dashboard', end: true },
    { to: '/candidate/jobs', icon: FiSearch, label: 'Browse Jobs' },
    { to: '/candidate/applications', icon: FiFileText, label: 'Applications' },
    { to: '/candidate/saved-jobs', icon: FiBookmark, label: 'Saved Jobs' },
    { to: '/candidate/profile', icon: FiUser, label: 'My Resume & Profile' },
    { to: '/candidate/settings', icon: FiSettings, label: 'Settings' },
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

export default CandidateSidebar;

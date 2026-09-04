import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiSearch,
  FiFileText,
  FiUser,
  FiSettings,
  FiBookmark,
  FiMic,
  FiMessageSquare,
} from 'react-icons/fi';

const CandidateSidebar = ({ collapsed, onCloseMobile }) => {
  const links = [
    { to: '/candidate', icon: FiGrid, label: 'Dashboard', end: true },
    { to: '/candidate/jobs', icon: FiSearch, label: 'Browse Jobs' },
    { to: '/candidate/applications', icon: FiFileText, label: 'Applications' },
    { to: '/candidate/messages', icon: FiMessageSquare, label: 'Messages' },
    { to: '/candidate/saved', icon: FiBookmark, label: 'Saved Jobs' },
    { to: '/candidate/interview', icon: FiMic, label: 'AI Interview' },
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
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
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

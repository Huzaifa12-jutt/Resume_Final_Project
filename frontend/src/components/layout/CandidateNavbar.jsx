import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiSearch,
  FiFileText,
  FiUser,
  FiMessageSquare,
  FiBell,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';
import useMessagingUnread from '../../hooks/useMessagingUnread';
import NotificationDrawer from './NotificationDrawer';
import TeeropLogo from '../common/TeeropLogo';

const CandidateNavbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { unreadCount: msgUnreadCount } = useMessagingUnread();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const links = [
    { to: '/candidate', icon: FiGrid, label: 'Dashboard', end: true },
    { to: '/candidate/jobs', icon: FiSearch, label: 'Browse Jobs' },
    { to: '/candidate/applications', icon: FiFileText, label: 'Applications' },
    { to: '/candidate/messages', icon: FiMessageSquare, label: 'Messages', badge: msgUnreadCount },
    { to: '/candidate/profile', icon: FiUser, label: 'Resume' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/candidate" className="flex items-center">
          <TeeropLogo size="md" badge="Candidate Portal" />
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ml-0.5">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setNotifOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 relative rounded-xl hover:bg-gray-100 transition-colors"
          >
            <FiBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <span className="text-xs font-bold text-gray-900 max-w-[120px] truncate">{user?.name}</span>
              <FiChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                <Link
                  to="/candidate/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiUser className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </header>
  );
};

export default CandidateNavbar;

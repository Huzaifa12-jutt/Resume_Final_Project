import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiX, FiCheck, FiTrash2, FiCheckCircle,
  FiFileText, FiAward, FiSend, FiCalendar, FiAlertCircle,
} from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';

// ─── Relative time formatter ───────────────────────────────────────────────────
const relativeTime = (isoString) => {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// ─── Per-type icon config ──────────────────────────────────────────────────────
const TYPE_CONFIG = {
  upload:      { Icon: FiFileText,    bg: 'bg-indigo-50',    text: 'text-indigo-600' },
  ranking:     { Icon: FiAward,       bg: 'bg-amber-50',   text: 'text-amber-600' },
  application: { Icon: FiSend,        bg: 'bg-emerald-50', text: 'text-emerald-600' },
  interview:   { Icon: FiCalendar,    bg: 'bg-purple-50',  text: 'text-purple-600' },
  system:      { Icon: FiAlertCircle, bg: 'bg-gray-100',   text: 'text-gray-600' },
  default:     { Icon: FiBell,        bg: 'bg-gray-100',   text: 'text-gray-500' },
};

// ─── Individual Notification Card ─────────────────────────────────────────────
const NotifCard = ({ notif, onRead, onDelete }) => {
  const { Icon, bg, text } = TYPE_CONFIG[notif.type] || TYPE_CONFIG.default;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.18 }}
      onClick={() => onRead(notif.id)}
      className={`group relative flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-colors border ${
        notif.read
          ? 'bg-white border-gray-100 hover:bg-gray-50'
          : 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50'
      }`}
    >
      {/* Type Icon */}
      <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon className={`h-4 w-4 ${text}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-bold leading-snug ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
            {notif.title}
          </p>
          {/* Unread dot */}
          {!notif.read && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
          )}
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
          {notif.message}
        </p>
        <p className="text-[10px] font-medium text-gray-400 pt-0.5">
          {relativeTime(notif.timestamp)}
        </p>
      </div>

      {/* Delete on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
        aria-label="Delete notification"
      >
        <FiTrash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────
const NotificationPanel = ({ isOpen, onClose, anchorRef }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotifications();
  const panelRef = useRef(null);

  // Click-away close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden"
          style={{ maxHeight: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60 shrink-0">
            <div className="flex items-center gap-2">
              <FiBell className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-bold text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <FiCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear all"
                  className="text-[11px] font-semibold text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence mode="popLayout">
              {notifications.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 space-y-3 text-center"
                >
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <FiCheckCircle className="h-7 w-7 text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">You're all caught up!</p>
                  <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                    No new notifications right now. Check back later.
                  </p>
                </motion.div>
              ) : (
                notifications.map((notif) => (
                  <NotifCard
                    key={notif.id}
                    notif={notif}
                    onRead={markAsRead}
                    onDelete={clearNotification}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/40 shrink-0">
              <p className="text-[10px] text-center text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All notifications read'}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;

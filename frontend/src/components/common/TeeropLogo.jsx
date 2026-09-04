import React, { useId } from 'react';

/**
 * Official TEEROP brand logo component.
 *
 * @param {Object} props
 * @param {'full'|'icon'|'wordmark'} [props.variant='full'] - Logo display variant
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Visual size scale
 * @param {'auto'|'dark'|'light'} [props.tone='auto'] - 'light' for dark backgrounds, 'dark' for light backgrounds
 * @param {string} [props.badge] - Optional badge text (e.g. 'Candidate Portal', 'Recruiter Hub')
 * @param {string} [props.className=''] - Container class name
 * @param {boolean} [props.animated=false] - Whether central node has subtle pulse animation
 */
export default function TeeropLogo({
  variant = 'full',
  size = 'md',
  tone = 'auto',
  badge = null,
  className = '',
  animated = false,
}) {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const primaryGradId = `teerop-primary-${safeId}`;
  const secondaryGradId = `teerop-secondary-${safeId}`;

  // Sizing definitions
  const sizeMap = {
    xs: {
      icon: 'w-5 h-5',
      text: 'text-sm',
      gap: 'gap-1.5',
      badge: 'text-[9px] px-1.5 py-0.2',
    },
    sm: {
      icon: 'w-7 h-7',
      text: 'text-base sm:text-lg',
      gap: 'gap-2',
      badge: 'text-[10px] px-2 py-0.5',
    },
    md: {
      icon: 'w-8 h-8 sm:w-9 sm:h-9',
      text: 'text-lg sm:text-xl',
      gap: 'gap-2.5',
      badge: 'text-[10px] px-2 py-0.5',
    },
    lg: {
      icon: 'w-11 h-11 sm:w-12 sm:h-12',
      text: 'text-2xl sm:text-3xl',
      gap: 'gap-3',
      badge: 'text-xs px-2.5 py-1',
    },
    xl: {
      icon: 'w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20',
      text: 'text-3xl sm:text-5xl lg:text-6xl',
      gap: 'gap-3 sm:gap-4',
      badge: 'text-xs sm:text-sm px-3 py-1',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const isLightTone = tone === 'light';

  // SVG Geometric Hexagon Node mark
  const renderIcon = () => (
    <svg
      className={`${currentSize.icon} shrink-0 drop-shadow-xs`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={primaryGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={secondaryGradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      {/* Outer Hexagon */}
      <path
        d="M50 5 L89 27.5 V72.5 L50 95 L11 72.5 V27.5 Z"
        fill={`url(#${primaryGradId})`}
        fillOpacity={isLightTone ? '0.22' : '0.12'}
      />
      <path
        d="M50 5 L89 27.5 V72.5 L50 95 L11 72.5 V27.5 Z"
        stroke={`url(#${primaryGradId})`}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Inner Stylized 'T' */}
      <path
        d="M32 32 H68 A 4 4 0 0 1 72 36 V44 A 4 4 0 0 1 68 48 H56 V68 A 4 4 0 0 1 52 72 H48 A 4 4 0 0 1 44 68 V48 H32 A 4 4 0 0 1 28 44 V36 A 4 4 0 0 1 32 32 Z"
        fill={isLightTone ? '#ffffff' : `url(#${secondaryGradId})`}
      />

      {/* Core AI Focal Node */}
      <circle
        cx="50"
        cy="50"
        r="4"
        fill={isLightTone ? '#38bdf8' : '#ffffff'}
        className={animated ? 'animate-pulse' : ''}
      />
    </svg>
  );

  // Typography Wordmark
  const renderWordmark = () => (
    <span
      className={`font-black tracking-tight leading-none uppercase select-none ${currentSize.text}`}
      style={
        isLightTone
          ? { color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }
          : {
              background: 'linear-gradient(90deg, #06b6d4 0%, #14b8a6 26%, #0ea5e9 48%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }
      }
    >
      TEEROP
    </span>
  );

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {variant !== 'wordmark' && renderIcon()}

      {variant !== 'icon' && (
        <div className="inline-flex items-center gap-2">
          {renderWordmark()}
          {badge && (
            <span
              className={`font-bold tracking-wider uppercase rounded-full border ${currentSize.badge} ${
                isLightTone
                  ? 'bg-white/15 text-white border-white/25 backdrop-blur-xs'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

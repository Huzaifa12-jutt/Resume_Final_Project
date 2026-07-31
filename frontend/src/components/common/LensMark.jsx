import React from 'react';

/**
 * TalentLens signature mark — a camera-aperture / lens-iris glyph.
 * Six overlapping blades close toward a center point, echoing "bringing
 * candidates into focus". Used across the landing page, auth panels, and navbars.
 */
const LensMark = ({ size = 22, className = '', tone = 'light' }) => {
  const blade = tone === 'light' ? '#ffffff' : '#0b1220';
  const bladeOpacity = tone === 'light' ? 0.92 : 0.9;
  const center = tone === 'light' ? '#0b1220' : '#f7f9fc';

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" stroke={blade} strokeOpacity="0.28" strokeWidth="1" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path
          key={deg}
          d="M12 12 L12 3.6 A8.4 8.4 0 0 1 19.3 8.4 Z"
          fill={blade}
          fillOpacity={bladeOpacity}
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="2.6" fill={center} />
    </svg>
  );
};

export default LensMark;

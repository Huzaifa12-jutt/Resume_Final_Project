import React from 'react';
import TeeropLogo from './TeeropLogo';

/**
 * TEEROP signature brand mark (unified replacement for legacy lens mark).
 */
const LensMark = ({ size = 22, className = '', tone = 'light' }) => {
  return (
    <TeeropLogo
      variant="icon"
      size="sm"
      tone={tone === 'dark' ? 'dark' : 'light'}
      className={className}
    />
  );
};

export default LensMark;

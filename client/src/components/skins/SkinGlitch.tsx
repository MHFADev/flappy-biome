interface SkinProps {
  className?: string;
  style?: React.CSSProperties;
}

export function SkinGlitch({ className = "", style }: SkinProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="glitchGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff0080" />
          <stop offset="50%" stopColor="#00ff80" />
          <stop offset="100%" stopColor="#0080ff" />
        </linearGradient>
        <linearGradient id="glitchGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff0000" />
          <stop offset="50%" stopColor="#00ffff" />
          <stop offset="100%" stopColor="#ff00ff" />
        </linearGradient>
        <filter id="pixelate">
          <feFlood x="4" y="4" height="2" width="2" />
          <feComposite width="8" height="8" />
          <feTile result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
          <feMorphology operator="dilate" radius="2" />
        </filter>
        <filter id="glitchDistort">
          <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence" />
          <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      
      {/* Glitchy background layers - RGB offset effect */}
      <rect x="12" y="14" width="38" height="36" fill="#ff0000" opacity="0.3" transform="translate(-2, 0)" />
      <rect x="12" y="14" width="38" height="36" fill="#00ff00" opacity="0.3" transform="translate(0, -1)" />
      <rect x="12" y="14" width="38" height="36" fill="#0000ff" opacity="0.3" transform="translate(2, 1)" />
      
      {/* Main pixelated body - large pixels */}
      <g>
        {/* Row 1 */}
        <rect x="24" y="10" width="4" height="4" fill="#ff0080" />
        <rect x="28" y="10" width="4" height="4" fill="#00ff80" />
        <rect x="32" y="10" width="4" height="4" fill="#0080ff" />
        <rect x="36" y="10" width="4" height="4" fill="#ff0080" />
        
        {/* Row 2 */}
        <rect x="20" y="14" width="4" height="4" fill="#00ffff" />
        <rect x="24" y="14" width="4" height="4" fill="#ff00ff" />
        <rect x="28" y="14" width="4" height="4" fill="#ffff00" />
        <rect x="32" y="14" width="4" height="4" fill="#ff00ff" />
        <rect x="36" y="14" width="4" height="4" fill="#00ffff" />
        <rect x="40" y="14" width="4" height="4" fill="#ff0080" />
        
        {/* Row 3 */}
        <rect x="16" y="18" width="4" height="4" fill="#ff0000" />
        <rect x="20" y="18" width="4" height="4" fill="#00ff00" />
        <rect x="24" y="18" width="4" height="4" fill="#0000ff" />
        <rect x="28" y="18" width="4" height="4" fill="#ffffff" />
        <rect x="32" y="18" width="4" height="4" fill="#ffffff" />
        <rect x="36" y="18" width="4" height="4" fill="#0000ff" />
        <rect x="40" y="18" width="4" height="4" fill="#00ff00" />
        <rect x="44" y="18" width="4" height="4" fill="#ff0000" />
        
        {/* Row 4 - Eyes row */}
        <rect x="12" y="22" width="4" height="4" fill="#00ffff" />
        <rect x="16" y="22" width="4" height="4" fill="#ff00ff" />
        <rect x="20" y="22" width="4" height="4" fill="#000000" />
        <rect x="24" y="22" width="4" height="4" fill="#ffffff" />
        <rect x="28" y="22" width="4" height="4" fill="#ff0080" />
        <rect x="32" y="22" width="4" height="4" fill="#ff0080" />
        <rect x="36" y="22" width="4" height="4" fill="#ffffff" />
        <rect x="40" y="22" width="4" height="4" fill="#000000" />
        <rect x="44" y="22" width="4" height="4" fill="#ff00ff" />
        <rect x="48" y="22" width="4" height="4" fill="#00ffff" />
        
        {/* Row 5 */}
        <rect x="12" y="26" width="4" height="4" fill="#ffff00" />
        <rect x="16" y="26" width="4" height="4" fill="#00ff80" />
        <rect x="20" y="26" width="4" height="4" fill="#ff0080" />
        <rect x="24" y="26" width="4" height="4" fill="#0080ff" />
        <rect x="28" y="26" width="4" height="4" fill="#00ffff" />
        <rect x="32" y="26" width="4" height="4" fill="#00ffff" />
        <rect x="36" y="26" width="4" height="4" fill="#0080ff" />
        <rect x="40" y="26" width="4" height="4" fill="#ff0080" />
        <rect x="44" y="26" width="4" height="4" fill="#00ff80" />
        <rect x="48" y="26" width="4" height="4" fill="#ffff00" />
        
        {/* Row 6 */}
        <rect x="12" y="30" width="4" height="4" fill="#ff00ff" />
        <rect x="16" y="30" width="4" height="4" fill="#00ffff" />
        <rect x="20" y="30" width="4" height="4" fill="#ffff00" />
        <rect x="24" y="30" width="4" height="4" fill="#ff0000" />
        <rect x="28" y="30" width="4" height="4" fill="#00ff00" />
        <rect x="32" y="30" width="4" height="4" fill="#00ff00" />
        <rect x="36" y="30" width="4" height="4" fill="#ff0000" />
        <rect x="40" y="30" width="4" height="4" fill="#ffff00" />
        <rect x="44" y="30" width="4" height="4" fill="#00ffff" />
        <rect x="48" y="30" width="4" height="4" fill="#ff00ff" />
        
        {/* Row 7 */}
        <rect x="16" y="34" width="4" height="4" fill="#0080ff" />
        <rect x="20" y="34" width="4" height="4" fill="#ff0080" />
        <rect x="24" y="34" width="4" height="4" fill="#00ff80" />
        <rect x="28" y="34" width="4" height="4" fill="#ff00ff" />
        <rect x="32" y="34" width="4" height="4" fill="#ff00ff" />
        <rect x="36" y="34" width="4" height="4" fill="#00ff80" />
        <rect x="40" y="34" width="4" height="4" fill="#ff0080" />
        <rect x="44" y="34" width="4" height="4" fill="#0080ff" />
        
        {/* Row 8 */}
        <rect x="20" y="38" width="4" height="4" fill="#00ffff" />
        <rect x="24" y="38" width="4" height="4" fill="#ff0000" />
        <rect x="28" y="38" width="4" height="4" fill="#0000ff" />
        <rect x="32" y="38" width="4" height="4" fill="#0000ff" />
        <rect x="36" y="38" width="4" height="4" fill="#ff0000" />
        <rect x="40" y="38" width="4" height="4" fill="#00ffff" />
        
        {/* Row 9 - bottom */}
        <rect x="24" y="42" width="4" height="4" fill="#ffff00" />
        <rect x="28" y="42" width="4" height="4" fill="#ff00ff" />
        <rect x="32" y="42" width="4" height="4" fill="#ff00ff" />
        <rect x="36" y="42" width="4" height="4" fill="#ffff00" />
        
        {/* Glitch artifacts - scattered pixels */}
        <rect x="8" y="28" width="2" height="2" fill="#ff0000" />
        <rect x="54" y="20" width="2" height="2" fill="#00ff00" />
        <rect x="6" y="36" width="2" height="2" fill="#0000ff" />
        <rect x="56" y="32" width="2" height="2" fill="#ff00ff" />
        <rect x="10" y="16" width="2" height="2" fill="#00ffff" />
        <rect x="52" y="40" width="2" height="2" fill="#ffff00" />
        
        {/* Scanlines effect */}
        <line x1="8" y1="24" x2="56" y2="24" stroke="#000000" strokeWidth="0.5" opacity="0.3" />
        <line x1="8" y1="32" x2="56" y2="32" stroke="#000000" strokeWidth="0.5" opacity="0.3" />
        <line x1="8" y1="40" x2="56" y2="40" stroke="#000000" strokeWidth="0.5" opacity="0.3" />
      </g>
      
      {/* Corruption lines */}
      <rect x="0" y="28" width="64" height="2" fill="url(#glitchGradient1)" opacity="0.4" />
      <rect x="0" y="36" width="64" height="1" fill="url(#glitchGradient2)" opacity="0.3" />
    </svg>
  );
}

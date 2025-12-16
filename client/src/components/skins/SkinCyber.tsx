interface SkinProps {
  className?: string;
  style?: React.CSSProperties;
}

export function SkinCyber({ className = "", style }: SkinProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cyberBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="50%" stopColor="#16213e" />
          <stop offset="100%" stopColor="#0f0f23" />
        </linearGradient>
        <linearGradient id="cyberGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00f5ff" />
          <stop offset="100%" stopColor="#0080ff" />
        </linearGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="cyberAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff00ff" />
          <stop offset="100%" stopColor="#00f5ff" />
        </linearGradient>
      </defs>
      
      {/* Main drone body */}
      <ellipse
        cx="32"
        cy="32"
        rx="22"
        ry="14"
        fill="url(#cyberBodyGradient)"
        stroke="#00f5ff"
        strokeWidth="1.5"
      />
      
      {/* Top dome */}
      <ellipse
        cx="32"
        cy="24"
        rx="14"
        ry="10"
        fill="url(#cyberBodyGradient)"
        stroke="#00f5ff"
        strokeWidth="1"
      />
      
      {/* Cockpit glass */}
      <ellipse
        cx="32"
        cy="26"
        rx="8"
        ry="5"
        fill="#00f5ff"
        opacity="0.3"
        stroke="#00f5ff"
        strokeWidth="0.5"
      />
      
      {/* Neon accent lines */}
      <path
        d="M 14 32 L 8 28 L 8 36 Z"
        fill="url(#cyberBodyGradient)"
        stroke="url(#cyberGlow)"
        strokeWidth="1"
        filter="url(#neonGlow)"
      />
      <path
        d="M 50 32 L 56 28 L 56 36 Z"
        fill="url(#cyberBodyGradient)"
        stroke="url(#cyberGlow)"
        strokeWidth="1"
        filter="url(#neonGlow)"
      />
      
      {/* Propeller mounts */}
      <rect x="6" y="24" width="6" height="4" rx="1" fill="#1a1a2e" stroke="#00f5ff" strokeWidth="0.5" />
      <rect x="52" y="24" width="6" height="4" rx="1" fill="#1a1a2e" stroke="#00f5ff" strokeWidth="0.5" />
      <rect x="6" y="36" width="6" height="4" rx="1" fill="#1a1a2e" stroke="#00f5ff" strokeWidth="0.5" />
      <rect x="52" y="36" width="6" height="4" rx="1" fill="#1a1a2e" stroke="#00f5ff" strokeWidth="0.5" />
      
      {/* Propeller circles */}
      <circle cx="9" cy="22" r="4" fill="none" stroke="#00f5ff" strokeWidth="0.5" opacity="0.6" />
      <circle cx="55" cy="22" r="4" fill="none" stroke="#00f5ff" strokeWidth="0.5" opacity="0.6" />
      <circle cx="9" cy="42" r="4" fill="none" stroke="#00f5ff" strokeWidth="0.5" opacity="0.6" />
      <circle cx="55" cy="42" r="4" fill="none" stroke="#00f5ff" strokeWidth="0.5" opacity="0.6" />
      
      {/* LED eyes */}
      <circle cx="26" cy="30" r="3" fill="#ff00ff" filter="url(#neonGlow)" />
      <circle cx="38" cy="30" r="3" fill="#00f5ff" filter="url(#neonGlow)" />
      
      {/* Center stripe */}
      <line x1="20" y1="38" x2="44" y2="38" stroke="url(#cyberAccent)" strokeWidth="2" filter="url(#neonGlow)" />
      
      {/* Bottom thrusters */}
      <rect x="24" y="42" width="4" height="6" rx="1" fill="#0f0f23" stroke="#ff6600" strokeWidth="0.5" />
      <rect x="36" y="42" width="4" height="6" rx="1" fill="#0f0f23" stroke="#ff6600" strokeWidth="0.5" />
      <ellipse cx="26" cy="50" rx="2" ry="3" fill="#ff6600" opacity="0.7" />
      <ellipse cx="38" cy="50" rx="2" ry="3" fill="#ff6600" opacity="0.7" />
      
      {/* Antenna */}
      <line x1="32" y1="14" x2="32" y2="8" stroke="#00f5ff" strokeWidth="1" />
      <circle cx="32" cy="6" r="2" fill="#ff00ff" filter="url(#neonGlow)" />
    </svg>
  );
}

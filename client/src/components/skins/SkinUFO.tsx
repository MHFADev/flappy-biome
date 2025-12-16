interface SkinProps {
  className?: string;
  style?: React.CSSProperties;
}

export function SkinUFO({ className = "", style }: SkinProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ufoBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C0C0C0" />
          <stop offset="50%" stopColor="#808080" />
          <stop offset="100%" stopColor="#505050" />
        </linearGradient>
        <linearGradient id="ufoDomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="30%" stopColor="#00CED1" />
          <stop offset="100%" stopColor="#008B8B" />
        </linearGradient>
        <radialGradient id="ufoBeamGradient" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#00ff00" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00ff00" stopOpacity="0" />
        </radialGradient>
        <filter id="ufoGlow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="ufoRimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
      
      {/* Tractor beam */}
      <path
        d="M 24 40 L 16 60 L 48 60 L 40 40 Z"
        fill="url(#ufoBeamGradient)"
        opacity="0.5"
      />
      
      {/* Main saucer body - bottom */}
      <ellipse
        cx="32"
        cy="36"
        rx="26"
        ry="8"
        fill="url(#ufoBodyGradient)"
        stroke="#404040"
        strokeWidth="1"
      />
      
      {/* Rim ring */}
      <ellipse
        cx="32"
        cy="34"
        rx="24"
        ry="6"
        fill="none"
        stroke="url(#ufoRimGradient)"
        strokeWidth="3"
      />
      
      {/* Running lights on rim */}
      <circle cx="10" cy="34" r="2" fill="#FF0000" filter="url(#ufoGlow)">
        <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="18" cy="32" r="2" fill="#00FF00" filter="url(#ufoGlow)">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="26" cy="30" r="2" fill="#0000FF" filter="url(#ufoGlow)">
        <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="38" cy="30" r="2" fill="#FFFF00" filter="url(#ufoGlow)">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="46" cy="32" r="2" fill="#FF00FF" filter="url(#ufoGlow)">
        <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="54" cy="34" r="2" fill="#00FFFF" filter="url(#ufoGlow)">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite" />
      </circle>
      
      {/* Upper saucer part */}
      <ellipse
        cx="32"
        cy="32"
        rx="20"
        ry="6"
        fill="url(#ufoBodyGradient)"
        stroke="#404040"
        strokeWidth="0.5"
      />
      
      {/* Cockpit dome */}
      <ellipse
        cx="32"
        cy="26"
        rx="12"
        ry="10"
        fill="url(#ufoDomeGradient)"
        stroke="#006666"
        strokeWidth="1"
        opacity="0.9"
      />
      
      {/* Dome reflection */}
      <ellipse
        cx="28"
        cy="22"
        rx="4"
        ry="3"
        fill="#FFFFFF"
        opacity="0.4"
      />
      
      {/* Alien silhouette inside dome */}
      <ellipse cx="32" cy="24" rx="4" ry="5" fill="#003333" opacity="0.5" />
      <circle cx="30" cy="22" r="1.5" fill="#00FF00" opacity="0.8" />
      <circle cx="34" cy="22" r="1.5" fill="#00FF00" opacity="0.8" />
      
      {/* Top antenna */}
      <line x1="32" y1="16" x2="32" y2="10" stroke="#808080" strokeWidth="2" />
      <circle cx="32" cy="8" r="3" fill="#FF0000" filter="url(#ufoGlow)">
        <animate attributeName="fill" values="#FF0000;#FFFF00;#FF0000" dur="1s" repeatCount="indefinite" />
      </circle>
      
      {/* Bottom center light */}
      <circle cx="32" cy="42" r="4" fill="#00FF00" filter="url(#ufoGlow)" opacity="0.8">
        <animate attributeName="r" values="4;5;4" dur="0.8s" repeatCount="indefinite" />
      </circle>
      
      {/* Landing gear hints */}
      <ellipse cx="20" cy="44" rx="3" ry="2" fill="#505050" />
      <ellipse cx="44" cy="44" rx="3" ry="2" fill="#505050" />
      <ellipse cx="32" cy="46" rx="3" ry="2" fill="#505050" />
    </svg>
  );
}

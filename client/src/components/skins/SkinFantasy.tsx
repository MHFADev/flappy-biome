interface SkinProps {
  className?: string;
  style?: React.CSSProperties;
}

export function SkinFantasy({ className = "", style }: SkinProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="dragonBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="50%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#654321" />
        </linearGradient>
        <linearGradient id="dragonBellyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F4A460" />
          <stop offset="100%" stopColor="#DEB887" />
        </linearGradient>
        <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B0000" />
          <stop offset="50%" stopColor="#B22222" />
          <stop offset="100%" stopColor="#CD5C5C" />
        </linearGradient>
        <radialGradient id="fireGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FF6600" />
          <stop offset="100%" stopColor="#FF4500" />
        </radialGradient>
      </defs>
      
      {/* Wings - back layer */}
      <path
        d="M 8 20 Q 4 10 14 6 L 22 12 Q 18 18 20 26 Z"
        fill="url(#wingGradient)"
        stroke="#5C1010"
        strokeWidth="1"
      />
      <path
        d="M 56 20 Q 60 10 50 6 L 42 12 Q 46 18 44 26 Z"
        fill="url(#wingGradient)"
        stroke="#5C1010"
        strokeWidth="1"
      />
      
      {/* Wing membranes */}
      <path d="M 10 18 L 14 8 M 14 18 L 16 10 M 18 18 L 18 12" stroke="#5C1010" strokeWidth="0.5" fill="none" />
      <path d="M 54 18 L 50 8 M 50 18 L 48 10 M 46 18 L 46 12" stroke="#5C1010" strokeWidth="0.5" fill="none" />
      
      {/* Tail */}
      <path
        d="M 48 36 Q 56 34 60 30 Q 62 28 58 26 Q 54 28 52 32 L 48 36"
        fill="url(#dragonBodyGradient)"
        stroke="#4A3728"
        strokeWidth="1"
      />
      <path d="M 58 28 L 62 24 L 60 28 L 64 26" stroke="#8B0000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      
      {/* Main body */}
      <ellipse
        cx="32"
        cy="36"
        rx="18"
        ry="14"
        fill="url(#dragonBodyGradient)"
        stroke="#4A3728"
        strokeWidth="1.5"
      />
      
      {/* Belly scales */}
      <ellipse
        cx="32"
        cy="40"
        rx="10"
        ry="8"
        fill="url(#dragonBellyGradient)"
      />
      <path d="M 26 36 L 38 36 M 24 40 L 40 40 M 26 44 L 38 44" stroke="#C4A574" strokeWidth="0.5" fill="none" />
      
      {/* Head */}
      <ellipse
        cx="18"
        cy="30"
        rx="10"
        ry="9"
        fill="url(#dragonBodyGradient)"
        stroke="#4A3728"
        strokeWidth="1.5"
      />
      
      {/* Snout */}
      <ellipse cx="10" cy="32" rx="5" ry="4" fill="url(#dragonBodyGradient)" stroke="#4A3728" strokeWidth="1" />
      
      {/* Nostrils with smoke */}
      <circle cx="7" cy="30" r="1" fill="#2D1F14" />
      <circle cx="7" cy="34" r="1" fill="#2D1F14" />
      <ellipse cx="4" cy="28" rx="1.5" ry="1" fill="#888" opacity="0.5" />
      <ellipse cx="3" cy="25" rx="1" ry="0.7" fill="#888" opacity="0.3" />
      
      {/* Eyes */}
      <ellipse cx="16" cy="26" rx="3" ry="4" fill="#FFD700" stroke="#8B4513" strokeWidth="0.5" />
      <ellipse cx="16" cy="26" rx="1.5" ry="3" fill="#2D1F14" />
      <circle cx="15" cy="25" r="0.8" fill="#FFFFFF" />
      
      {/* Horns */}
      <path d="M 22 22 Q 24 16 28 14" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 18 22 Q 18 16 14 12" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Spines */}
      <path d="M 26 24 L 28 18 L 30 24" fill="#8B0000" stroke="#5C1010" strokeWidth="0.5" />
      <path d="M 32 22 L 34 16 L 36 22" fill="#8B0000" stroke="#5C1010" strokeWidth="0.5" />
      <path d="M 38 24 L 40 18 L 42 24" fill="#8B0000" stroke="#5C1010" strokeWidth="0.5" />
      
      {/* Legs */}
      <ellipse cx="22" cy="50" rx="4" ry="6" fill="url(#dragonBodyGradient)" stroke="#4A3728" strokeWidth="1" />
      <ellipse cx="42" cy="50" rx="4" ry="6" fill="url(#dragonBodyGradient)" stroke="#4A3728" strokeWidth="1" />
      
      {/* Claws */}
      <path d="M 19 54 L 17 58 M 22 55 L 22 59 M 25 54 L 27 58" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 39 54 L 37 58 M 42 55 L 42 59 M 45 54 L 47 58" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Fire breath hint */}
      <ellipse cx="2" cy="32" rx="2" ry="1.5" fill="url(#fireGradient)" opacity="0.8" />
    </svg>
  );
}

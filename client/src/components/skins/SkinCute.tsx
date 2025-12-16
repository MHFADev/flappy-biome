interface SkinProps {
  className?: string;
  style?: React.CSSProperties;
}

export function SkinCute({ className = "", style }: SkinProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="cuteBodyGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFE4C4" />
          <stop offset="100%" stopColor="#F5B88C" />
        </radialGradient>
        <radialGradient id="cuteCheekGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#FF9AAC" />
        </radialGradient>
      </defs>
      
      {/* Main body - kawaii hamster blob */}
      <ellipse
        cx="32"
        cy="36"
        rx="24"
        ry="22"
        fill="url(#cuteBodyGradient)"
        stroke="#E8A970"
        strokeWidth="2"
      />
      
      {/* Ears */}
      <ellipse cx="14" cy="18" rx="8" ry="10" fill="url(#cuteBodyGradient)" stroke="#E8A970" strokeWidth="1.5" />
      <ellipse cx="14" cy="18" rx="5" ry="6" fill="#FFB6C1" />
      <ellipse cx="50" cy="18" rx="8" ry="10" fill="url(#cuteBodyGradient)" stroke="#E8A970" strokeWidth="1.5" />
      <ellipse cx="50" cy="18" rx="5" ry="6" fill="#FFB6C1" />
      
      {/* Eyes */}
      <ellipse cx="22" cy="32" rx="5" ry="6" fill="#2D1F14" />
      <ellipse cx="42" cy="32" rx="5" ry="6" fill="#2D1F14" />
      <ellipse cx="23" cy="30" rx="2" ry="2.5" fill="#FFFFFF" />
      <ellipse cx="43" cy="30" rx="2" ry="2.5" fill="#FFFFFF" />
      
      {/* Blush cheeks */}
      <ellipse cx="12" cy="40" rx="6" ry="4" fill="url(#cuteCheekGradient)" opacity="0.7" />
      <ellipse cx="52" cy="40" rx="6" ry="4" fill="url(#cuteCheekGradient)" opacity="0.7" />
      
      {/* Nose */}
      <ellipse cx="32" cy="38" rx="3" ry="2" fill="#8B5A3C" />
      
      {/* Mouth */}
      <path
        d="M 28 44 Q 32 48 36 44"
        fill="none"
        stroke="#8B5A3C"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Whiskers */}
      <line x1="8" y1="36" x2="18" y2="38" stroke="#D4A574" strokeWidth="1" strokeLinecap="round" />
      <line x1="8" y1="42" x2="18" y2="42" stroke="#D4A574" strokeWidth="1" strokeLinecap="round" />
      <line x1="46" y1="38" x2="56" y2="36" stroke="#D4A574" strokeWidth="1" strokeLinecap="round" />
      <line x1="46" y1="42" x2="56" y2="42" stroke="#D4A574" strokeWidth="1" strokeLinecap="round" />
      
      {/* Tiny paws */}
      <ellipse cx="18" cy="54" rx="6" ry="4" fill="url(#cuteBodyGradient)" stroke="#E8A970" strokeWidth="1" />
      <ellipse cx="46" cy="54" rx="6" ry="4" fill="url(#cuteBodyGradient)" stroke="#E8A970" strokeWidth="1" />
    </svg>
  );
}

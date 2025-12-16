interface CoinIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export function CoinIcon({ className = "", size = 24, animated = false }: CoinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`${className} ${animated ? "animate-spin" : ""}`}
      style={animated ? { animationDuration: "3s" } : undefined}
    >
      <defs>
        <linearGradient id="coinGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="coinShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id="coinShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" fill="url(#coinGold)" filter="url(#coinShadow)" />
      
      {/* Inner ring */}
      <circle cx="24" cy="24" r="18" fill="none" stroke="#B8860B" strokeWidth="2" />
      
      {/* Dollar symbol or star */}
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        fill="#8B6914"
        fontFamily="Arial, sans-serif"
      >
        C
      </text>
      
      {/* Shine overlay */}
      <ellipse cx="18" cy="16" rx="8" ry="6" fill="url(#coinShine)" />
      
      {/* Edge highlights */}
      <circle cx="24" cy="24" r="21" fill="none" stroke="#FFE066" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
  );
}

interface CoinDisplayProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
  className?: string;
}

export function CoinDisplay({ amount, size = "md", showAnimation = false, className = "" }: CoinDisplayProps) {
  const sizeConfig = {
    sm: { icon: 16, text: "text-sm" },
    md: { icon: 24, text: "text-base" },
    lg: { icon: 32, text: "text-xl" },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center gap-1.5 ${className}`} data-testid="coin-display">
      <CoinIcon size={config.icon} animated={showAnimation} />
      <span className={`font-bold font-mono ${config.text}`} data-testid="coin-amount">
        {amount.toLocaleString()}
      </span>
    </div>
  );
}

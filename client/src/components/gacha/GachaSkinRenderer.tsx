import type { GachaSkin, RarityType } from "@shared/schema";
import { rarityConfig } from "@shared/schema";

interface GachaSkinRendererProps {
  skin: GachaSkin;
  size?: number;
  showAnimation?: boolean;
  className?: string;
}

// Animation keyframes for different skin animations
const animationStyles: Record<GachaSkin["animation"], string> = {
  float: "animate-float",
  pulse: "animate-pulse",
  spin: "animate-spin-slow",
  glitch: "animate-glitch",
  sparkle: "animate-sparkle",
  wave: "animate-wave",
  bounce: "animate-bounce",
  shake: "animate-shake",
};

// Pattern generators for different skin patterns
function getPatternPath(pattern: number, size: number): JSX.Element {
  const center = size / 2;
  const scale = size / 100;
  
  switch (pattern) {
    case 1: // Circular pattern
      return (
        <>
          <circle cx={center} cy={center} r={30 * scale} fill="none" stroke="currentColor" strokeWidth={2} strokeOpacity={0.3} />
          <circle cx={center} cy={center} r={20 * scale} fill="none" stroke="currentColor" strokeWidth={1} strokeOpacity={0.2} />
        </>
      );
    case 2: // Star pattern
      return (
        <>
          <polygon 
            points={`${center},${10 * scale} ${center + 12 * scale},${40 * scale} ${center - 12 * scale},${40 * scale}`} 
            fill="currentColor" 
            fillOpacity={0.2} 
          />
          <polygon 
            points={`${center},${90 * scale} ${center + 12 * scale},${60 * scale} ${center - 12 * scale},${60 * scale}`} 
            fill="currentColor" 
            fillOpacity={0.2} 
          />
        </>
      );
    case 3: // Diamond pattern
    default:
      return (
        <>
          <rect 
            x={center - 15 * scale} 
            y={center - 15 * scale} 
            width={30 * scale} 
            height={30 * scale} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={2} 
            strokeOpacity={0.3}
            transform={`rotate(45 ${center} ${center})`}
          />
        </>
      );
  }
}

// Category-specific shapes
function getCategoryShape(category: GachaSkin["category"], size: number, hue: number): JSX.Element {
  const center = size / 2;
  const scale = size / 100;
  const mainColor = `hsl(${hue}, 70%, 50%)`;
  const lightColor = `hsl(${hue}, 80%, 70%)`;
  const darkColor = `hsl(${hue}, 60%, 30%)`;
  
  switch (category) {
    case "animal":
      return (
        <g>
          {/* Cute animal blob */}
          <ellipse cx={center} cy={center + 5 * scale} rx={35 * scale} ry={30 * scale} fill={mainColor} />
          <circle cx={center - 12 * scale} cy={center - 5 * scale} r={8 * scale} fill={lightColor} />
          <circle cx={center + 12 * scale} cy={center - 5 * scale} r={8 * scale} fill={lightColor} />
          <circle cx={center - 12 * scale} cy={center - 5 * scale} r={4 * scale} fill={darkColor} />
          <circle cx={center + 12 * scale} cy={center - 5 * scale} r={4 * scale} fill={darkColor} />
          <ellipse cx={center} cy={center + 10 * scale} rx={5 * scale} ry={3 * scale} fill={darkColor} />
          {/* Ears */}
          <circle cx={center - 25 * scale} cy={center - 25 * scale} r={12 * scale} fill={mainColor} />
          <circle cx={center + 25 * scale} cy={center - 25 * scale} r={12 * scale} fill={mainColor} />
        </g>
      );
    
    case "robot":
      return (
        <g>
          {/* Robot body */}
          <rect x={center - 25 * scale} y={center - 20 * scale} width={50 * scale} height={45 * scale} rx={5 * scale} fill={mainColor} />
          <rect x={center - 18 * scale} y={center - 12 * scale} width={12 * scale} height={8 * scale} rx={2 * scale} fill={lightColor} />
          <rect x={center + 6 * scale} y={center - 12 * scale} width={12 * scale} height={8 * scale} rx={2 * scale} fill={lightColor} />
          <rect x={center - 10 * scale} y={center + 8 * scale} width={20 * scale} height={4 * scale} fill={darkColor} />
          {/* Antenna */}
          <line x1={center} y1={center - 20 * scale} x2={center} y2={center - 35 * scale} stroke={darkColor} strokeWidth={3 * scale} />
          <circle cx={center} cy={center - 38 * scale} r={5 * scale} fill={lightColor} />
        </g>
      );
    
    case "mythical":
      return (
        <g>
          {/* Dragon/mythical creature */}
          <ellipse cx={center} cy={center + 5 * scale} rx={30 * scale} ry={25 * scale} fill={mainColor} />
          <polygon points={`${center - 30 * scale},${center - 10 * scale} ${center - 20 * scale},${center - 35 * scale} ${center - 10 * scale},${center - 10 * scale}`} fill={lightColor} />
          <polygon points={`${center + 30 * scale},${center - 10 * scale} ${center + 20 * scale},${center - 35 * scale} ${center + 10 * scale},${center - 10 * scale}`} fill={lightColor} />
          <circle cx={center - 10 * scale} cy={center - 5 * scale} r={5 * scale} fill={lightColor} />
          <circle cx={center + 10 * scale} cy={center - 5 * scale} r={5 * scale} fill={lightColor} />
          <circle cx={center - 10 * scale} cy={center - 5 * scale} r={2 * scale} fill={darkColor} />
          <circle cx={center + 10 * scale} cy={center - 5 * scale} r={2 * scale} fill={darkColor} />
        </g>
      );
    
    case "cosmic":
      return (
        <g>
          {/* Cosmic orb */}
          <circle cx={center} cy={center} r={35 * scale} fill={mainColor} />
          <ellipse cx={center} cy={center} rx={40 * scale} ry={10 * scale} fill="none" stroke={lightColor} strokeWidth={3 * scale} />
          <circle cx={center + 15 * scale} cy={center - 15 * scale} r={8 * scale} fill={lightColor} fillOpacity={0.5} />
          <circle cx={center - 10 * scale} cy={center + 10 * scale} r={5 * scale} fill={lightColor} fillOpacity={0.3} />
        </g>
      );
    
    case "elemental":
      return (
        <g>
          {/* Elemental shape */}
          <polygon points={`${center},${center - 35 * scale} ${center + 30 * scale},${center + 20 * scale} ${center - 30 * scale},${center + 20 * scale}`} fill={mainColor} />
          <polygon points={`${center},${center + 35 * scale} ${center + 20 * scale},${center} ${center - 20 * scale},${center}`} fill={lightColor} fillOpacity={0.6} />
        </g>
      );
    
    case "pixel":
      return (
        <g>
          {/* Pixel art style */}
          {[...Array(5)].map((_, row) => (
            [...Array(5)].map((_, col) => {
              const x = center - 25 * scale + col * 10 * scale;
              const y = center - 25 * scale + row * 10 * scale;
              const show = Math.abs(row - 2) + Math.abs(col - 2) <= 2;
              return show ? (
                <rect 
                  key={`${row}-${col}`}
                  x={x} 
                  y={y} 
                  width={10 * scale} 
                  height={10 * scale} 
                  fill={(row + col) % 2 === 0 ? mainColor : lightColor}
                />
              ) : null;
            })
          ))}
        </g>
      );
    
    case "neon":
      return (
        <g>
          {/* Neon glow effect */}
          <circle cx={center} cy={center} r={30 * scale} fill="none" stroke={lightColor} strokeWidth={8 * scale} strokeOpacity={0.3} />
          <circle cx={center} cy={center} r={30 * scale} fill="none" stroke={mainColor} strokeWidth={4 * scale} />
          <polygon 
            points={`${center},${center - 20 * scale} ${center + 18 * scale},${center + 15 * scale} ${center - 18 * scale},${center + 15 * scale}`} 
            fill="none" 
            stroke={mainColor} 
            strokeWidth={3 * scale}
          />
        </g>
      );
    
    case "stealth":
      return (
        <g>
          {/* Stealth/ninja shape */}
          <polygon points={`${center},${center - 30 * scale} ${center + 35 * scale},${center + 25 * scale} ${center - 35 * scale},${center + 25 * scale}`} fill={darkColor} />
          <rect x={center - 20 * scale} y={center - 5 * scale} width={40 * scale} height={8 * scale} fill={mainColor} />
          <circle cx={center - 8 * scale} cy={center - 1 * scale} r={3 * scale} fill={lightColor} />
          <circle cx={center + 8 * scale} cy={center - 1 * scale} r={3 * scale} fill={lightColor} />
        </g>
      );
    
    case "royal":
    default:
      return (
        <g>
          {/* Royal/regal shape */}
          <ellipse cx={center} cy={center + 10 * scale} rx={30 * scale} ry={25 * scale} fill={mainColor} />
          {/* Crown */}
          <polygon points={`${center - 25 * scale},${center - 10 * scale} ${center - 15 * scale},${center - 30 * scale} ${center},${center - 15 * scale} ${center + 15 * scale},${center - 30 * scale} ${center + 25 * scale},${center - 10 * scale}`} fill={lightColor} />
          <circle cx={center - 15 * scale} cy={center - 30 * scale} r={4 * scale} fill={mainColor} />
          <circle cx={center} cy={center - 15 * scale} r={4 * scale} fill={mainColor} />
          <circle cx={center + 15 * scale} cy={center - 30 * scale} r={4 * scale} fill={mainColor} />
          <circle cx={center} cy={center + 5 * scale} r={8 * scale} fill={lightColor} fillOpacity={0.5} />
        </g>
      );
  }
}

export function GachaSkinRenderer({ skin, size = 100, showAnimation = true, className = "" }: GachaSkinRendererProps) {
  const rarity = rarityConfig[skin.rarity];
  const animClass = showAnimation ? animationStyles[skin.animation] : "";
  
  return (
    <div 
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      data-testid={`skin-renderer-${skin.id}`}
    >
      {/* Glow effect for rare skins */}
      {skin.special && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, ${rarity.glowColor}40 0%, transparent 70%)`,
            transform: "scale(1.3)",
          }}
        />
      )}
      
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`${animClass} relative z-10`}
        style={{ animationDuration: "2s" }}
      >
        <defs>
          <filter id={`glow-${skin.id}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle with rarity color */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size / 2 - 2} 
          fill={`${rarity.color}20`}
          stroke={rarity.color}
          strokeWidth={2}
        />
        
        {/* Pattern overlay */}
        <g style={{ color: rarity.color }}>
          {getPatternPath(skin.pattern, size)}
        </g>
        
        {/* Main shape based on category */}
        <g filter={skin.special ? `url(#glow-${skin.id})` : undefined}>
          {getCategoryShape(skin.category, size, skin.baseHue)}
        </g>
      </svg>
    </div>
  );
}

// Rarity badge component
interface RarityBadgeProps {
  rarity: RarityType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RarityBadge({ rarity, size = "md", className = "" }: RarityBadgeProps) {
  const config = rarityConfig[rarity];
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };
  
  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-md font-semibold ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: `${config.color}30`,
        color: config.color,
        border: `1px solid ${config.color}50`,
      }}
      data-testid={`rarity-badge-${rarity}`}
    >
      {config.name}
    </span>
  );
}

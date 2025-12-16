import type { BuffType } from "@shared/schema";

interface BuffIconProps {
  type: BuffType;
  size?: number;
  className?: string;
}

export function ShieldIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <filter id="shieldGlow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M 16 2 L 28 8 L 28 16 Q 28 26 16 30 Q 4 26 4 16 L 4 8 Z"
        fill="url(#shieldGradient)"
        stroke="#1d4ed8"
        strokeWidth="1.5"
        filter="url(#shieldGlow)"
      />
      <path
        d="M 16 6 L 24 10 L 24 15 Q 24 22 16 26 Q 8 22 8 15 L 8 10 Z"
        fill="none"
        stroke="#93c5fd"
        strokeWidth="1"
        opacity="0.6"
      />
      <path
        d="M 12 16 L 15 19 L 21 13"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TimeSlowIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="clockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="clockGlow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="url(#clockGradient)"
        stroke="#5b21b6"
        strokeWidth="1.5"
        filter="url(#clockGlow)"
      />
      <circle cx="16" cy="16" r="10" fill="none" stroke="#c4b5fd" strokeWidth="1" opacity="0.5" />
      <line x1="16" y1="16" x2="16" y2="8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="16" x2="22" y2="16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2" fill="#ffffff" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 16 + 11 * Math.sin(rad);
        const y1 = 16 - 11 * Math.cos(rad);
        const x2 = 16 + 9 * Math.sin(rad);
        const y2 = 16 - 9 * Math.cos(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#e9d5ff"
            strokeWidth={angle % 90 === 0 ? "1.5" : "0.5"}
          />
        );
      })}
    </svg>
  );
}

export function MultiplierIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="starGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M 16 2 L 19 11 L 29 11 L 21 18 L 24 28 L 16 22 L 8 28 L 11 18 L 3 11 L 13 11 Z"
        fill="url(#starGradient)"
        stroke="#d97706"
        strokeWidth="1"
        filter="url(#starGlow)"
      />
      <path
        d="M 16 6 L 17.5 11.5 L 23 11.5 L 18.5 15.5 L 20 21 L 16 18 L 12 21 L 13.5 15.5 L 9 11.5 L 14.5 11.5 Z"
        fill="#fef3c7"
        opacity="0.5"
      />
      <text
        x="16"
        y="18"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill="#92400e"
      >
        2x
      </text>
    </svg>
  );
}

export function BuffIcon({ type, size = 32, className = "" }: BuffIconProps) {
  switch (type) {
    case "shield":
      return <ShieldIcon size={size} className={className} />;
    case "timeSlow":
      return <TimeSlowIcon size={size} className={className} />;
    case "multiplier":
      return <MultiplierIcon size={size} className={className} />;
    default:
      return null;
  }
}

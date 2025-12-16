import { useMemo, useRef, useEffect, useState } from "react";
import type { GachaSkin, RarityType } from "@shared/schema";

interface SkinEffectsOverlayProps {
  skin: GachaSkin;
  playerX: number;
  playerY: number;
  playerSize: number;
  isPlaying: boolean;
  isPaused: boolean;
  playerVelocity: number;
}

const rarityIntensity: Record<RarityType, number> = {
  stone: 0.2,
  coal: 0.3,
  iron: 0.4,
  silver: 0.5,
  gold: 0.6,
  platinum: 0.7,
  diamond: 0.85,
  obsidian: 0.95,
  emerald: 1.0,
};

const rarityParticleCount: Record<RarityType, number> = {
  stone: 3,
  coal: 4,
  iron: 5,
  silver: 6,
  gold: 8,
  platinum: 10,
  diamond: 12,
  obsidian: 14,
  emerald: 16,
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
  offsetX: number;
  offsetY: number;
}

export function SkinEffectsOverlay({
  skin,
  playerX,
  playerY,
  playerSize,
  isPlaying,
  isPaused,
  playerVelocity,
}: SkinEffectsOverlayProps) {
  const intensity = rarityIntensity[skin.rarity];
  const particleCount = rarityParticleCount[skin.rarity];
  const isSpecial = skin.special;
  const baseHue = skin.baseHue;
  const animationType = skin.animation;

  const glowSize = playerSize * (0.6 + intensity * 0.8);
  const glowOpacity = 0.3 + intensity * 0.4;
  const specialMultiplier = isSpecial ? 1.5 : 1;

  const particles = useMemo(() => {
    const result: Particle[] = [];
    const totalParticles = Math.floor(particleCount * specialMultiplier);
    
    for (let i = 0; i < totalParticles; i++) {
      result.push({
        id: i,
        x: 0,
        y: 0,
        size: 3 + Math.random() * 6 * intensity,
        opacity: 0.3 + Math.random() * 0.5 * intensity,
        delay: Math.random() * 2,
        duration: 1 + Math.random() * 2,
        offsetX: (Math.random() - 0.5) * playerSize * 0.8,
        offsetY: (Math.random() - 0.5) * playerSize * 0.8,
      });
    }
    return result;
  }, [particleCount, intensity, specialMultiplier, playerSize]);

  const getAnimationClass = () => {
    switch (animationType) {
      case "sparkle":
        return "skin-effect-sparkle";
      case "pulse":
        return "skin-effect-pulse";
      case "glitch":
        return "skin-effect-glitch";
      case "spin":
        return "skin-effect-spin";
      case "wave":
        return "skin-effect-wave";
      case "bounce":
        return "skin-effect-bounce";
      case "shake":
        return "skin-effect-shake";
      case "float":
      default:
        return "skin-effect-float";
    }
  };

  const getParticleShape = () => {
    switch (animationType) {
      case "sparkle":
        return "star";
      case "glitch":
        return "square";
      case "pulse":
        return "ring";
      default:
        return "circle";
    }
  };

  if (!isPlaying || isPaused) return null;

  const mainColor = `hsl(${baseHue}, 70%, 60%)`;
  const glowColor = `hsl(${baseHue}, 80%, 50%)`;
  const particleColor = `hsl(${baseHue}, 75%, 65%)`;
  const specialSparkleColor = `hsl(${(baseHue + 30) % 360}, 90%, 75%)`;

  return (
    <div
      className="absolute pointer-events-none z-[9]"
      style={{
        left: playerX - glowSize,
        top: playerY - glowSize,
        width: glowSize * 2 + playerSize,
        height: glowSize * 2 + playerSize,
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          left: glowSize - playerSize / 2,
          top: glowSize - playerSize / 2,
          width: playerSize,
          height: playerSize,
          boxShadow: `
            0 0 ${15 * intensity * specialMultiplier}px ${glowColor},
            0 0 ${30 * intensity * specialMultiplier}px ${glowColor},
            0 0 ${45 * intensity * specialMultiplier}px ${mainColor}
          `,
          opacity: glowOpacity * specialMultiplier,
        }}
      />

      {particles.map((particle) => (
        <ParticleElement
          key={particle.id}
          particle={particle}
          centerX={glowSize + playerSize / 2}
          centerY={glowSize + playerSize / 2}
          color={particleColor}
          shape={getParticleShape()}
          animationClass={getAnimationClass()}
          velocity={playerVelocity}
        />
      ))}

      {isSpecial && (
        <>
          {[...Array(6)].map((_, i) => (
            <SparkleParticle
              key={`sparkle-${i}`}
              index={i}
              centerX={glowSize + playerSize / 2}
              centerY={glowSize + playerSize / 2}
              color={specialSparkleColor}
              playerSize={playerSize}
            />
          ))}
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              left: glowSize - playerSize * 0.3,
              top: glowSize - playerSize * 0.3,
              width: playerSize * 1.6,
              height: playerSize * 1.6,
              background: `radial-gradient(circle, ${specialSparkleColor}22 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      <TrailEffect
        centerX={glowSize + playerSize / 2}
        centerY={glowSize + playerSize / 2}
        color={mainColor}
        intensity={intensity}
        animationType={animationType}
        velocity={playerVelocity}
        playerSize={playerSize}
      />
    </div>
  );
}

interface ParticleElementProps {
  particle: Particle;
  centerX: number;
  centerY: number;
  color: string;
  shape: string;
  animationClass: string;
  velocity: number;
}

function ParticleElement({
  particle,
  centerX,
  centerY,
  color,
  shape,
  animationClass,
  velocity,
}: ParticleElementProps) {
  const velocityOffset = Math.abs(velocity) * 0.3;
  
  return (
    <div
      className={`absolute ${animationClass}`}
      style={{
        left: centerX + particle.offsetX - particle.size / 2,
        top: centerY + particle.offsetY + velocityOffset - particle.size / 2,
        width: particle.size,
        height: particle.size,
        opacity: particle.opacity,
        animationDelay: `${particle.delay}s`,
        animationDuration: `${particle.duration}s`,
      }}
    >
      {shape === "star" ? (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <polygon
            points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9"
            fill={color}
          />
        </svg>
      ) : shape === "square" ? (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: color,
            transform: "rotate(45deg)",
          }}
        />
      ) : shape === "ring" ? (
        <div
          className="w-full h-full rounded-full border-2"
          style={{
            borderColor: color,
            backgroundColor: "transparent",
          }}
        />
      ) : (
        <div
          className="w-full h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
}

interface SparkleParticleProps {
  index: number;
  centerX: number;
  centerY: number;
  color: string;
  playerSize: number;
}

function SparkleParticle({
  index,
  centerX,
  centerY,
  color,
  playerSize,
}: SparkleParticleProps) {
  const angle = (index / 6) * Math.PI * 2;
  const radius = playerSize * 0.6;
  const x = centerX + Math.cos(angle) * radius;
  const y = centerY + Math.sin(angle) * radius;

  return (
    <div
      className="absolute skin-effect-sparkle-bright"
      style={{
        left: x - 4,
        top: y - 4,
        width: 8,
        height: 8,
        animationDelay: `${index * 0.15}s`,
      }}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <polygon
          points="12,0 14,10 24,12 14,14 12,24 10,14 0,12 10,10"
          fill={color}
        />
      </svg>
    </div>
  );
}

interface TrailEffectProps {
  centerX: number;
  centerY: number;
  color: string;
  intensity: number;
  animationType: string;
  velocity: number;
  playerSize: number;
}

function TrailEffect({
  centerX,
  centerY,
  color,
  intensity,
  animationType,
  velocity,
  playerSize,
}: TrailEffectProps) {
  const trailCount = Math.floor(3 + intensity * 4);
  const trails = useMemo(() => {
    return [...Array(trailCount)].map((_, i) => ({
      offset: (i + 1) * 8,
      opacity: (1 - i / trailCount) * 0.4 * intensity,
      size: playerSize * (0.8 - i * 0.1),
    }));
  }, [trailCount, intensity, playerSize]);

  const velocityDirection = velocity > 0 ? 1 : velocity < 0 ? -1 : 0;

  return (
    <>
      {trails.map((trail, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: centerX - trail.size / 2 - trail.offset * 0.5,
            top: centerY - trail.size / 2 - velocityDirection * trail.offset,
            width: trail.size,
            height: trail.size,
            backgroundColor: color,
            opacity: trail.opacity,
            filter: `blur(${2 + i}px)`,
          }}
        />
      ))}
    </>
  );
}

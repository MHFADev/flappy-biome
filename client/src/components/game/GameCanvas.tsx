import { useRef, useEffect, useCallback } from "react";
import type { GameState, BiomeType } from "@shared/schema";
import { biomeConfigs, difficultyConfigs } from "@/lib/gameConfig";
import { GAME_WIDTH, GAME_HEIGHT, OBSTACLE_WIDTH } from "@/lib/gameEngine";

interface GameCanvasProps {
  gameState: GameState;
  containerWidth: number;
  containerHeight: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function drawForestBackground(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#1a3a0a");
  gradient.addColorStop(0.3, "#2d5016");
  gradient.addColorStop(0.7, "#4a7c2c");
  gradient.addColorStop(1, "#3d6b1f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255, 220, 100, 0.15)";
  ctx.beginPath();
  ctx.arc(width - 80, 60, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 220, 100, 0.08)";
  ctx.beginPath();
  ctx.arc(width - 80, 60, 60, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 5; i++) {
    const cloudX = (seededRandom(i * 7) * width * 1.5 + time * 0.01) % (width + 100) - 50;
    const cloudY = 30 + seededRandom(i * 11) * 60;
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.ellipse(cloudX, cloudY, 40, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cloudX - 25, cloudY + 5, 25, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cloudX + 25, cloudY + 5, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let layer = 0; layer < 3; layer++) {
    const treeCount = 8 + layer * 4;
    const baseY = height - 50 - layer * 80;
    const alpha = 0.3 + layer * 0.2;
    const treeColor = layer === 2 ? "#1a3d0d" : layer === 1 ? "#234a12" : "#2d5a18";
    
    for (let i = 0; i < treeCount; i++) {
      const x = seededRandom(i + layer * 100) * width;
      const treeHeight = 80 + seededRandom(i * 3 + layer * 50) * 60;
      const treeWidth = 30 + seededRandom(i * 5 + layer * 50) * 20;
      
      ctx.fillStyle = treeColor;
      ctx.globalAlpha = alpha;
      
      if (seededRandom(i * 7 + layer) > 0.5) {
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x - treeWidth, baseY);
        ctx.lineTo(x - treeWidth * 0.7, baseY - treeHeight * 0.4);
        ctx.lineTo(x - treeWidth * 0.5, baseY - treeHeight * 0.4);
        ctx.lineTo(x - treeWidth * 0.4, baseY - treeHeight * 0.7);
        ctx.lineTo(x - treeWidth * 0.2, baseY - treeHeight * 0.7);
        ctx.lineTo(x, baseY - treeHeight);
        ctx.lineTo(x + treeWidth * 0.2, baseY - treeHeight * 0.7);
        ctx.lineTo(x + treeWidth * 0.4, baseY - treeHeight * 0.7);
        ctx.lineTo(x + treeWidth * 0.5, baseY - treeHeight * 0.4);
        ctx.lineTo(x + treeWidth * 0.7, baseY - treeHeight * 0.4);
        ctx.lineTo(x + treeWidth, baseY);
        ctx.closePath();
        ctx.fill();
      } else {
        const trunkWidth = treeWidth * 0.15;
        ctx.fillRect(x - trunkWidth, baseY - treeHeight * 0.4, trunkWidth * 2, treeHeight * 0.4);
        ctx.beginPath();
        ctx.arc(x, baseY - treeHeight * 0.5, treeWidth * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - treeWidth * 0.3, baseY - treeHeight * 0.4, treeWidth * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + treeWidth * 0.35, baseY - treeHeight * 0.45, treeWidth * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  for (let i = 0; i < 15; i++) {
    const leafX = (seededRandom(i * 13) * width + time * (0.3 + seededRandom(i * 17) * 0.3)) % width;
    const leafY = (seededRandom(i * 19) * height * 0.7 + time * (0.5 + seededRandom(i * 23) * 0.3)) % (height * 0.8);
    const leafSize = 4 + seededRandom(i * 29) * 4;
    const rotation = (time * 0.02 + seededRandom(i * 31) * Math.PI * 2);
    
    ctx.save();
    ctx.translate(leafX, leafY);
    ctx.rotate(rotation);
    ctx.fillStyle = seededRandom(i * 37) > 0.5 ? "rgba(76, 140, 43, 0.6)" : "rgba(139, 180, 75, 0.6)";
    ctx.beginPath();
    ctx.ellipse(0, 0, leafSize, leafSize * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const grassGradient = ctx.createLinearGradient(0, height - 30, 0, height);
  grassGradient.addColorStop(0, "#4a7c2c");
  grassGradient.addColorStop(1, "#3d6b1f");
  ctx.fillStyle = grassGradient;
  ctx.fillRect(0, height - 30, width, 30);
  
  for (let i = 0; i < 50; i++) {
    const grassX = seededRandom(i * 41) * width;
    const grassHeight = 10 + seededRandom(i * 43) * 15;
    const sway = Math.sin(time * 0.003 + i) * 2;
    ctx.strokeStyle = "rgba(60, 100, 30, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(grassX, height - 30);
    ctx.quadraticCurveTo(grassX + sway, height - 30 - grassHeight * 0.5, grassX + sway * 1.5, height - 30 - grassHeight);
    ctx.stroke();
  }
}

function drawIceBackground(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0a1628");
  gradient.addColorStop(0.4, "#1a2942");
  gradient.addColorStop(0.7, "#2a4a6a");
  gradient.addColorStop(1, "#4a6fa5");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 3; i++) {
    const auroraY = 30 + i * 25;
    const auroraGradient = ctx.createLinearGradient(0, auroraY - 20, 0, auroraY + 20);
    auroraGradient.addColorStop(0, "rgba(0, 255, 150, 0)");
    auroraGradient.addColorStop(0.5, `rgba(0, 255, 150, ${0.1 + Math.sin(time * 0.002 + i) * 0.05})`);
    auroraGradient.addColorStop(1, "rgba(0, 255, 150, 0)");
    ctx.fillStyle = auroraGradient;
    
    ctx.beginPath();
    ctx.moveTo(0, auroraY);
    for (let x = 0; x <= width; x += 20) {
      const y = auroraY + Math.sin(x * 0.01 + time * 0.002 + i) * 15;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, auroraY + 30);
    ctx.lineTo(0, auroraY + 30);
    ctx.closePath();
    ctx.fill();
  }

  for (let layer = 0; layer < 3; layer++) {
    const mountainCount = 4 + layer * 2;
    const baseY = height - 80 + layer * 20;
    const alpha = 0.4 + layer * 0.2;
    
    for (let i = 0; i < mountainCount; i++) {
      const x = seededRandom(i + layer * 100 + 500) * width;
      const mountainHeight = 100 + seededRandom(i * 3 + layer * 50 + 500) * 80;
      const mountainWidth = 60 + seededRandom(i * 5 + layer * 50 + 500) * 40;
      
      const mountainGradient = ctx.createLinearGradient(x, baseY, x, baseY - mountainHeight);
      mountainGradient.addColorStop(0, `rgba(100, 140, 180, ${alpha})`);
      mountainGradient.addColorStop(0.6, `rgba(150, 180, 210, ${alpha})`);
      mountainGradient.addColorStop(1, `rgba(220, 240, 255, ${alpha})`);
      ctx.fillStyle = mountainGradient;
      
      ctx.beginPath();
      ctx.moveTo(x - mountainWidth, baseY);
      ctx.lineTo(x - mountainWidth * 0.1, baseY - mountainHeight);
      ctx.lineTo(x + mountainWidth * 0.15, baseY - mountainHeight * 0.85);
      ctx.lineTo(x + mountainWidth, baseY);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(x - mountainWidth * 0.1, baseY - mountainHeight);
      ctx.lineTo(x - mountainWidth * 0.3, baseY - mountainHeight * 0.75);
      ctx.lineTo(x + mountainWidth * 0.15, baseY - mountainHeight * 0.85);
      ctx.closePath();
      ctx.fill();
    }
  }

  for (let i = 0; i < 8; i++) {
    const icicleX = seededRandom(i * 47 + 200) * width;
    const icicleHeight = 30 + seededRandom(i * 53 + 200) * 40;
    const icicleWidth = 8 + seededRandom(i * 59 + 200) * 8;
    
    const icicleGradient = ctx.createLinearGradient(icicleX, 0, icicleX, icicleHeight);
    icicleGradient.addColorStop(0, "rgba(180, 220, 255, 0.8)");
    icicleGradient.addColorStop(1, "rgba(100, 180, 255, 0.4)");
    ctx.fillStyle = icicleGradient;
    
    ctx.beginPath();
    ctx.moveTo(icicleX - icicleWidth / 2, 0);
    ctx.lineTo(icicleX, icicleHeight);
    ctx.lineTo(icicleX + icicleWidth / 2, 0);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = 0; i < 30; i++) {
    const snowX = (seededRandom(i * 61 + 300) * width + time * (0.2 + seededRandom(i * 67) * 0.2)) % width;
    const snowY = (seededRandom(i * 71 + 300) * height + time * (0.3 + seededRandom(i * 73) * 0.2)) % height;
    const snowSize = 2 + seededRandom(i * 79 + 300) * 3;
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.arc(snowX, snowY, snowSize, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 6; i++) {
    const crystalX = seededRandom(i * 83 + 400) * width;
    const crystalY = height - 60 + seededRandom(i * 89 + 400) * 40;
    const crystalSize = 15 + seededRandom(i * 97 + 400) * 15;
    
    ctx.strokeStyle = "rgba(150, 200, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let j = 0; j < 6; j++) {
      const angle = (j / 6) * Math.PI * 2;
      ctx.moveTo(crystalX, crystalY);
      ctx.lineTo(crystalX + Math.cos(angle) * crystalSize, crystalY + Math.sin(angle) * crystalSize);
    }
    ctx.stroke();
  }

  const groundGradient = ctx.createLinearGradient(0, height - 25, 0, height);
  groundGradient.addColorStop(0, "rgba(180, 210, 240, 0.5)");
  groundGradient.addColorStop(1, "rgba(200, 230, 255, 0.7)");
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, height - 25, width, 25);
}

function drawMagmaBackground(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#1a0505");
  gradient.addColorStop(0.3, "#3d1308");
  gradient.addColorStop(0.6, "#5a1a0a");
  gradient.addColorStop(1, "#8b2e0b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 8; i++) {
    const smokeX = seededRandom(i * 101 + 600) * width;
    const smokeBaseY = height - 80;
    const smokeOffset = Math.sin(time * 0.002 + i) * 10;
    
    for (let j = 0; j < 4; j++) {
      const puffY = smokeBaseY - j * 40 - (time * 0.1) % 160;
      const puffSize = 20 + j * 15;
      const puffAlpha = Math.max(0, 0.2 - j * 0.04);
      
      ctx.fillStyle = `rgba(80, 60, 50, ${puffAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX + smokeOffset, puffY, puffSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let layer = 0; layer < 2; layer++) {
    const rockCount = 6 + layer * 3;
    const baseY = height - 60 + layer * 30;
    
    for (let i = 0; i < rockCount; i++) {
      const x = seededRandom(i + layer * 200 + 700) * width;
      const rockHeight = 50 + seededRandom(i * 3 + layer * 50 + 700) * 40;
      const rockWidth = 40 + seededRandom(i * 5 + layer * 50 + 700) * 30;
      
      const rockGradient = ctx.createLinearGradient(x, baseY, x, baseY - rockHeight);
      rockGradient.addColorStop(0, "#2a1510");
      rockGradient.addColorStop(0.5, "#3d2015");
      rockGradient.addColorStop(1, "#1a0a08");
      ctx.fillStyle = rockGradient;
      
      ctx.beginPath();
      ctx.moveTo(x - rockWidth, baseY);
      ctx.lineTo(x - rockWidth * 0.7, baseY - rockHeight * 0.6);
      ctx.lineTo(x - rockWidth * 0.2, baseY - rockHeight);
      ctx.lineTo(x + rockWidth * 0.3, baseY - rockHeight * 0.8);
      ctx.lineTo(x + rockWidth, baseY);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = "rgba(255, 100, 0, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - rockWidth * 0.5, baseY - rockHeight * 0.3);
      ctx.lineTo(x - rockWidth * 0.2, baseY - rockHeight * 0.5);
      ctx.lineTo(x + rockWidth * 0.1, baseY - rockHeight * 0.3);
      ctx.stroke();
    }
  }

  const lavaGradient = ctx.createLinearGradient(0, height - 40, 0, height);
  lavaGradient.addColorStop(0, "#ff4500");
  lavaGradient.addColorStop(0.3, "#ff6a00");
  lavaGradient.addColorStop(0.7, "#ff8c00");
  lavaGradient.addColorStop(1, "#ffaa00");
  ctx.fillStyle = lavaGradient;
  
  ctx.beginPath();
  ctx.moveTo(0, height - 35);
  for (let x = 0; x <= width; x += 30) {
    const waveY = height - 35 + Math.sin(x * 0.02 + time * 0.003) * 5;
    ctx.lineTo(x, waveY);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 6; i++) {
    const bubbleX = seededRandom(i * 107 + 800) * width;
    const bubblePhase = (time * 0.005 + seededRandom(i * 109)) % 1;
    const bubbleY = height - 30 - bubblePhase * 20;
    const bubbleSize = 5 + seededRandom(i * 113 + 800) * 5;
    
    ctx.fillStyle = `rgba(255, 200, 0, ${0.6 - bubblePhase * 0.5})`;
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleSize * (1 - bubblePhase * 0.3), 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 20; i++) {
    const emberX = (seededRandom(i * 127 + 900) * width + time * 0.1) % width;
    const emberY = height - 50 - (time * (0.5 + seededRandom(i * 131) * 0.5) + seededRandom(i * 137) * height) % (height * 0.7);
    const emberSize = 2 + seededRandom(i * 139 + 900) * 3;
    const emberAlpha = 0.8 - (height - emberY) / height * 0.6;
    
    ctx.fillStyle = seededRandom(i * 149) > 0.5 ? 
      `rgba(255, 150, 0, ${emberAlpha})` : 
      `rgba(255, 80, 0, ${emberAlpha})`;
    ctx.beginPath();
    ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 5; i++) {
    const flameX = seededRandom(i * 151 + 1000) * width;
    const flameHeight = 40 + seededRandom(i * 157 + 1000) * 30;
    const flameWidth = 15 + seededRandom(i * 163 + 1000) * 10;
    const flicker = Math.sin(time * 0.01 + i * 2) * 5;
    
    const flameGradient = ctx.createLinearGradient(flameX, height - 40, flameX, height - 40 - flameHeight);
    flameGradient.addColorStop(0, "rgba(255, 200, 0, 0.8)");
    flameGradient.addColorStop(0.5, "rgba(255, 100, 0, 0.6)");
    flameGradient.addColorStop(1, "rgba(255, 50, 0, 0)");
    ctx.fillStyle = flameGradient;
    
    ctx.beginPath();
    ctx.moveTo(flameX - flameWidth, height - 40);
    ctx.quadraticCurveTo(flameX - flameWidth * 0.5 + flicker, height - 40 - flameHeight * 0.5, flameX + flicker * 0.5, height - 40 - flameHeight);
    ctx.quadraticCurveTo(flameX + flameWidth * 0.5 + flicker, height - 40 - flameHeight * 0.5, flameX + flameWidth, height - 40);
    ctx.closePath();
    ctx.fill();
  }
}

function drawVoidBackground(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#050510");
  gradient.addColorStop(0.5, "#0a0a18");
  gradient.addColorStop(1, "#12122a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(139, 92, 246, 0.1)";
  ctx.lineWidth = 1;
  const gridSize = 40;
  const gridOffset = (time * 0.5) % gridSize;
  
  for (let x = -gridOffset; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = -gridOffset; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  for (let i = 0; i < 8; i++) {
    const hexX = seededRandom(i * 167 + 1100) * width;
    const hexY = seededRandom(i * 173 + 1100) * height;
    const hexSize = 20 + seededRandom(i * 179 + 1100) * 20;
    const rotation = time * 0.001 + seededRandom(i * 181);
    const pulseAlpha = 0.2 + Math.sin(time * 0.003 + i) * 0.1;
    
    ctx.save();
    ctx.translate(hexX, hexY);
    ctx.rotate(rotation);
    ctx.strokeStyle = `rgba(139, 92, 246, ${pulseAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let j = 0; j < 6; j++) {
      const angle = (j / 6) * Math.PI * 2;
      const px = Math.cos(angle) * hexSize;
      const py = Math.sin(angle) * hexSize;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  for (let i = 0; i < 6; i++) {
    const streamX = seededRandom(i * 191 + 1200) * width;
    const streamY = (seededRandom(i * 193 + 1200) * height + time * 0.5) % (height + 100) - 50;
    const streamLength = 50 + seededRandom(i * 197 + 1200) * 100;
    
    const streamGradient = ctx.createLinearGradient(streamX, streamY, streamX, streamY + streamLength);
    streamGradient.addColorStop(0, "rgba(6, 182, 212, 0)");
    streamGradient.addColorStop(0.3, "rgba(6, 182, 212, 0.4)");
    streamGradient.addColorStop(0.7, "rgba(139, 92, 246, 0.4)");
    streamGradient.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.strokeStyle = streamGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(streamX, streamY);
    ctx.lineTo(streamX + (seededRandom(i * 199) - 0.5) * 20, streamY + streamLength);
    ctx.stroke();
  }

  for (let i = 0; i < 12; i++) {
    const circuitX = seededRandom(i * 211 + 1300) * width;
    const circuitY = seededRandom(i * 223 + 1300) * height;
    const circuitLength = 30 + seededRandom(i * 227 + 1300) * 60;
    const direction = seededRandom(i * 229) > 0.5;
    const glowIntensity = 0.3 + Math.sin(time * 0.005 + i * 0.5) * 0.2;
    
    ctx.strokeStyle = `rgba(6, 182, 212, ${glowIntensity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(circuitX, circuitY);
    if (direction) {
      ctx.lineTo(circuitX + circuitLength, circuitY);
      ctx.lineTo(circuitX + circuitLength, circuitY + circuitLength * 0.5);
    } else {
      ctx.lineTo(circuitX, circuitY + circuitLength);
      ctx.lineTo(circuitX + circuitLength * 0.5, circuitY + circuitLength);
    }
    ctx.stroke();
    
    ctx.fillStyle = `rgba(6, 182, 212, ${glowIntensity + 0.2})`;
    ctx.beginPath();
    ctx.arc(circuitX, circuitY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 25; i++) {
    const dataX = (seededRandom(i * 233 + 1400) * width + time * (0.2 + seededRandom(i * 239) * 0.3)) % width;
    const dataY = seededRandom(i * 241 + 1400) * height;
    const dataSize = 1 + seededRandom(i * 251 + 1400) * 2;
    const dataAlpha = 0.4 + seededRandom(i * 257) * 0.4;
    
    ctx.fillStyle = seededRandom(i * 263) > 0.5 ? 
      `rgba(139, 92, 246, ${dataAlpha})` : 
      `rgba(6, 182, 212, ${dataAlpha})`;
    ctx.fillRect(dataX, dataY, dataSize, dataSize);
  }

  for (let i = 0; i < 5; i++) {
    const orbX = seededRandom(i * 269 + 1500) * width;
    const orbY = seededRandom(i * 271 + 1500) * height;
    const orbSize = 8 + seededRandom(i * 277 + 1500) * 12;
    const orbPulse = 1 + Math.sin(time * 0.004 + i * 1.5) * 0.3;
    
    const orbGradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize * orbPulse);
    orbGradient.addColorStop(0, "rgba(139, 92, 246, 0.6)");
    orbGradient.addColorStop(0.5, "rgba(139, 92, 246, 0.2)");
    orbGradient.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbSize * orbPulse, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  biome: BiomeType,
  width: number,
  height: number
) {
  const time = Date.now();
  
  switch (biome) {
    case "forest":
      drawForestBackground(ctx, width, height, time);
      break;
    case "ice":
      drawIceBackground(ctx, width, height, time);
      break;
    case "magma":
      drawMagmaBackground(ctx, width, height, time);
      break;
    case "void":
      drawVoidBackground(ctx, width, height, time);
      break;
    default:
      const config = biomeConfigs[biome];
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, config.backgroundGradient[0]);
      gradient.addColorStop(1, config.backgroundGradient[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
  }
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  gapY: number,
  gapHeight: number,
  width: number,
  height: number,
  color: string,
  isInvisibleMode: boolean,
  playerX: number,
  gameTime: number // Use game-elapsed time that respects pause state
) {
  const distance = x - playerX;
  const fadeDistance = 150;
  let opacity = 1;
  let isGlowPhase = false;
  
  if (isInvisibleMode) {
    // Calculate cycle time for masochist mode using game time (respects pause)
    // 10 second total cycle: 3 seconds visible with glow, 7 seconds completely invisible
    const cycleTime = gameTime % 10000;
    isGlowPhase = cycleTime < 3000; // First 3 seconds = glow phase
    
    if (isGlowPhase) {
      // During glow phase, pipes are fully visible with glow effect
      opacity = 1;
    } else {
      // During invisible phase (7 seconds), pipes are completely invisible
      opacity = 0;
    }
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  
  // Add purple glow effect during glow phase in masochist mode
  if (isInvisibleMode && isGlowPhase) {
    ctx.shadowColor = "#7c3aed";
    ctx.shadowBlur = 20;
  }

  const gapTop = gapY - gapHeight / 2;
  const gapBottom = gapY + gapHeight / 2;

  const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, adjustColor(color, 20));
  gradient.addColorStop(1, color);

  ctx.fillStyle = gradient;
  ctx.strokeStyle = adjustColor(color, -30);
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect(x, 0, width, gapTop, [0, 0, 8, 8]);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(x, gapBottom, width, height - gapBottom, [8, 8, 0, 0]);
  ctx.fill();
  ctx.stroke();

  const capHeight = 20;
  ctx.fillStyle = adjustColor(color, 15);
  ctx.beginPath();
  ctx.roundRect(x - 5, gapTop - capHeight, width + 10, capHeight, [4, 4, 0, 0]);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(x - 5, gapBottom, width + 10, capHeight, [0, 0, 4, 4]);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawHazard(
  ctx: CanvasRenderingContext2D,
  hazard: { type: string; x: number; y: number; width: number; height: number; active: boolean },
  biome: BiomeType
) {
  if (!hazard.active) return;

  ctx.save();

  switch (hazard.type) {
    case "spike":
      const spikeGradient = ctx.createLinearGradient(hazard.x, hazard.y, hazard.x, hazard.y + hazard.height);
      spikeGradient.addColorStop(0, "#5b8fbf");
      spikeGradient.addColorStop(1, "#a8d4f7");
      ctx.fillStyle = spikeGradient;
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y + hazard.height);
      ctx.lineTo(hazard.x + hazard.width / 2, hazard.y);
      ctx.lineTo(hazard.x + hazard.width, hazard.y + hazard.height);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3a6b8f";
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case "firePillar":
      const fireGradient = ctx.createLinearGradient(hazard.x, hazard.y, hazard.x + hazard.width, hazard.y);
      fireGradient.addColorStop(0, "#ff4500");
      fireGradient.addColorStop(0.5, "#ff8c00");
      fireGradient.addColorStop(1, "#ff4500");
      ctx.fillStyle = fireGradient;
      ctx.beginPath();
      ctx.roundRect(hazard.x, hazard.y, hazard.width, hazard.height, 8);
      ctx.fill();

      for (let i = 0; i < 5; i++) {
        const flameX = hazard.x + (hazard.width / 5) * i + 5;
        const flameY = hazard.y - 10 - Math.random() * 15;
        ctx.beginPath();
        ctx.arc(flameX, flameY, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 0, ${0.5 + Math.random() * 0.5})`;
        ctx.fill();
      }
      break;

    case "laser":
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = hazard.height;
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(0, hazard.y + hazard.height / 2);
      ctx.lineTo(GAME_WIDTH, hazard.y + hazard.height / 2);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = hazard.height / 3;
      ctx.stroke();
      break;

    case "rocket":
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(hazard.x + hazard.width, hazard.y + hazard.height / 2);
      ctx.lineTo(hazard.x, hazard.y);
      ctx.lineTo(hazard.x + 10, hazard.y + hazard.height / 2);
      ctx.lineTo(hazard.x, hazard.y + hazard.height);
      ctx.closePath();
      ctx.fill();

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
          hazard.x + hazard.width + 5 + i * 8,
          hazard.y + hazard.height / 2 + (Math.random() - 0.5) * 6,
          4 - i,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, ${150 + i * 30}, 0, ${0.8 - i * 0.2})`;
        ctx.fill();
      }
      break;
  }

  ctx.restore();
}

function drawBuff(
  ctx: CanvasRenderingContext2D,
  buff: { type: string; x: number; y: number; collected: boolean },
  size: number
) {
  if (buff.collected) return;

  ctx.save();
  ctx.translate(buff.x, buff.y);

  const time = Date.now() / 500;
  const pulse = 1 + Math.sin(time) * 0.1;
  ctx.scale(pulse, pulse);

  ctx.shadowBlur = 15;
  
  switch (buff.type) {
    case "shield":
      ctx.shadowColor = "#3b82f6";
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.quadraticCurveTo(size / 2, -size / 3, size / 2, 0);
      ctx.quadraticCurveTo(size / 2, size / 2, 0, size / 2);
      ctx.quadraticCurveTo(-size / 2, size / 2, -size / 2, 0);
      ctx.quadraticCurveTo(-size / 2, -size / 3, 0, -size / 2);
      ctx.fill();
      ctx.strokeStyle = "#93c5fd";
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case "timeSlow":
      ctx.shadowColor = "#8b5cf6";
      ctx.fillStyle = "#8b5cf6";
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c4b5fd";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size / 3);
      ctx.moveTo(0, 0);
      ctx.lineTo(size / 4, 0);
      ctx.stroke();
      break;

    case "multiplier":
      ctx.shadowColor = "#f59e0b";
      ctx.fillStyle = "#f59e0b";
      const points = 5;
      const outer = size / 2;
      const inner = size / 4;
      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const r = i % 2 === 0 ? outer : inner;
        if (i === 0) {
          ctx.moveTo(r * Math.cos(angle), r * Math.sin(angle));
        } else {
          ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fcd34d";
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
  }

  ctx.restore();
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function GameCanvas({ gameState, containerWidth, containerHeight }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);

  gameStateRef.current = gameState;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const currentGameState = gameStateRef.current;
      
      const scaleX = containerWidth / GAME_WIDTH;
      const scaleY = containerHeight / GAME_HEIGHT;
      const scale = Math.min(scaleX, scaleY);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      const offsetX = (containerWidth - GAME_WIDTH * scale) / 2;
      const offsetY = (containerHeight - GAME_HEIGHT * scale) / 2;
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      drawBackground(ctx, currentGameState.currentBiome, GAME_WIDTH, GAME_HEIGHT);

      const biomeConfig = biomeConfigs[currentGameState.currentBiome];
      const diffConfig = difficultyConfigs[currentGameState.difficulty];

      for (const obstacle of currentGameState.obstacles) {
        drawObstacle(
          ctx,
          obstacle.x,
          obstacle.gapY,
          obstacle.gapHeight,
          obstacle.width,
          GAME_HEIGHT,
          biomeConfig.obstacleColor,
          diffConfig.invisibleMode,
          currentGameState.playerPosition.x,
          currentGameState.gameTime
        );
      }

      for (const hazard of currentGameState.hazards) {
        drawHazard(ctx, hazard, currentGameState.currentBiome);
      }

      for (const buff of currentGameState.buffs) {
        drawBuff(ctx, buff, 28);
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerWidth, containerHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={containerWidth}
      height={containerHeight}
      className="absolute inset-0"
      data-testid="canvas-game"
    />
  );
}

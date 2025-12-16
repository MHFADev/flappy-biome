import type { GameState, Obstacle, BuffItem, Hazard, BiomeType, Difficulty, ActiveBuff, BuffType } from "@shared/schema";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SIZE,
  PLAYER_X,
  GRAVITY,
  JUMP_FORCE,
  MAX_VELOCITY,
  OBSTACLE_WIDTH,
  BUFF_SIZE,
  BUFF_SPAWN_CHANCE,
  HAZARD_SPAWN_CHANCE,
  biomeConfigs,
  difficultyConfigs,
  getBiomeForScore,
  generateId,
} from "./gameConfig";

export function createInitialGameState(difficulty: Difficulty, skin: string): GameState {
  return {
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    score: 0,
    highScore: 0,
    currentBiome: "forest",
    difficulty,
    selectedSkin: skin as any,
    activeBuffs: [],
    playerPosition: { x: PLAYER_X, y: GAME_HEIGHT / 2 },
    playerVelocity: 0,
    playerRotation: 0,
    obstacles: [],
    buffs: [],
    hazards: [],
    gameTime: 0,
  };
}

export function resetGameState(state: GameState): GameState {
  return {
    ...state,
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    score: 0,
    currentBiome: "forest",
    activeBuffs: [],
    playerPosition: { x: PLAYER_X, y: GAME_HEIGHT / 2 },
    playerVelocity: 0,
    playerRotation: 0,
    obstacles: [],
    buffs: [],
    hazards: [],
    gameTime: 0,
  };
}

export function startGame(state: GameState): GameState {
  return {
    ...resetGameState(state),
    isPlaying: true,
  };
}

export function pauseGame(state: GameState): GameState {
  return {
    ...state,
    isPaused: !state.isPaused,
  };
}

export function jump(state: GameState): GameState {
  if (!state.isPlaying || state.isPaused || state.isGameOver) {
    return state;
  }
  return {
    ...state,
    playerVelocity: JUMP_FORCE,
  };
}

export function getTimeSlowMultiplier(activeBuffs: ActiveBuff[]): number {
  const timeSlow = activeBuffs.find(b => b.type === "timeSlow");
  return timeSlow ? 0.5 : 1;
}

export function getScoreMultiplier(activeBuffs: ActiveBuff[]): number {
  const multiplier = activeBuffs.find(b => b.type === "multiplier");
  return multiplier ? 2 : 1;
}

export function hasShield(activeBuffs: ActiveBuff[]): boolean {
  return activeBuffs.some(b => b.type === "shield");
}

export function removeShield(activeBuffs: ActiveBuff[]): ActiveBuff[] {
  const shieldIndex = activeBuffs.findIndex(b => b.type === "shield");
  if (shieldIndex === -1) return activeBuffs;
  return [...activeBuffs.slice(0, shieldIndex), ...activeBuffs.slice(shieldIndex + 1)];
}

export function updateActiveBuffs(activeBuffs: ActiveBuff[], now: number): ActiveBuff[] {
  return activeBuffs.filter(buff => buff.expiresAt > now);
}

export function addBuff(activeBuffs: ActiveBuff[], type: BuffType, duration: number = 5000): ActiveBuff[] {
  const existingIndex = activeBuffs.findIndex(b => b.type === type);
  const newBuff: ActiveBuff = {
    type,
    expiresAt: Date.now() + duration,
  };

  if (existingIndex !== -1) {
    return [
      ...activeBuffs.slice(0, existingIndex),
      newBuff,
      ...activeBuffs.slice(existingIndex + 1),
    ];
  }
  return [...activeBuffs, newBuff];
}

export function spawnObstacle(state: GameState): Obstacle {
  const diffConfig = difficultyConfigs[state.difficulty];
  const gapHeight = diffConfig.gapSize;
  const minGapY = gapHeight / 2 + 50;
  const maxGapY = GAME_HEIGHT - gapHeight / 2 - 50;
  const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

  return {
    id: generateId(),
    x: GAME_WIDTH + OBSTACLE_WIDTH,
    gapY,
    gapHeight,
    width: OBSTACLE_WIDTH,
    passed: false,
  };
}

export function spawnBuff(x: number): BuffItem | null {
  if (Math.random() > BUFF_SPAWN_CHANCE) return null;

  const buffTypes: BuffType[] = ["shield", "timeSlow", "multiplier"];
  const type = buffTypes[Math.floor(Math.random() * buffTypes.length)];
  const y = Math.random() * (GAME_HEIGHT - 100) + 50;

  return {
    id: generateId(),
    type,
    x,
    y,
    collected: false,
  };
}

export function spawnHazard(biome: BiomeType, x: number): Hazard | null {
  const biomeConfig = biomeConfigs[biome];
  if (biomeConfig.hazards.length === 0 || Math.random() > HAZARD_SPAWN_CHANCE) return null;

  const hazardType = biomeConfig.hazards[Math.floor(Math.random() * biomeConfig.hazards.length)];
  const y = Math.random() * (GAME_HEIGHT - 100) + 50;

  let width = 30;
  let height = 30;
  let velocityX = 0;
  let velocityY = 0;

  switch (hazardType) {
    case "spike":
      width = 40;
      height = 60;
      velocityY = 2;
      break;
    case "firePillar":
      width = 50;
      height = 120;
      velocityY = Math.random() > 0.5 ? 1 : -1;
      break;
    case "laser":
      width = GAME_WIDTH;
      height = 8;
      break;
    case "rocket":
      width = 40;
      height = 20;
      velocityX = -6;
      break;
  }

  return {
    id: generateId(),
    type: hazardType,
    x,
    y,
    width,
    height,
    active: true,
    velocityX,
    velocityY,
  };
}

export function checkCollision(
  playerX: number,
  playerY: number,
  obstacle: Obstacle
): boolean {
  const playerRadius = PLAYER_SIZE / 2;
  const playerLeft = playerX - playerRadius * 0.7;
  const playerRight = playerX + playerRadius * 0.7;
  const playerTop = playerY - playerRadius * 0.7;
  const playerBottom = playerY + playerRadius * 0.7;

  const obstacleLeft = obstacle.x;
  const obstacleRight = obstacle.x + obstacle.width;
  const gapTop = obstacle.gapY - obstacle.gapHeight / 2;
  const gapBottom = obstacle.gapY + obstacle.gapHeight / 2;

  if (playerRight > obstacleLeft && playerLeft < obstacleRight) {
    if (playerTop < gapTop || playerBottom > gapBottom) {
      return true;
    }
  }

  return false;
}

export function checkHazardCollision(
  playerX: number,
  playerY: number,
  hazard: Hazard
): boolean {
  if (!hazard.active) return false;

  const playerRadius = PLAYER_SIZE / 2;
  const playerLeft = playerX - playerRadius * 0.7;
  const playerRight = playerX + playerRadius * 0.7;
  const playerTop = playerY - playerRadius * 0.7;
  const playerBottom = playerY + playerRadius * 0.7;

  const hazardLeft = hazard.x;
  const hazardRight = hazard.x + hazard.width;
  const hazardTop = hazard.y;
  const hazardBottom = hazard.y + hazard.height;

  return (
    playerRight > hazardLeft &&
    playerLeft < hazardRight &&
    playerBottom > hazardTop &&
    playerTop < hazardBottom
  );
}

export function checkBuffCollision(
  playerX: number,
  playerY: number,
  buff: BuffItem
): boolean {
  if (buff.collected) return false;

  const playerRadius = PLAYER_SIZE / 2;
  const buffRadius = BUFF_SIZE / 2;
  const dx = playerX - buff.x;
  const dy = playerY - buff.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < playerRadius + buffRadius;
}

export function updateGame(state: GameState, deltaTime: number = 16): GameState {
  if (!state.isPlaying || state.isPaused || state.isGameOver) {
    return state;
  }

  const now = Date.now();
  const diffConfig = difficultyConfigs[state.difficulty];
  const biomeConfig = biomeConfigs[state.currentBiome];
  const timeMultiplier = getTimeSlowMultiplier(state.activeBuffs);
  const scoreMultiplier = getScoreMultiplier(state.activeBuffs);

  const effectiveGravity = GRAVITY * biomeConfig.gravity;
  let newVelocity = state.playerVelocity + effectiveGravity * timeMultiplier;
  newVelocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, newVelocity));

  let newY = state.playerPosition.y + newVelocity * timeMultiplier;

  if (newY < PLAYER_SIZE / 2 || newY > GAME_HEIGHT - PLAYER_SIZE / 2) {
    if (hasShield(state.activeBuffs)) {
      return {
        ...state,
        activeBuffs: removeShield(state.activeBuffs),
        playerPosition: { ...state.playerPosition, y: Math.max(PLAYER_SIZE / 2, Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, newY)) },
        playerVelocity: 0,
      };
    }
    return {
      ...state,
      isGameOver: true,
      isPlaying: false,
      highScore: Math.max(state.highScore, state.score),
    };
  }

  const rotation = Math.max(-30, Math.min(30, newVelocity * 3));

  const speed = diffConfig.speed * timeMultiplier;
  let newObstacles = state.obstacles
    .map(obs => ({ ...obs, x: obs.x - speed }))
    .filter(obs => obs.x + obs.width > -50);

  let newBuffs = state.buffs
    .map(buff => ({ ...buff, x: buff.x - speed }))
    .filter(buff => buff.x > -50 && !buff.collected);

  let newHazards = state.hazards
    .map(hazard => ({
      ...hazard,
      x: hazard.x + (hazard.velocityX || 0) * timeMultiplier - (hazard.type !== "laser" ? speed : 0),
      y: hazard.y + (hazard.velocityY || 0) * timeMultiplier,
    }))
    .filter(hazard => hazard.x > -100 && hazard.x < GAME_WIDTH + 100);

  const shouldSpawnObstacle =
    newObstacles.length === 0 ||
    newObstacles[newObstacles.length - 1].x < GAME_WIDTH - diffConfig.obstacleFrequency;

  if (shouldSpawnObstacle) {
    const newObstacle = spawnObstacle(state);
    newObstacles.push(newObstacle);

    const newBuff = spawnBuff(newObstacle.x + OBSTACLE_WIDTH / 2);
    if (newBuff) {
      newBuffs.push(newBuff);
    }

    if (diffConfig.rocketsEnabled || biomeConfig.hazards.length > 0) {
      const newHazard = spawnHazard(state.currentBiome, GAME_WIDTH + 50);
      if (newHazard) {
        newHazards.push(newHazard);
      }
    }
  }

  let newScore = state.score;
  let collided = false;
  let activeBuffs = updateActiveBuffs(state.activeBuffs, now);

  for (const obstacle of newObstacles) {
    if (!obstacle.passed && obstacle.x + obstacle.width < PLAYER_X) {
      obstacle.passed = true;
      newScore += 1 * scoreMultiplier;
    }

    if (checkCollision(PLAYER_X, newY, obstacle)) {
      collided = true;
      break;
    }
  }

  if (!collided) {
    for (const hazard of newHazards) {
      if (checkHazardCollision(PLAYER_X, newY, hazard)) {
        collided = true;
        break;
      }
    }
  }

  if (collided) {
    if (hasShield(activeBuffs)) {
      activeBuffs = removeShield(activeBuffs);
      collided = false;
    } else {
      return {
        ...state,
        isGameOver: true,
        isPlaying: false,
        highScore: Math.max(state.highScore, newScore),
        score: newScore,
      };
    }
  }

  for (const buff of newBuffs) {
    if (!buff.collected && checkBuffCollision(PLAYER_X, newY, buff)) {
      buff.collected = true;
      activeBuffs = addBuff(activeBuffs, buff.type);
    }
  }

  const newBiome = getBiomeForScore(newScore);

  return {
    ...state,
    playerPosition: { x: PLAYER_X, y: newY },
    playerVelocity: newVelocity,
    playerRotation: rotation,
    obstacles: newObstacles,
    buffs: newBuffs,
    hazards: newHazards,
    score: newScore,
    currentBiome: newBiome,
    activeBuffs,
    gameTime: state.gameTime + deltaTime, // Increment game time only when game is running
  };
}

export { GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE, PLAYER_X };

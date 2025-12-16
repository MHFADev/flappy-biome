import type { BiomeType, Difficulty, BiomeConfig, DifficultyConfig } from "@shared/schema";

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const PLAYER_SIZE = 48;
export const PLAYER_X = 100;
export const GRAVITY = 0.5;
export const JUMP_FORCE = -8;
export const MAX_VELOCITY = 12;
export const OBSTACLE_WIDTH = 80;
export const BASE_GAP_HEIGHT = 180;
export const BASE_SPEED = 4;
export const OBSTACLE_SPAWN_DISTANCE = 400;
export const BUFF_SIZE = 32;
export const BUFF_SPAWN_CHANCE = 0.15;
export const HAZARD_SPAWN_CHANCE = 0.3;

export const biomeConfigs: Record<BiomeType, BiomeConfig> = {
  forest: {
    name: "Forest",
    backgroundGradient: ["#2d5016", "#4a7c2c"],
    obstacleColor: "#3d6b1f",
    particleType: "leaf",
    gravity: 1,
    friction: 1,
    hazards: [],
  },
  ice: {
    name: "Ice Cavern",
    backgroundGradient: ["#1a2942", "#4a6fa5"],
    obstacleColor: "#5b8fbf",
    particleType: "snowflake",
    gravity: 1,
    friction: 0.85,
    hazards: ["spike"],
  },
  magma: {
    name: "Magma Core",
    backgroundGradient: ["#3d1308", "#8b2e0b"],
    obstacleColor: "#d64810",
    particleType: "ember",
    gravity: 1.1,
    friction: 1,
    hazards: ["firePillar"],
  },
  void: {
    name: "Cyber Void",
    backgroundGradient: ["#0a0a12", "#1a1a2e"],
    obstacleColor: "#8b5cf6",
    particleType: "data",
    gravity: 1,
    friction: 1,
    hazards: ["laser", "rocket"],
  },
};

export const difficultyConfigs: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: "easy",
    label: "Easy",
    gapSize: 200,
    speed: 3,
    obstacleFrequency: 500,
    rocketsEnabled: false,
    invisibleMode: false,
    screenShake: false,
    color: "#22c55e",
  },
  normal: {
    name: "normal",
    label: "Normal",
    gapSize: 170,
    speed: 4,
    obstacleFrequency: 400,
    rocketsEnabled: false,
    invisibleMode: false,
    screenShake: false,
    color: "#84cc16",
  },
  hard: {
    name: "hard",
    label: "Hard",
    gapSize: 150,
    speed: 5,
    obstacleFrequency: 350,
    rocketsEnabled: false,
    invisibleMode: false,
    screenShake: false,
    color: "#eab308",
  },
  insane: {
    name: "insane",
    label: "Insane",
    gapSize: 140,
    speed: 6,
    obstacleFrequency: 300,
    rocketsEnabled: true,
    invisibleMode: false,
    screenShake: false,
    color: "#f97316",
  },
  expert: {
    name: "expert",
    label: "Expert",
    gapSize: 120,
    speed: 7,
    obstacleFrequency: 280,
    rocketsEnabled: true,
    invisibleMode: false,
    screenShake: false,
    color: "#ef4444",
  },
  masochist: {
    name: "masochist",
    label: "Masochist",
    gapSize: 110,
    speed: 8,
    obstacleFrequency: 250,
    rocketsEnabled: true,
    invisibleMode: true,
    screenShake: true,
    color: "#7c3aed",
  },
};

export const biomeOrder: BiomeType[] = ["forest", "ice", "magma", "void"];

export function getBiomeForScore(score: number): BiomeType {
  if (score < 10) return "forest";
  if (score < 25) return "ice";
  if (score < 45) return "magma";
  return "void";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

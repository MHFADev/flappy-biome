import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Difficulty Enum
export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "normal", 
  "hard",
  "insane",
  "expert",
  "masochist"
]);

// Skin rarity enum - ordered from common to legendary
export const rarityTypes = ["stone", "coal", "iron", "silver", "gold", "platinum", "diamond", "obsidian", "emerald"] as const;
export type RarityType = typeof rarityTypes[number];

// Rarity configuration with drop rates (must sum to 100)
export const rarityConfig: Record<RarityType, { name: string; dropRate: number; color: string; glowColor: string }> = {
  stone: { name: "Stone", dropRate: 30, color: "#808080", glowColor: "#a0a0a0" },
  coal: { name: "Coal", dropRate: 25, color: "#2d2d2d", glowColor: "#4d4d4d" },
  iron: { name: "Iron", dropRate: 18, color: "#b8b8b8", glowColor: "#d8d8d8" },
  silver: { name: "Silver", dropRate: 12, color: "#c0c0c0", glowColor: "#e8e8e8" },
  gold: { name: "Gold", dropRate: 7, color: "#ffd700", glowColor: "#ffed4a" },
  platinum: { name: "Platinum", dropRate: 4, color: "#e5e4e2", glowColor: "#ffffff" },
  diamond: { name: "Diamond", dropRate: 2.5, color: "#b9f2ff", glowColor: "#e0faff" },
  obsidian: { name: "Obsidian", dropRate: 1, color: "#1a0a2e", glowColor: "#3d1a6d" },
  emerald: { name: "Emerald", dropRate: 0.5, color: "#50c878", glowColor: "#7dff9c" },
};

// Skin types for the game
export const skinTypes = ["cute", "cyber", "fantasy", "glitch", "ufo"] as const;
export type SkinType = typeof skinTypes[number];

// Gacha skin categories
export const skinCategories = ["animal", "robot", "mythical", "cosmic", "elemental", "pixel", "neon", "stealth", "royal"] as const;
export type SkinCategory = typeof skinCategories[number];

// Complete gacha skin type
export interface GachaSkin {
  id: string;
  name: string;
  rarity: RarityType;
  category: SkinCategory;
  baseHue: number;
  pattern: number;
  animation: "float" | "pulse" | "spin" | "glitch" | "sparkle" | "wave" | "bounce" | "shake";
  special: boolean;
}

// Biome types
export const biomeTypes = ["forest", "ice", "magma", "void"] as const;
export type BiomeType = typeof biomeTypes[number];

// Buff types
export const buffTypes = ["shield", "timeSlow", "multiplier"] as const;
export type BuffType = typeof buffTypes[number];

// Difficulty type
export const difficulties = ["easy", "normal", "hard", "insane", "expert", "masochist"] as const;
export type Difficulty = typeof difficulties[number];

// Score table for leaderboard
export const scores = pgTable("scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  score: integer("score").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  skinUsed: text("skin_used").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Player data table for gacha (compressed inventory stored as base64)
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  coins: integer("coins").notNull().default(0),
  totalSpins: integer("total_spins").notNull().default(0),
  currentSpinStreak: integer("current_spin_streak").notNull().default(0),
  // Compressed inventory: bitfield encoded as base64 (max ~912 bytes for 80+ skins)
  inventoryData: text("inventory_data").notNull().default(""),
  selectedSkinId: text("selected_skin_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Gacha history (optional - for tracking pulls)
export const gachaHistory = pgTable("gacha_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull(),
  skinId: text("skin_id").notNull(),
  rarity: text("rarity").notNull(),
  coinsCost: integer("coins_cost").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertScoreSchema = createInsertSchema(scores).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGachaHistorySchema = createInsertSchema(gachaHistory).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scores.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertGachaHistory = z.infer<typeof insertGachaHistorySchema>;
export type GachaHistoryRecord = typeof gachaHistory.$inferSelect;

// Gacha spin result
export interface GachaSpinResult {
  skin: GachaSkin;
  isNew: boolean;
  isDuplicate: boolean;
  coinsRefund: number; // Coins given back for duplicates
}

// Player inventory decoded
export interface PlayerInventory {
  ownedSkinIds: string[];
  selectedSkinId: string | null;
}

// Gacha pricing
export const GACHA_BASE_COST = 100;
export const GACHA_PRICE_INCREASE_PERCENT = 10;
export const GACHA_PRICE_INCREASE_THRESHOLD = 10;
export const DUPLICATE_REFUND_PERCENT = 30;
export const MULTI_SPIN_COUNT = 10;
export const MULTI_SPIN_DISCOUNT = 0.9; // 10% discount
export const PITY_THRESHOLD = 50; // Guaranteed gold or better every 50 spins
export const PITY_GUARANTEED_RARITY = "gold"; // Minimum rarity at pity

// Calculate gacha cost based on spin streak
export function calculateGachaCost(spinStreak: number): number {
  const priceMultiplier = Math.floor(spinStreak / GACHA_PRICE_INCREASE_THRESHOLD);
  return Math.floor(GACHA_BASE_COST * Math.pow(1 + GACHA_PRICE_INCREASE_PERCENT / 100, priceMultiplier));
}

// Calculate multi-spin cost with discount
export function calculateMultiSpinCost(spinStreak: number): number {
  let totalCost = 0;
  for (let i = 0; i < MULTI_SPIN_COUNT; i++) {
    totalCost += calculateGachaCost(spinStreak + i);
  }
  return Math.floor(totalCost * MULTI_SPIN_DISCOUNT);
}

// Multi-spin result
export interface GachaMultiSpinResult {
  results: GachaSpinResult[];
  totalCoinsSpent: number;
  totalCoinsRefunded: number;
  newSkinsCount: number;
}

// Game state types (frontend only)
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  highScore: number;
  currentBiome: BiomeType;
  difficulty: Difficulty;
  selectedSkin: SkinType;
  activeBuffs: ActiveBuff[];
  playerPosition: { x: number; y: number };
  playerVelocity: number;
  playerRotation: number;
  obstacles: Obstacle[];
  buffs: BuffItem[];
  hazards: Hazard[];
  gameTime: number; // Elapsed game time in ms, pauses when game is paused
}

export interface ActiveBuff {
  type: BuffType;
  expiresAt: number;
}

export interface Obstacle {
  id: string;
  x: number;
  gapY: number;
  gapHeight: number;
  width: number;
  passed: boolean;
}

export interface BuffItem {
  id: string;
  type: BuffType;
  x: number;
  y: number;
  collected: boolean;
}

export interface Hazard {
  id: string;
  type: "spike" | "firePillar" | "laser" | "rocket";
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  velocityX?: number;
  velocityY?: number;
}

// Biome configuration
export interface BiomeConfig {
  name: string;
  backgroundGradient: [string, string];
  obstacleColor: string;
  particleType: string;
  gravity: number;
  friction: number;
  hazards: Hazard["type"][];
}

// Difficulty configuration
export interface DifficultyConfig {
  name: string;
  label: string;
  gapSize: number;
  speed: number;
  obstacleFrequency: number;
  rocketsEnabled: boolean;
  invisibleMode: boolean;
  screenShake: boolean;
  color: string;
}

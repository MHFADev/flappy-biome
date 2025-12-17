import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";
import {
  scores,
  players,
  gachaHistory,
  insertScoreSchema,
  difficulties,
  type Difficulty,
  calculateGachaCost,
  calculateMultiSpinCost,
  DUPLICATE_REFUND_PERCENT,
  MULTI_SPIN_COUNT,
  PITY_THRESHOLD,
  PITY_GUARANTEED_RARITY,
  type RarityType,
  type GachaSpinResult,
  type GachaMultiSpinResult,
} from "../shared/schema";
import {
  rollGachaSkinWithPity,
  compressInventory,
  decompressInventory,
  ALL_GACHA_SKINS,
} from "../shared/gachaSkins";

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set");
  }
  const sql = neon(databaseUrl);
  return { db: drizzle(sql), sql };
}

async function ensureTablesExist(sql: ReturnType<typeof neon>) {
  await sql`
    DO $$ BEGIN
      CREATE TYPE difficulty AS ENUM ('easy', 'normal', 'hard', 'insane', 'expert', 'masochist');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS scores (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL,
      score INTEGER NOT NULL,
      difficulty difficulty NOT NULL,
      skin_used TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      coins INTEGER NOT NULL DEFAULT 0,
      total_spins INTEGER NOT NULL DEFAULT 0,
      current_spin_streak INTEGER NOT NULL DEFAULT 0,
      inventory_data TEXT NOT NULL DEFAULT '',
      selected_skin_id TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gacha_history (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      player_id VARCHAR NOT NULL,
      skin_id TEXT NOT NULL,
      rarity TEXT NOT NULL,
      coins_cost INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_scores_difficulty ON scores(difficulty)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_players_username ON players(username)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_gacha_history_player ON gacha_history(player_id)`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { db, sql } = getDb();
  await ensureTablesExist(sql);

  const url = req.url || "";
  const path = url.split("?")[0];

  try {
    if (path === "/api/leaderboard" || path.startsWith("/api/leaderboard/")) {
      const pathParts = path.split("/");
      const difficulty = pathParts[pathParts.length - 1];

      if (!difficulty || !difficulties.includes(difficulty as Difficulty)) {
        return res.status(400).json({ error: "Invalid difficulty parameter" });
      }

      const leaderboard = await db
        .select()
        .from(scores)
        .where(eq(scores.difficulty, difficulty as Difficulty))
        .orderBy(desc(scores.score), scores.createdAt)
        .limit(20);

      return res.json(leaderboard);
    }

    if (path === "/api/scores" && req.method === "POST") {
      const parseResult = insertScoreSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid score data", details: parseResult.error.errors });
      }

      const data = parseResult.data;
      const trimmedUsername = data.username.trim();
      if (!trimmedUsername || trimmedUsername.length < 1) {
        return res.status(400).json({ error: "Username cannot be empty" });
      }

      const [score] = await db.insert(scores).values({
        ...data,
        username: trimmedUsername.substring(0, 20),
      }).returning();

      return res.status(201).json(score);
    }

    if (path.startsWith("/api/player/") && path.endsWith("/coins") && req.method === "POST") {
      const pathParts = path.split("/");
      const username = decodeURIComponent(pathParts[3]).trim();
      const { amount } = req.body;

      if (!username || typeof amount !== "number" || amount < 0) {
        return res.status(400).json({ error: "Invalid request" });
      }

      let [player] = await db.select().from(players).where(eq(players.username, username));

      if (!player) {
        [player] = await db.insert(players).values({
          username,
          coins: amount,
          totalSpins: 0,
          currentSpinStreak: 0,
          inventoryData: "",
          selectedSkinId: null,
        }).returning();
      } else {
        [player] = await db
          .update(players)
          .set({ coins: player.coins + amount, updatedAt: new Date() })
          .where(eq(players.id, player.id))
          .returning();
      }

      return res.json({ coins: player.coins });
    }

    if (path.startsWith("/api/player/") && path.endsWith("/select-skin") && req.method === "POST") {
      const pathParts = path.split("/");
      const username = decodeURIComponent(pathParts[3]).trim();
      const { skinId } = req.body;

      if (!username || !skinId) {
        return res.status(400).json({ error: "Username and skinId are required" });
      }

      let [player] = await db.select().from(players).where(eq(players.username, username));
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      const ownedSkinIds = decompressInventory(player.inventoryData);
      if (!ownedSkinIds.includes(skinId)) {
        return res.status(400).json({ error: "You don't own this skin" });
      }

      [player] = await db
        .update(players)
        .set({ selectedSkinId: skinId, updatedAt: new Date() })
        .where(eq(players.id, player.id))
        .returning();

      return res.json({ selectedSkinId: player.selectedSkinId });
    }

    if (path.startsWith("/api/player/") && path.endsWith("/reset-streak") && req.method === "POST") {
      const pathParts = path.split("/");
      const username = decodeURIComponent(pathParts[3]).trim();

      let [player] = await db.select().from(players).where(eq(players.username, username));
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      [player] = await db
        .update(players)
        .set({ currentSpinStreak: 0, updatedAt: new Date() })
        .where(eq(players.id, player.id))
        .returning();

      return res.json({
        currentSpinStreak: 0,
        nextSpinCost: calculateGachaCost(0),
      });
    }

    if (path.startsWith("/api/player/") && req.method === "GET") {
      const pathParts = path.split("/");
      const username = decodeURIComponent(pathParts[pathParts.length - 1]).trim();

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      let [player] = await db.select().from(players).where(eq(players.username, username));

      if (!player) {
        [player] = await db.insert(players).values({
          username,
          coins: 500,
          totalSpins: 0,
          currentSpinStreak: 0,
          inventoryData: "",
          selectedSkinId: null,
        }).returning();
      }

      const ownedSkinIds = decompressInventory(player.inventoryData);
      const spinsUntilPity = PITY_THRESHOLD - (player.totalSpins % PITY_THRESHOLD);

      return res.json({
        ...player,
        ownedSkinIds,
        nextSpinCost: calculateGachaCost(player.currentSpinStreak),
        nextMultiSpinCost: calculateMultiSpinCost(player.currentSpinStreak),
        spinsUntilPity,
        pityThreshold: PITY_THRESHOLD,
      });
    }

    if (path === "/api/gacha/spin" && req.method === "POST") {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      let [player] = await db.select().from(players).where(eq(players.username, username));
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      const cost = calculateGachaCost(player.currentSpinStreak);

      if (player.coins < cost) {
        return res.status(400).json({
          error: "Not enough coins",
          required: cost,
          current: player.coins,
        });
      }

      [player] = await db
        .update(players)
        .set({ coins: player.coins - cost, updatedAt: new Date() })
        .where(eq(players.id, player.id))
        .returning();

      const spinNumber = player.totalSpins + 1;
      const isPity = spinNumber % PITY_THRESHOLD === 0;
      const skin = rollGachaSkinWithPity(isPity, PITY_GUARANTEED_RARITY as RarityType);

      const ownedSkinIds = decompressInventory(player.inventoryData);
      const isNew = !ownedSkinIds.includes(skin.id);
      const isDuplicate = !isNew;

      let coinsRefund = 0;
      if (isDuplicate) {
        coinsRefund = Math.floor(cost * (DUPLICATE_REFUND_PERCENT / 100));
        [player] = await db
          .update(players)
          .set({ coins: player.coins + coinsRefund, updatedAt: new Date() })
          .where(eq(players.id, player.id))
          .returning();
      } else {
        ownedSkinIds.push(skin.id);
      }

      const newInventoryData = compressInventory(ownedSkinIds);

      [player] = await db
        .update(players)
        .set({
          totalSpins: player.totalSpins + 1,
          currentSpinStreak: player.currentSpinStreak + 1,
          inventoryData: newInventoryData,
          updatedAt: new Date(),
        })
        .where(eq(players.id, player.id))
        .returning();

      await db.insert(gachaHistory).values({
        playerId: player.id,
        skinId: skin.id,
        rarity: skin.rarity,
        coinsCost: cost,
      });

      const result: GachaSpinResult = {
        skin,
        isNew,
        isDuplicate,
        coinsRefund,
      };

      const spinsUntilPity = PITY_THRESHOLD - (player.totalSpins % PITY_THRESHOLD);

      return res.json({
        result,
        isPity,
        player: {
          ...player,
          ownedSkinIds: decompressInventory(player.inventoryData),
          nextSpinCost: calculateGachaCost(player.currentSpinStreak),
          nextMultiSpinCost: calculateMultiSpinCost(player.currentSpinStreak),
          spinsUntilPity,
          pityThreshold: PITY_THRESHOLD,
        },
      });
    }

    if (path === "/api/gacha/multi-spin" && req.method === "POST") {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      let [player] = await db.select().from(players).where(eq(players.username, username));
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      const totalCost = calculateMultiSpinCost(player.currentSpinStreak);

      if (player.coins < totalCost) {
        return res.status(400).json({
          error: "Not enough coins for multi-spin",
          required: totalCost,
          current: player.coins,
        });
      }

      [player] = await db
        .update(players)
        .set({ coins: player.coins - totalCost, updatedAt: new Date() })
        .where(eq(players.id, player.id))
        .returning();

      let ownedSkinIds = decompressInventory(player.inventoryData);

      const results: GachaSpinResult[] = [];
      let totalCoinsRefunded = 0;
      let newSkinsCount = 0;

      for (let i = 0; i < MULTI_SPIN_COUNT; i++) {
        const spinNumber = player.totalSpins + i + 1;
        const isPity = spinNumber % PITY_THRESHOLD === 0;
        const skin = rollGachaSkinWithPity(isPity, PITY_GUARANTEED_RARITY as RarityType);

        const isNew = !ownedSkinIds.includes(skin.id);
        const isDuplicate = !isNew;

        let coinsRefund = 0;
        if (isDuplicate) {
          const singleSpinCost = calculateGachaCost(player.currentSpinStreak + i);
          coinsRefund = Math.floor(singleSpinCost * (DUPLICATE_REFUND_PERCENT / 100));
          totalCoinsRefunded += coinsRefund;
        } else {
          ownedSkinIds.push(skin.id);
          newSkinsCount++;
        }

        results.push({
          skin,
          isNew,
          isDuplicate,
          coinsRefund,
        });

        await db.insert(gachaHistory).values({
          playerId: player.id,
          skinId: skin.id,
          rarity: skin.rarity,
          coinsCost: Math.floor(totalCost / MULTI_SPIN_COUNT),
        });
      }

      if (totalCoinsRefunded > 0) {
        [player] = await db
          .update(players)
          .set({ coins: player.coins + totalCoinsRefunded, updatedAt: new Date() })
          .where(eq(players.id, player.id))
          .returning();
      }

      const newInventoryData = compressInventory(ownedSkinIds);

      [player] = await db
        .update(players)
        .set({
          totalSpins: player.totalSpins + MULTI_SPIN_COUNT,
          currentSpinStreak: player.currentSpinStreak + MULTI_SPIN_COUNT,
          inventoryData: newInventoryData,
          updatedAt: new Date(),
        })
        .where(eq(players.id, player.id))
        .returning();

      const multiResult: GachaMultiSpinResult = {
        results,
        totalCoinsSpent: totalCost,
        totalCoinsRefunded,
        newSkinsCount,
      };

      return res.json({
        result: multiResult,
        player: {
          ...player,
          ownedSkinIds: decompressInventory(player.inventoryData),
          nextSpinCost: calculateGachaCost(player.currentSpinStreak),
          nextMultiSpinCost: calculateMultiSpinCost(player.currentSpinStreak),
        },
      });
    }

    if (path === "/api/skins" && req.method === "GET") {
      return res.json(ALL_GACHA_SKINS);
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

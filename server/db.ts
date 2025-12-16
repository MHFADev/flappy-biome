import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.RAILWAY_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or RAILWAY_DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

export async function initializeDatabase(): Promise<void> {
  console.log("Initializing database...");

  try {
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE difficulty AS ENUM ('easy', 'normal', 'hard', 'insane', 'expert', 'masochist');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("Difficulty enum created or already exists.");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    console.log("Users table created or already exists.");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS scores (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL,
        score INTEGER NOT NULL,
        difficulty difficulty NOT NULL,
        skin_used TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Scores table created or already exists.");

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_scores_difficulty ON scores(difficulty);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
    console.log("Indexes created or already exist.");

    // Create players table for gacha system
    await db.execute(sql`
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
      );
    `);
    console.log("Players table created or already exists.");

    // Create gacha history table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gacha_history (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id VARCHAR NOT NULL,
        skin_id TEXT NOT NULL,
        rarity TEXT NOT NULL,
        coins_cost INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Gacha history table created or already exists.");

    // Create indexes for gacha tables
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_gacha_history_player ON gacha_history(player_id);
    `);
    console.log("Gacha indexes created or already exist.");

    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

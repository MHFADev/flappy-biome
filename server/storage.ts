import { 
  type User, type InsertUser, type Score, type InsertScore, type Difficulty,
  type Player, type InsertPlayer, type GachaHistoryRecord, type InsertGachaHistory,
  scores, users, players, gachaHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Leaderboard operations
  getLeaderboard(difficulty: Difficulty, limit?: number): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
  
  // Player/Gacha operations
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByUsername(username: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, data: Partial<InsertPlayer>): Promise<Player | undefined>;
  addCoins(playerId: string, amount: number): Promise<Player | undefined>;
  deductCoins(playerId: string, amount: number): Promise<Player | undefined>;
  
  // Gacha history
  createGachaHistory(record: InsertGachaHistory): Promise<GachaHistoryRecord>;
  getPlayerGachaHistory(playerId: string, limit?: number): Promise<GachaHistoryRecord[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Leaderboard operations
  async getLeaderboard(difficulty: Difficulty, limit: number = 20): Promise<Score[]> {
    return await db
      .select()
      .from(scores)
      .where(eq(scores.difficulty, difficulty))
      .orderBy(desc(scores.score), scores.createdAt)
      .limit(limit);
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const [score] = await db.insert(scores).values(insertScore).returning();
    return score;
  }

  // Player/Gacha operations
  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }

  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.username, username));
    return player;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  async updatePlayer(id: string, data: Partial<InsertPlayer>): Promise<Player | undefined> {
    const [player] = await db
      .update(players)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(players.id, id))
      .returning();
    return player;
  }

  async addCoins(playerId: string, amount: number): Promise<Player | undefined> {
    const player = await this.getPlayer(playerId);
    if (!player) return undefined;
    
    const [updated] = await db
      .update(players)
      .set({ coins: player.coins + amount, updatedAt: new Date() })
      .where(eq(players.id, playerId))
      .returning();
    return updated;
  }

  async deductCoins(playerId: string, amount: number): Promise<Player | undefined> {
    const player = await this.getPlayer(playerId);
    if (!player || player.coins < amount) return undefined;
    
    const [updated] = await db
      .update(players)
      .set({ coins: player.coins - amount, updatedAt: new Date() })
      .where(eq(players.id, playerId))
      .returning();
    return updated;
  }

  // Gacha history
  async createGachaHistory(record: InsertGachaHistory): Promise<GachaHistoryRecord> {
    const [history] = await db.insert(gachaHistory).values(record).returning();
    return history;
  }

  async getPlayerGachaHistory(playerId: string, limit: number = 50): Promise<GachaHistoryRecord[]> {
    return await db
      .select()
      .from(gachaHistory)
      .where(eq(gachaHistory.playerId, playerId))
      .orderBy(desc(gachaHistory.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();

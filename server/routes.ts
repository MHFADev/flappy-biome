import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertScoreSchema, difficulties, type Difficulty,
  calculateGachaCost, calculateMultiSpinCost, DUPLICATE_REFUND_PERCENT,
  type GachaSpinResult, type GachaMultiSpinResult,
  MULTI_SPIN_COUNT, PITY_THRESHOLD, PITY_GUARANTEED_RARITY, type RarityType
} from "@shared/schema";
import { 
  rollGachaSkin, rollGachaSkinWithPity, compressInventory, decompressInventory, 
  getSkinById, ALL_GACHA_SKINS 
} from "@shared/gachaSkins";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Leaderboard routes
  app.get("/api/leaderboard/:difficulty", async (req, res) => {
    try {
      const difficulty = req.params.difficulty as string;
      
      if (!difficulty || !difficulties.includes(difficulty as Difficulty)) {
        return res.status(400).json({ error: "Invalid difficulty parameter" });
      }
      
      const leaderboard = await storage.getLeaderboard(difficulty as Difficulty);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/scores", async (req, res) => {
    try {
      const parseResult = insertScoreSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid score data", details: parseResult.error.errors });
      }
      
      const data = parseResult.data;
      const trimmedUsername = data.username.trim();
      if (!trimmedUsername || trimmedUsername.length < 1) {
        return res.status(400).json({ error: "Username cannot be empty" });
      }
      
      const score = await storage.createScore({
        ...data,
        username: trimmedUsername.substring(0, 20),
      });
      res.status(201).json(score);
    } catch (error) {
      console.error("Error saving score:", error);
      res.status(500).json({ error: "Failed to save score" });
    }
  });

  // Player/Gacha routes
  
  // Get or create player by username
  app.get("/api/player/:username", async (req, res) => {
    try {
      const username = req.params.username.trim();
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      
      let player = await storage.getPlayerByUsername(username);
      
      if (!player) {
        // Create new player with starting coins
        player = await storage.createPlayer({
          username,
          coins: 500, // Starting bonus
          totalSpins: 0,
          currentSpinStreak: 0,
          inventoryData: "",
          selectedSkinId: null,
        });
      }
      
      // Decompress inventory for response
      const ownedSkinIds = decompressInventory(player.inventoryData);
      
      // Calculate pity progress
      const spinsUntilPity = PITY_THRESHOLD - (player.totalSpins % PITY_THRESHOLD);
      
      res.json({
        ...player,
        ownedSkinIds,
        nextSpinCost: calculateGachaCost(player.currentSpinStreak),
        nextMultiSpinCost: calculateMultiSpinCost(player.currentSpinStreak),
        spinsUntilPity,
        pityThreshold: PITY_THRESHOLD,
      });
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ error: "Failed to fetch player" });
    }
  });

  // Add coins (from gameplay)
  app.post("/api/player/:username/coins", async (req, res) => {
    try {
      const username = req.params.username.trim();
      const { amount } = req.body;
      
      if (!username || typeof amount !== "number" || amount < 0) {
        return res.status(400).json({ error: "Invalid request" });
      }
      
      let player = await storage.getPlayerByUsername(username);
      if (!player) {
        player = await storage.createPlayer({
          username,
          coins: amount,
          totalSpins: 0,
          currentSpinStreak: 0,
          inventoryData: "",
          selectedSkinId: null,
        });
      } else {
        player = await storage.addCoins(player.id, amount);
      }
      
      if (!player) {
        return res.status(500).json({ error: "Failed to add coins" });
      }
      
      res.json({ coins: player.coins });
    } catch (error) {
      console.error("Error adding coins:", error);
      res.status(500).json({ error: "Failed to add coins" });
    }
  });

  // Gacha spin
  app.post("/api/gacha/spin", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      
      let player = await storage.getPlayerByUsername(username);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Calculate cost
      const cost = calculateGachaCost(player.currentSpinStreak);
      
      if (player.coins < cost) {
        return res.status(400).json({ 
          error: "Not enough coins", 
          required: cost, 
          current: player.coins 
        });
      }
      
      // Deduct coins
      await storage.deductCoins(player.id, cost);
      
      // Check if this is a pity spin
      const spinNumber = player.totalSpins + 1;
      const isPity = spinNumber % PITY_THRESHOLD === 0;
      
      // Roll for skin with pity system
      const skin = rollGachaSkinWithPity(isPity, PITY_GUARANTEED_RARITY as RarityType);
      
      // Check if already owned
      const ownedSkinIds = decompressInventory(player.inventoryData);
      const isNew = !ownedSkinIds.includes(skin.id);
      const isDuplicate = !isNew;
      
      let coinsRefund = 0;
      if (isDuplicate) {
        // Refund some coins for duplicates
        coinsRefund = Math.floor(cost * (DUPLICATE_REFUND_PERCENT / 100));
        await storage.addCoins(player.id, coinsRefund);
      } else {
        // Add skin to inventory
        ownedSkinIds.push(skin.id);
      }
      
      // Compress and save inventory
      const newInventoryData = compressInventory(ownedSkinIds);
      
      // Refetch player to get updated coin balance after deductCoins/addCoins
      player = await storage.getPlayer(player.id);
      if (!player) {
        return res.status(500).json({ error: "Player not found after coin update" });
      }
      
      // Update player stats (without overwriting coins)
      player = await storage.updatePlayer(player.id, {
        username: player.username,
        coins: player.coins, // Use current balance after deduction/refund
        totalSpins: player.totalSpins + 1,
        currentSpinStreak: player.currentSpinStreak + 1,
        inventoryData: newInventoryData,
        selectedSkinId: player.selectedSkinId,
      });
      
      // Record gacha history
      await storage.createGachaHistory({
        playerId: player!.id,
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
      
      // Refresh player data
      player = await storage.getPlayer(player!.id);
      
      // Calculate pity progress
      const spinsUntilPity = PITY_THRESHOLD - (player!.totalSpins % PITY_THRESHOLD);
      
      res.json({
        result,
        isPity,
        player: {
          ...player,
          ownedSkinIds: decompressInventory(player!.inventoryData),
          nextSpinCost: calculateGachaCost(player!.currentSpinStreak),
          nextMultiSpinCost: calculateMultiSpinCost(player!.currentSpinStreak),
          spinsUntilPity,
          pityThreshold: PITY_THRESHOLD,
        },
      });
    } catch (error) {
      console.error("Error during gacha spin:", error);
      res.status(500).json({ error: "Failed to perform gacha spin" });
    }
  });

  // Multi-spin gacha with pity system
  app.post("/api/gacha/multi-spin", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      
      let player = await storage.getPlayerByUsername(username);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Calculate total cost for multi-spin
      const totalCost = calculateMultiSpinCost(player.currentSpinStreak);
      
      if (player.coins < totalCost) {
        return res.status(400).json({ 
          error: "Not enough coins for multi-spin", 
          required: totalCost, 
          current: player.coins 
        });
      }
      
      // Deduct coins
      await storage.deductCoins(player.id, totalCost);
      
      // Get owned skins
      let ownedSkinIds = decompressInventory(player.inventoryData);
      
      const results: GachaSpinResult[] = [];
      let totalCoinsRefunded = 0;
      let newSkinsCount = 0;
      
      for (let i = 0; i < MULTI_SPIN_COUNT; i++) {
        const spinNumber = player.totalSpins + i + 1;
        const isPity = spinNumber % PITY_THRESHOLD === 0;
        
        // Roll with pity system
        const skin = rollGachaSkinWithPity(isPity, PITY_GUARANTEED_RARITY as RarityType);
        
        // Check if already owned
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
        
        // Record gacha history
        await storage.createGachaHistory({
          playerId: player.id,
          skinId: skin.id,
          rarity: skin.rarity,
          coinsCost: Math.floor(totalCost / MULTI_SPIN_COUNT),
        });
      }
      
      // Refund duplicate coins
      if (totalCoinsRefunded > 0) {
        await storage.addCoins(player.id, totalCoinsRefunded);
      }
      
      // Compress and save inventory
      const newInventoryData = compressInventory(ownedSkinIds);
      
      // Refetch player to get updated coin balance after deductCoins/addCoins
      player = await storage.getPlayer(player.id);
      if (!player) {
        return res.status(500).json({ error: "Player not found after coin update" });
      }
      
      // Update player stats (with current balance after deduction/refund)
      player = await storage.updatePlayer(player.id, {
        username: player.username,
        coins: player.coins, // Use current balance after deduction/refund
        totalSpins: player.totalSpins + MULTI_SPIN_COUNT,
        currentSpinStreak: player.currentSpinStreak + MULTI_SPIN_COUNT,
        inventoryData: newInventoryData,
        selectedSkinId: player.selectedSkinId,
      });
      
      // Refresh player data
      player = await storage.getPlayer(player!.id);
      
      const multiResult: GachaMultiSpinResult = {
        results,
        totalCoinsSpent: totalCost,
        totalCoinsRefunded,
        newSkinsCount,
      };
      
      res.json({
        result: multiResult,
        player: {
          ...player,
          ownedSkinIds: decompressInventory(player!.inventoryData),
          nextSpinCost: calculateGachaCost(player!.currentSpinStreak),
          nextMultiSpinCost: calculateMultiSpinCost(player!.currentSpinStreak),
        },
      });
    } catch (error) {
      console.error("Error during multi-spin:", error);
      res.status(500).json({ error: "Failed to perform multi-spin" });
    }
  });

  // Get all available skins
  app.get("/api/skins", async (req, res) => {
    try {
      res.json(ALL_GACHA_SKINS);
    } catch (error) {
      console.error("Error fetching skins:", error);
      res.status(500).json({ error: "Failed to fetch skins" });
    }
  });

  // Select skin for gameplay
  app.post("/api/player/:username/select-skin", async (req, res) => {
    try {
      const username = req.params.username.trim();
      const { skinId } = req.body;
      
      if (!username || !skinId) {
        return res.status(400).json({ error: "Username and skinId are required" });
      }
      
      let player = await storage.getPlayerByUsername(username);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Check if player owns the skin
      const ownedSkinIds = decompressInventory(player.inventoryData);
      if (!ownedSkinIds.includes(skinId)) {
        return res.status(400).json({ error: "You don't own this skin" });
      }
      
      player = await storage.updatePlayer(player.id, {
        username: player.username,
        coins: player.coins,
        totalSpins: player.totalSpins,
        currentSpinStreak: player.currentSpinStreak,
        inventoryData: player.inventoryData,
        selectedSkinId: skinId,
      });
      
      res.json({ selectedSkinId: player!.selectedSkinId });
    } catch (error) {
      console.error("Error selecting skin:", error);
      res.status(500).json({ error: "Failed to select skin" });
    }
  });

  // Reset spin streak (for testing or daily reset)
  app.post("/api/player/:username/reset-streak", async (req, res) => {
    try {
      const username = req.params.username.trim();
      
      let player = await storage.getPlayerByUsername(username);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      player = await storage.updatePlayer(player.id, {
        username: player.username,
        coins: player.coins,
        totalSpins: player.totalSpins,
        currentSpinStreak: 0,
        inventoryData: player.inventoryData,
        selectedSkinId: player.selectedSkinId,
      });
      
      res.json({ 
        currentSpinStreak: 0,
        nextSpinCost: calculateGachaCost(0),
      });
    } catch (error) {
      console.error("Error resetting streak:", error);
      res.status(500).json({ error: "Failed to reset streak" });
    }
  });

  return httpServer;
}

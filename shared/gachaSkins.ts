import { type GachaSkin, type RarityType, type SkinCategory, rarityConfig } from "./schema";

// Animation types for skins
const animations = ["float", "pulse", "spin", "glitch", "sparkle", "wave", "bounce", "shake"] as const;

// Generate 85 unique skins across all rarities and categories
export const ALL_GACHA_SKINS: GachaSkin[] = [
  // STONE (30%) - 25 skins
  { id: "s001", name: "Rocky", rarity: "stone", category: "animal", baseHue: 40, pattern: 1, animation: "bounce", special: false },
  { id: "s002", name: "Pebble", rarity: "stone", category: "animal", baseHue: 35, pattern: 2, animation: "float", special: false },
  { id: "s003", name: "Granite", rarity: "stone", category: "robot", baseHue: 50, pattern: 1, animation: "pulse", special: false },
  { id: "s004", name: "Boulder", rarity: "stone", category: "elemental", baseHue: 30, pattern: 3, animation: "shake", special: false },
  { id: "s005", name: "Cobble", rarity: "stone", category: "pixel", baseHue: 45, pattern: 2, animation: "bounce", special: false },
  { id: "s006", name: "Sandstone", rarity: "stone", category: "elemental", baseHue: 38, pattern: 1, animation: "float", special: false },
  { id: "s007", name: "Slate", rarity: "stone", category: "stealth", baseHue: 220, pattern: 2, animation: "pulse", special: false },
  { id: "s008", name: "Flint", rarity: "stone", category: "animal", baseHue: 25, pattern: 3, animation: "shake", special: false },
  { id: "s009", name: "Marble", rarity: "stone", category: "royal", baseHue: 0, pattern: 1, animation: "spin", special: false },
  { id: "s010", name: "Gravel", rarity: "stone", category: "pixel", baseHue: 42, pattern: 2, animation: "bounce", special: false },
  { id: "s011", name: "Basalt", rarity: "stone", category: "elemental", baseHue: 210, pattern: 3, animation: "float", special: false },
  { id: "s012", name: "Limestone", rarity: "stone", category: "animal", baseHue: 55, pattern: 1, animation: "wave", special: false },
  { id: "s013", name: "Quartzite", rarity: "stone", category: "cosmic", baseHue: 280, pattern: 2, animation: "sparkle", special: false },
  { id: "s014", name: "Shale", rarity: "stone", category: "stealth", baseHue: 200, pattern: 3, animation: "pulse", special: false },
  { id: "s015", name: "Pumice", rarity: "stone", category: "robot", baseHue: 60, pattern: 1, animation: "float", special: false },

  // COAL (25%) - 20 skins
  { id: "c001", name: "Charcoal", rarity: "coal", category: "elemental", baseHue: 0, pattern: 1, animation: "pulse", special: false },
  { id: "c002", name: "Ember", rarity: "coal", category: "elemental", baseHue: 15, pattern: 2, animation: "sparkle", special: false },
  { id: "c003", name: "Smokey", rarity: "coal", category: "animal", baseHue: 0, pattern: 3, animation: "float", special: false },
  { id: "c004", name: "Cinder", rarity: "coal", category: "robot", baseHue: 10, pattern: 1, animation: "shake", special: false },
  { id: "c005", name: "Ash", rarity: "coal", category: "stealth", baseHue: 0, pattern: 2, animation: "wave", special: false },
  { id: "c006", name: "Soot", rarity: "coal", category: "pixel", baseHue: 5, pattern: 3, animation: "bounce", special: false },
  { id: "c007", name: "Carbon", rarity: "coal", category: "cosmic", baseHue: 240, pattern: 1, animation: "spin", special: false },
  { id: "c008", name: "Bitumen", rarity: "coal", category: "elemental", baseHue: 270, pattern: 2, animation: "pulse", special: false },
  { id: "c009", name: "Anthracite", rarity: "coal", category: "royal", baseHue: 280, pattern: 3, animation: "glitch", special: false },
  { id: "c010", name: "Jet", rarity: "coal", category: "mythical", baseHue: 260, pattern: 1, animation: "sparkle", special: false },
  { id: "c011", name: "Graphite", rarity: "coal", category: "robot", baseHue: 0, pattern: 2, animation: "float", special: false },
  { id: "c012", name: "Obsidyx", rarity: "coal", category: "stealth", baseHue: 290, pattern: 3, animation: "shake", special: false },
  { id: "c013", name: "Tar", rarity: "coal", category: "pixel", baseHue: 300, pattern: 1, animation: "wave", special: false },
  { id: "c014", name: "Nightfall", rarity: "coal", category: "cosmic", baseHue: 250, pattern: 2, animation: "pulse", special: false },

  // IRON (18%) - 15 skins
  { id: "i001", name: "Ironclad", rarity: "iron", category: "robot", baseHue: 210, pattern: 1, animation: "shake", special: false },
  { id: "i002", name: "Steeler", rarity: "iron", category: "robot", baseHue: 220, pattern: 2, animation: "pulse", special: false },
  { id: "i003", name: "Rustbucket", rarity: "iron", category: "pixel", baseHue: 25, pattern: 3, animation: "bounce", special: false },
  { id: "i004", name: "Alloy", rarity: "iron", category: "neon", baseHue: 200, pattern: 1, animation: "sparkle", special: false },
  { id: "i005", name: "Tinman", rarity: "iron", category: "mythical", baseHue: 190, pattern: 2, animation: "wave", special: false },
  { id: "i006", name: "Ferrous", rarity: "iron", category: "elemental", baseHue: 205, pattern: 3, animation: "float", special: false },
  { id: "i007", name: "Magnetite", rarity: "iron", category: "cosmic", baseHue: 230, pattern: 1, animation: "spin", special: false },
  { id: "i008", name: "Wrought", rarity: "iron", category: "stealth", baseHue: 215, pattern: 2, animation: "shake", special: false },
  { id: "i009", name: "Forge", rarity: "iron", category: "elemental", baseHue: 20, pattern: 3, animation: "pulse", special: false },
  { id: "i010", name: "Anvil", rarity: "iron", category: "royal", baseHue: 225, pattern: 1, animation: "bounce", special: false },
  { id: "i011", name: "Galvanize", rarity: "iron", category: "neon", baseHue: 180, pattern: 2, animation: "glitch", special: false },
  { id: "i012", name: "Smelt", rarity: "iron", category: "pixel", baseHue: 30, pattern: 3, animation: "wave", special: false },

  // SILVER (12%) - 10 skins
  { id: "sv001", name: "Sterling", rarity: "silver", category: "royal", baseHue: 210, pattern: 1, animation: "sparkle", special: false },
  { id: "sv002", name: "Moonbeam", rarity: "silver", category: "cosmic", baseHue: 240, pattern: 2, animation: "float", special: false },
  { id: "sv003", name: "Quicksilver", rarity: "silver", category: "mythical", baseHue: 200, pattern: 3, animation: "wave", special: false },
  { id: "sv004", name: "Argent", rarity: "silver", category: "robot", baseHue: 215, pattern: 1, animation: "pulse", special: false },
  { id: "sv005", name: "Mirror", rarity: "silver", category: "neon", baseHue: 190, pattern: 2, animation: "glitch", special: false },
  { id: "sv006", name: "Platinum Jr", rarity: "silver", category: "royal", baseHue: 220, pattern: 3, animation: "spin", special: false },
  { id: "sv007", name: "Chrome", rarity: "silver", category: "robot", baseHue: 205, pattern: 1, animation: "shake", special: false },
  { id: "sv008", name: "Frost", rarity: "silver", category: "elemental", baseHue: 195, pattern: 2, animation: "sparkle", special: true },

  // GOLD (7%) - 8 skins
  { id: "g001", name: "Aurum", rarity: "gold", category: "royal", baseHue: 45, pattern: 1, animation: "sparkle", special: false },
  { id: "g002", name: "Sunburst", rarity: "gold", category: "cosmic", baseHue: 50, pattern: 2, animation: "pulse", special: false },
  { id: "g003", name: "Gilded", rarity: "gold", category: "mythical", baseHue: 42, pattern: 3, animation: "wave", special: false },
  { id: "g004", name: "Treasure", rarity: "gold", category: "animal", baseHue: 48, pattern: 1, animation: "bounce", special: false },
  { id: "g005", name: "Pharaoh", rarity: "gold", category: "royal", baseHue: 40, pattern: 2, animation: "float", special: true },
  { id: "g006", name: "Midas", rarity: "gold", category: "mythical", baseHue: 52, pattern: 3, animation: "spin", special: false },
  { id: "g007", name: "Coronet", rarity: "gold", category: "neon", baseHue: 55, pattern: 1, animation: "glitch", special: false },

  // PLATINUM (4%) - 6 skins
  { id: "p001", name: "Celestial", rarity: "platinum", category: "cosmic", baseHue: 260, pattern: 1, animation: "sparkle", special: false },
  { id: "p002", name: "Palladium", rarity: "platinum", category: "robot", baseHue: 250, pattern: 2, animation: "pulse", special: false },
  { id: "p003", name: "Lumina", rarity: "platinum", category: "neon", baseHue: 270, pattern: 3, animation: "wave", special: true },
  { id: "p004", name: "Starforged", rarity: "platinum", category: "cosmic", baseHue: 280, pattern: 1, animation: "spin", special: false },
  { id: "p005", name: "Ethereal", rarity: "platinum", category: "mythical", baseHue: 290, pattern: 2, animation: "float", special: false },

  // DIAMOND (2.5%) - 4 skins
  { id: "d001", name: "Prismatic", rarity: "diamond", category: "cosmic", baseHue: 180, pattern: 1, animation: "sparkle", special: true },
  { id: "d002", name: "Crystal", rarity: "diamond", category: "elemental", baseHue: 190, pattern: 2, animation: "pulse", special: false },
  { id: "d003", name: "Brilliance", rarity: "diamond", category: "neon", baseHue: 200, pattern: 3, animation: "glitch", special: false },
  { id: "d004", name: "Radiant", rarity: "diamond", category: "royal", baseHue: 170, pattern: 1, animation: "wave", special: true },

  // OBSIDIAN (1%) - 3 skins
  { id: "o001", name: "Void Walker", rarity: "obsidian", category: "cosmic", baseHue: 280, pattern: 1, animation: "glitch", special: true },
  { id: "o002", name: "Nightbane", rarity: "obsidian", category: "mythical", baseHue: 290, pattern: 2, animation: "shake", special: true },
  { id: "o003", name: "Eclipse", rarity: "obsidian", category: "cosmic", baseHue: 300, pattern: 3, animation: "spin", special: true },

  // EMERALD (0.5%) - 2 skins (rarest!)
  { id: "e001", name: "Nature's Crown", rarity: "emerald", category: "mythical", baseHue: 140, pattern: 1, animation: "sparkle", special: true },
  { id: "e002", name: "Genesis", rarity: "emerald", category: "cosmic", baseHue: 130, pattern: 2, animation: "pulse", special: true },
];

// Get skin by ID
export function getSkinById(id: string): GachaSkin | undefined {
  return ALL_GACHA_SKINS.find(skin => skin.id === id);
}

// Get skins by rarity
export function getSkinsByRarity(rarity: RarityType): GachaSkin[] {
  return ALL_GACHA_SKINS.filter(skin => skin.rarity === rarity);
}

// Get skins by category
export function getSkinsByCategory(category: SkinCategory): GachaSkin[] {
  return ALL_GACHA_SKINS.filter(skin => skin.category === category);
}

// Roll a random skin based on drop rates
export function rollGachaSkin(): GachaSkin {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  for (const rarity of Object.keys(rarityConfig) as RarityType[]) {
    cumulative += rarityConfig[rarity].dropRate;
    if (roll < cumulative) {
      const skinsOfRarity = getSkinsByRarity(rarity);
      const randomIndex = Math.floor(Math.random() * skinsOfRarity.length);
      return skinsOfRarity[randomIndex];
    }
  }
  
  // Fallback to stone (shouldn't happen)
  const stoneSkns = getSkinsByRarity("stone");
  return stoneSkns[Math.floor(Math.random() * stoneSkns.length)];
}

// Rarities ordered from lowest to highest
const rarityOrder: RarityType[] = ["stone", "coal", "iron", "silver", "gold", "platinum", "diamond", "obsidian", "emerald"];

// Roll with pity system - guarantees minimum rarity
export function rollGachaSkinWithPity(isPity: boolean, minRarity: RarityType = "gold"): GachaSkin {
  if (!isPity) {
    return rollGachaSkin();
  }
  
  // Get the minimum rarity index
  const minRarityIndex = rarityOrder.indexOf(minRarity);
  
  // Roll for rarity among guaranteed rarities only
  const guaranteedRarities = rarityOrder.slice(minRarityIndex);
  const totalRate = guaranteedRarities.reduce((sum, r) => sum + rarityConfig[r].dropRate, 0);
  
  const roll = Math.random() * totalRate;
  let cumulative = 0;
  
  for (const rarity of guaranteedRarities) {
    cumulative += rarityConfig[rarity].dropRate;
    if (roll < cumulative) {
      const skinsOfRarity = getSkinsByRarity(rarity);
      const randomIndex = Math.floor(Math.random() * skinsOfRarity.length);
      return skinsOfRarity[randomIndex];
    }
  }
  
  // Fallback to minimum rarity
  const minRaritySkns = getSkinsByRarity(minRarity);
  return minRaritySkns[Math.floor(Math.random() * minRaritySkns.length)];
}

// Check if a rarity is at or above minimum
export function isRarityAtLeast(rarity: RarityType, minRarity: RarityType): boolean {
  return rarityOrder.indexOf(rarity) >= rarityOrder.indexOf(minRarity);
}

// Get rarity rank (for display purposes)
export function getRarityRank(rarity: RarityType): number {
  return rarityOrder.indexOf(rarity);
}

// Inventory compression utilities (bitfield encoded as base64)
// Each skin is represented by 1 bit in a bitfield
// With 85 skins, we need ceil(85/8) = 11 bytes
// Base64 encoding adds ~33% overhead = ~15 bytes for inventory
// Well under 912 bytes limit

export function compressInventory(ownedSkinIds: string[]): string {
  const skinIdToIndex = new Map<string, number>();
  ALL_GACHA_SKINS.forEach((skin, index) => {
    skinIdToIndex.set(skin.id, index);
  });
  
  const numBytes = Math.ceil(ALL_GACHA_SKINS.length / 8);
  const bytes = new Uint8Array(numBytes);
  
  for (const skinId of ownedSkinIds) {
    const index = skinIdToIndex.get(skinId);
    if (index !== undefined) {
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      bytes[byteIndex] |= (1 << bitIndex);
    }
  }
  
  // Convert to base64
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decompressInventory(compressed: string): string[] {
  if (!compressed) return [];
  
  try {
    const binary = atob(compressed);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const ownedSkinIds: string[] = [];
    
    ALL_GACHA_SKINS.forEach((skin, index) => {
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      if (byteIndex < bytes.length && (bytes[byteIndex] & (1 << bitIndex)) !== 0) {
        ownedSkinIds.push(skin.id);
      }
    });
    
    return ownedSkinIds;
  } catch {
    return [];
  }
}

// Calculate inventory data size
export function getInventoryDataSize(inventoryData: string): number {
  return new Blob([inventoryData]).size;
}

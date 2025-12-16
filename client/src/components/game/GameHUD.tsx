import { Badge } from "@/components/ui/badge";
import { BuffIcon } from "./BuffIcons";
import type { GameState } from "@shared/schema";
import { biomeConfigs } from "@/lib/gameConfig";
import { Leaf, Snowflake, Flame, Zap } from "lucide-react";

interface GameHUDProps {
  gameState: GameState;
}

const biomeIcons: Record<string, typeof Leaf> = {
  forest: Leaf,
  ice: Snowflake,
  magma: Flame,
  void: Zap,
};

export function GameHUD({ gameState }: GameHUDProps) {
  const biomeConfig = biomeConfigs[gameState.currentBiome];
  const BiomeIcon = biomeIcons[gameState.currentBiome];

  return (
    <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 backdrop-blur-md bg-black/20 z-10">
      {/* Score */}
      <div className="flex flex-col items-start">
        <span className="text-xs uppercase tracking-wider text-white/70 font-medium">Score</span>
        <span 
          className="text-4xl md:text-5xl font-bold text-white font-mono tabular-nums"
          data-testid="text-score"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
        >
          {gameState.score}
        </span>
      </div>

      {/* Biome indicator */}
      <div className="flex flex-col items-center">
        <Badge 
          variant="secondary" 
          className="gap-2 px-3 py-1.5 text-sm font-semibold"
          style={{ 
            backgroundColor: biomeConfig.backgroundGradient[0],
            color: "#fff",
            border: `1px solid ${biomeConfig.backgroundGradient[1]}`
          }}
        >
          <BiomeIcon className="w-4 h-4" />
          <span>{biomeConfig.name}</span>
        </Badge>
      </div>

      {/* Active buffs */}
      <div className="flex items-center gap-2">
        {gameState.activeBuffs.map((buff, index) => {
          const timeLeft = Math.max(0, buff.expiresAt - Date.now());
          const seconds = Math.ceil(timeLeft / 1000);
          
          return (
            <div 
              key={`${buff.type}-${index}`}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm"
              style={{ 
                animation: timeLeft < 2000 ? "pulse 0.5s infinite" : undefined,
              }}
            >
              <BuffIcon type={buff.type} size={28} />
              {buff.type !== "shield" && (
                <span className="absolute -bottom-1 -right-1 text-xs font-bold text-white bg-black/50 rounded-full w-5 h-5 flex items-center justify-center">
                  {seconds}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

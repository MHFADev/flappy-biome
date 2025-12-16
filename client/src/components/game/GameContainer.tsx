import { useState, useEffect, useCallback, useRef } from "react";
import { GameCanvas } from "./GameCanvas";
import { GameHUD } from "./GameHUD";
import { GameOverModal } from "./GameOverModal";
import { PauseModal } from "./PauseModal";
import { SkinEffectsOverlay } from "./SkinEffectsOverlay";
import { PlayerSkin } from "@/components/skins";
import { GachaSkinRenderer } from "@/components/gacha/GachaSkinRenderer";
import type { GameState, Difficulty, SkinType } from "@shared/schema";
import { getSkinById } from "@shared/gachaSkins";
import {
  createInitialGameState,
  startGame,
  pauseGame,
  jump,
  updateGame,
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SIZE,
} from "@/lib/gameEngine";
import { difficultyConfigs } from "@/lib/gameConfig";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { audioManager } from "@/lib/audioManager";
import { Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GameContainerProps {
  difficulty: Difficulty;
  skin: SkinType;
  playerName: string;
  onHome: () => void;
  onGameEnd?: (score: number) => void;
  gachaSkinId?: string | null;
}

export function GameContainer({ difficulty, skin, playerName, onHome, onGameEnd, gachaSkinId }: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: GAME_WIDTH, height: GAME_HEIGHT });
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(difficulty, skin)
  );
  const [isMuted, setIsMuted] = useState(false);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const prevScoreRef = useRef<number>(0);
  const prevBuffCountRef = useRef<number>(0);
  const { toast } = useToast();
  const diffConfig = difficultyConfigs[difficulty];

  useEffect(() => {
    audioManager.init();
    audioManager.play("bgm");
    return () => {
      audioManager.stopBgm();
    };
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    setGameState((prev) => {
      if (!prev.isPlaying || prev.isPaused || prev.isGameOver) {
        return prev;
      }
      return updateGame(prev, deltaTime);
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
      lastTimeRef.current = 0;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameLoop]);

  useEffect(() => {
    if (gameState.score > prevScoreRef.current) {
      audioManager.play("point");
    }
    prevScoreRef.current = gameState.score;
  }, [gameState.score]);

  useEffect(() => {
    if (gameState.activeBuffs.length > prevBuffCountRef.current) {
      audioManager.play("buff");
    }
    prevBuffCountRef.current = gameState.activeBuffs.length;
  }, [gameState.activeBuffs.length]);

  useEffect(() => {
    if (gameState.isGameOver) {
      audioManager.play("death");
      audioManager.stopBgm();
      // Call onGameEnd to award coins
      if (onGameEnd && gameState.score > 0) {
        onGameEnd(gameState.score);
      }
    }
  }, [gameState.isGameOver, gameState.score, onGameEnd]);

  useEffect(() => {
    if (gameState.isPaused) {
      audioManager.pauseBgm();
    } else if (gameState.isPlaying && !gameState.isGameOver) {
      audioManager.resumeBgm();
    }
  }, [gameState.isPaused, gameState.isPlaying, gameState.isGameOver]);

  const handleInteraction = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying) {
        audioManager.play("bgm");
        return startGame(prev);
      }
      audioManager.play("jump");
      return jump(prev);
    });
  }, []);

  const handlePause = useCallback(() => {
    setGameState((prev) => pauseGame(prev));
  }, []);

  const handleRestart = useCallback(() => {
    prevScoreRef.current = 0;
    prevBuffCountRef.current = 0;
    setGameState(createInitialGameState(difficulty, skin));
    setTimeout(() => {
      setGameState((prev) => startGame(prev));
      audioManager.play("bgm");
    }, 100);
  }, [difficulty, skin]);

  const handleSaveScore = useCallback(
    async (username: string): Promise<boolean> => {
      try {
        await apiRequest("POST", "/api/scores", {
          username,
          score: gameState.score,
          difficulty,
          skinUsed: skin,
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
        
        toast({
          title: "Score Saved!",
          description: `Your score of ${gameState.score} has been saved to the leaderboard.`,
        });
        return true;
      } catch (error) {
        console.error("Failed to save score:", error);
        toast({
          title: "Failed to Save",
          description: "Could not save your score. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    [gameState.score, difficulty, skin, toast]
  );

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioManager.setMuted(newMuted);
    audioManager.setBgmMuted(newMuted);
    if (newMuted) {
      audioManager.stopBgm();
    } else if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
      audioManager.play("bgm");
    }
  }, [isMuted, gameState.isPlaying, gameState.isPaused, gameState.isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        handleInteraction();
      } else if (e.code === "Escape") {
        e.preventDefault();
        if (gameState.isPlaying && !gameState.isGameOver) {
          handlePause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInteraction, handlePause, gameState.isPlaying, gameState.isGameOver]);

  useEffect(() => {
    const handleBlur = () => {
      if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
        setGameState((prev) => ({ ...prev, isPaused: true }));
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver]);

  const scaleX = containerSize.width / GAME_WIDTH;
  const scaleY = containerSize.height / GAME_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (containerSize.width - GAME_WIDTH * scale) / 2;
  const offsetY = (containerSize.height - GAME_HEIGHT * scale) / 2;

  const playerScreenX = offsetX + gameState.playerPosition.x * scale;
  const playerScreenY = offsetY + gameState.playerPosition.y * scale;
  const playerScreenSize = PLAYER_SIZE * scale;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden cursor-pointer select-none ${
        diffConfig.screenShake && gameState.isPlaying && !gameState.isPaused
          ? "animate-shake"
          : ""
      }`}
      onClick={handleInteraction}
      onTouchStart={(e) => {
        e.preventDefault();
        handleInteraction();
      }}
      data-testid="container-game"
    >
      <GameCanvas
        gameState={gameState}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
      />

      {gachaSkinId && getSkinById(gachaSkinId) && (
        <SkinEffectsOverlay
          skin={getSkinById(gachaSkinId)!}
          playerX={playerScreenX}
          playerY={playerScreenY}
          playerSize={playerScreenSize}
          isPlaying={gameState.isPlaying}
          isPaused={gameState.isPaused}
          playerVelocity={gameState.playerVelocity}
        />
      )}

      {/* SVG Player */}
      <div
        className="absolute pointer-events-none z-10 transition-transform duration-75"
        style={{
          left: playerScreenX - playerScreenSize / 2,
          top: playerScreenY - playerScreenSize / 2,
          width: playerScreenSize,
          height: playerScreenSize,
          transform: `rotate(${gameState.playerRotation}deg)`,
        }}
      >
        {gachaSkinId && getSkinById(gachaSkinId) ? (
          <GachaSkinRenderer 
            skin={getSkinById(gachaSkinId)!} 
            size={playerScreenSize} 
            showAnimation={false} 
            className="drop-shadow-lg" 
          />
        ) : (
          <PlayerSkin skin={skin} className="w-full h-full drop-shadow-lg" />
        )}
      </div>

      <GameHUD gameState={gameState} />

      {/* Control buttons */}
      {gameState.isPlaying && !gameState.isGameOver && (
        <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="bg-black/20 backdrop-blur-sm text-white"
            onClick={(e) => {
              e.stopPropagation();
              handlePause();
            }}
            data-testid="button-pause"
          >
            <Pause className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="bg-black/20 backdrop-blur-sm text-white"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            data-testid="button-mute"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>
      )}

      {/* Start overlay */}
      {!gameState.isPlaying && !gameState.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto mb-6">
              {gachaSkinId && getSkinById(gachaSkinId) ? (
                <GachaSkinRenderer 
                  skin={getSkinById(gachaSkinId)!} 
                  size={96} 
                  showAnimation={true} 
                />
              ) : (
                <PlayerSkin skin={skin} className="w-full h-full animate-bounce" />
              )}
            </div>
            <h2 className="text-4xl font-black text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              Tap to Start
            </h2>
            <p className="text-white/70 text-lg">
              Press Space, Click, or Tap to fly
            </p>
          </div>
        </div>
      )}

      {/* Pause modal */}
      {gameState.isPaused && (
        <PauseModal
          onResume={handlePause}
          onHome={onHome}
        />
      )}

      {/* Game over modal */}
      {gameState.isGameOver && (
        <GameOverModal
          score={gameState.score}
          highScore={gameState.highScore}
          difficulty={difficulty}
          skin={skin}
          playerName={playerName}
          onRestart={handleRestart}
          onHome={onHome}
          onSaveScore={handleSaveScore}
        />
      )}

      {/* Masochist mode danger overlay */}
      {diffConfig.invisibleMode && gameState.isPlaying && !gameState.isPaused && (
        <div
          className="absolute inset-0 pointer-events-none z-5"
          style={{
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(139, 0, 0, 0.3) 100%)",
            animation: "pulse 2s infinite",
          }}
        />
      )}
    </div>
  );
}

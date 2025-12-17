import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GameContainer } from "@/components/game/GameContainer";
import { DifficultySelector } from "@/components/game/DifficultySelector";
import { Leaderboard } from "@/components/game/Leaderboard";
import { PlayerSkin } from "@/components/skins";
import { GachaModal } from "@/components/gacha/GachaModal";
import { SkinInventory } from "@/components/gacha/SkinInventory";
import { GachaSkinRenderer } from "@/components/gacha/GachaSkinRenderer";
import { CoinDisplay } from "@/components/ui/CoinIcon";
import { apiRequest } from "@/lib/queryClient";
import type { Difficulty, SkinType, Score, Player } from "@shared/schema";
import { getSkinById } from "@shared/gachaSkins";
import { SkinCarousel } from "@/components/game/SkinCarousel";
import { Play, Trophy, User, Medal, Sparkles, Package, Lock, Check, ChevronRight, Gamepad2 } from "lucide-react";

function generateRandomName(): string {
  const adjectives = ["Swift", "Brave", "Mighty", "Lucky", "Speedy", "Cosmic", "Shadow", "Storm", "Nova", "Blaze"];
  const nouns = ["Hawk", "Tiger", "Dragon", "Phoenix", "Wolf", "Eagle", "Knight", "Ninja", "Pilot", "Hero"];
  const num = Math.floor(Math.random() * 1000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${num}`;
}

type GameScreen = "menu" | "playing" | "leaderboard" | "inventory";

type PlayerWithExtras = Player & { 
  ownedSkinIds: string[]; 
  nextSpinCost: number;
  nextMultiSpinCost?: number;
  spinsUntilPity?: number;
  pityThreshold?: number;
};

export default function Home() {
  const [screen, setScreen] = useState<GameScreen>("menu");
  const [selectedSkin, setSelectedSkin] = useState<SkinType>("cute");
  const [selectedGachaSkinId, setSelectedGachaSkinId] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("normal");
  const [playerName, setPlayerName] = useState<string>("");
  const [showGacha, setShowGacha] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerWithExtras | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) {
      setPlayerName(storedName);
    } else {
      const newName = generateRandomName();
      setPlayerName(newName);
      localStorage.setItem("playerName", newName);
    }
  }, []);

  // Fetch player data
  const { data: fetchedPlayerData, refetch: refetchPlayer } = useQuery<PlayerWithExtras>({
    queryKey: ["/api/player", playerName],
    enabled: playerName.length > 0,
  });

  useEffect(() => {
    if (fetchedPlayerData) {
      setPlayerData(fetchedPlayerData);
      if (fetchedPlayerData.selectedSkinId) {
        setSelectedGachaSkinId(fetchedPlayerData.selectedSkinId);
      }
    }
  }, [fetchedPlayerData]);

  const handlePlayerNameChange = (newName: string) => {
    setPlayerName(newName);
    localStorage.setItem("playerName", newName);
  };

  // Select skin mutation
  const selectSkinMutation = useMutation({
    mutationFn: async (skinId: string) => {
      const response = await apiRequest("POST", `/api/player/${playerName}/select-skin`, { skinId });
      return response.json();
    },
    onSuccess: () => {
      refetchPlayer();
    },
  });

  const handleSelectGachaSkin = (skinId: string) => {
    setSelectedGachaSkinId(skinId);
    selectSkinMutation.mutate(skinId);
  };

  const handlePlayerUpdate = (updatedPlayer: PlayerWithExtras) => {
    setPlayerData(updatedPlayer);
  };

  // Handle game end and add coins
  const handleGameEnd = async (score: number) => {
    // Award coins based on score (1 coin per point)
    const coinsEarned = Math.floor(score * 20);
    if (coinsEarned > 0 && playerName) {
      try {
        await apiRequest("POST", `/api/player/${playerName}/coins`, { amount: coinsEarned });
        refetchPlayer();
      } catch (error) {
        console.error("Failed to add coins:", error);
      }
    }
  };

  const { data: leaderboardScores, isLoading: isLeaderboardLoading } = useQuery<Score[]>({
    queryKey: ["/api/leaderboard", selectedDifficulty],
  });

  // Get selected gacha skin for display
  const selectedGachaSkin = selectedGachaSkinId ? getSkinById(selectedGachaSkinId) : null;

  if (screen === "playing") {
    return (
      <div className="fixed inset-0 bg-black">
        <GameContainer
          difficulty={selectedDifficulty}
          skin={selectedSkin}
          playerName={playerName}
          onHome={() => {
            setScreen("menu");
            refetchPlayer();
          }}
          onGameEnd={handleGameEnd}
          gachaSkinId={selectedGachaSkinId}
        />
      </div>
    );
  }

  if (screen === "leaderboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => setScreen("menu")}
            className="mb-4"
            data-testid="button-back-menu"
          >
            «— Back to Menu
          </Button>
          <Leaderboard initialDifficulty={selectedDifficulty} />
        </div>
      </div>
    );
  }

  if (screen === "inventory" && playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button
              variant="ghost"
              onClick={() => setScreen("menu")}
              data-testid="button-back-menu"
            >
              Back to Menu
            </Button>
            <CoinDisplay amount={playerData.coins} size="lg" />
          </div>
          <div className="h-[calc(100vh-160px)]">
            <SkinInventory
              player={playerData}
              onSelectSkin={handleSelectGachaSkin}
              selectedSkinId={selectedGachaSkinId}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 overflow-y-auto">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-chart-2/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-chart-4/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header / Logo */}
        <header className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20">
              {selectedGachaSkin ? (
                <GachaSkinRenderer skin={selectedGachaSkin} size={80} showAnimation={true} />
              ) : (
                <PlayerSkin skin={selectedSkin} className="w-full h-full animate-bounce" />
              )}
            </div>
          </div>
          <h1 
            className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent"
            style={{ 
              animation: "pulse 3s ease-in-out infinite",
              textShadow: "0 0 40px rgba(var(--primary), 0.3)"
            }}
          >
            Flappy Biome
          </h1>
          <p className="text-xl md:text-2xl font-bold text-muted-foreground tracking-wide uppercase">
            Vector Cataclysm
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Navigate through dangerous biomes, collect power-ups, and survive as long as you can!
          </p>
        </header>

        {/* Player Stats Bar */}
        {playerData && (
          <Card className="bg-card/60 backdrop-blur-lg border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <CoinDisplay amount={playerData.coins} size="lg" />
                  <span className="text-sm text-muted-foreground">
                    {playerData.ownedSkinIds.length} skins collected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowGacha(true)}
                    data-testid="button-open-gacha"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gacha
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setScreen("inventory")}
                    data-testid="button-inventory"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Collection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Player Name */}
        <Card className="bg-card/60 backdrop-blur-lg border-border/50">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Your Name
            </h2>
            <Input
              value={playerName}
              onChange={(e) => handlePlayerNameChange(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              data-testid="input-player-name"
            />
          </CardContent>
        </Card>

        {/* Base Character Selection */}
        <Card className="bg-card/60 backdrop-blur-lg border-border/50">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary" />
              Choose Your Character
            </h2>
            <SkinCarousel
              selectedSkin={selectedSkin}
              onSelectSkin={(skin) => {
                setSelectedSkin(skin);
                setSelectedGachaSkinId(null);
              }}
            />
          </CardContent>
        </Card>

        {/* Vault / Collection */}
        <Card className="bg-card/60 backdrop-blur-lg border-border/50" data-testid="vault-collection-section">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Vault / Collection
              </h2>
              {playerData && playerData.ownedSkinIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScreen("inventory")}
                  data-testid="button-view-all-skins"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
            
            {playerData && playerData.ownedSkinIds.length > 0 ? (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3" data-testid="vault-skin-grid">
                  {playerData.ownedSkinIds.slice(0, 6).map((skinId) => {
                    const skin = getSkinById(skinId);
                    if (!skin) return null;
                    const isSelected = selectedGachaSkinId === skinId;
                    
                    return (
                      <button
                        key={skinId}
                        onClick={() => handleSelectGachaSkin(skinId)}
                        className={`
                          relative p-2 rounded-lg transition-all duration-200 hover-elevate
                          ${isSelected ? "ring-2 ring-primary bg-primary/10" : "bg-muted/30"}
                        `}
                        data-testid={`vault-skin-${skinId}`}
                      >
                        <GachaSkinRenderer 
                          skin={skin} 
                          size={60} 
                          showAnimation={isSelected}
                        />
                        
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                        
                        <p className="text-xs font-medium mt-1 truncate text-center">
                          {skin.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {playerData.ownedSkinIds.length > 6 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    +{playerData.ownedSkinIds.length - 6} more skins in your collection
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-8" data-testid="vault-empty-state">
                <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  No skins collected yet!
                </p>
                <Button
                  variant="default"
                  onClick={() => setShowGacha(true)}
                  data-testid="button-try-gacha"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try Gacha to unlock skins
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Difficulty Selector */}
        <Card className="bg-card/60 backdrop-blur-lg border-border/50">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Select Difficulty</h2>
            <DifficultySelector
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
            />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {selectedDifficulty === "masochist" && (
                <span className="text-destructive font-semibold">
                  Warning: Invisible obstacles and screen shake enabled!
                </span>
              )}
              {selectedDifficulty === "insane" && (
                <span className="text-orange-500 font-semibold">
                  Homing rockets will hunt you down!
                </span>
              )}
              {selectedDifficulty === "expert" && (
                <span className="text-red-500 font-semibold">
                  Tiny gaps and fast speed - for pros only!
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="text-lg px-12 py-6 font-bold"
            onClick={() => setScreen("playing")}
            data-testid="button-play"
          >
            <Play className="w-6 h-6 mr-2" />
            Play Game
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6"
            onClick={() => setScreen("leaderboard")}
            data-testid="button-leaderboard"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Leaderboard
          </Button>
        </div>

        {/* Coin Earning Info */}
        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-lg border-yellow-500/30">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Earn Coins by Playing!
            </h3>
            <p className="text-sm text-muted-foreground">
              Score points to earn coins. Use coins in the Gacha to unlock 85+ unique skins!
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              1.5 coins per point scored
            </p>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-card/40 backdrop-blur-lg border-border/30">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3">How to Play</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Tap, click, or press Space to fly upward
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                Navigate through gaps in obstacles
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                Collect power-ups: Shield (protection), Clock (slow-mo), Star (2x score)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                Progress through biomes: Forest → Ice → Magma → Void
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Mini Leaderboard */}
        <Card className="bg-card/60 backdrop-blur-lg border-border/50">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" />
              Top 5 - {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
            </h3>
            {isLeaderboardLoading ? (
              <div className="text-center py-4 text-muted-foreground" data-testid="leaderboard-loading">
                Loading...
              </div>
            ) : leaderboardScores && leaderboardScores.length > 0 ? (
              <ul className="space-y-2" data-testid="mini-leaderboard-list">
                {leaderboardScores.slice(0, 5).map((score, index) => (
                  <li
                    key={score.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30"
                    data-testid={`leaderboard-entry-${index}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="truncate max-w-[150px]" data-testid={`leaderboard-username-${index}`}>
                        {score.username}
                      </span>
                    </div>
                    <span className="font-mono font-bold" data-testid={`leaderboard-score-${index}`}>
                      {score.score}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4 text-muted-foreground" data-testid="leaderboard-empty">
                No scores yet. Be the first!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground pb-8">
          <p>Flappy Biome: Vector Cataclysm</p>
          <p className="mt-1">Built with React, Canvas & SVG</p>
        </footer>
      </div>

      {/* Gacha Modal */}
      {playerData && (
        <GachaModal
          isOpen={showGacha}
          onClose={() => setShowGacha(false)}
          player={playerData}
          onPlayerUpdate={handlePlayerUpdate}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GachaSkinRenderer, RarityBadge } from "./GachaSkinRenderer";
import { CoinDisplay, CoinIcon } from "@/components/ui/CoinIcon";
import type { GachaSkin, GachaSpinResult, GachaMultiSpinResult, Player } from "@shared/schema";
import { rarityConfig, MULTI_SPIN_COUNT, PITY_THRESHOLD } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, RotateCw, X, Gift, Zap, Star, Crown, History, Info, ChevronRight } from "lucide-react";

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player & { 
    ownedSkinIds: string[]; 
    nextSpinCost: number;
    nextMultiSpinCost?: number;
    spinsUntilPity?: number;
    pityThreshold?: number;
  };
  onPlayerUpdate: (player: Player & { 
    ownedSkinIds: string[]; 
    nextSpinCost: number;
    nextMultiSpinCost?: number;
    spinsUntilPity?: number;
    pityThreshold?: number;
  }) => void;
}

type SpinState = "idle" | "spinning" | "revealing" | "result" | "multi-revealing" | "multi-result";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

function ParticleEffect({ color, active }: { color: string; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const createParticle = (): Particle => ({
      id: Math.random(),
      x: canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: canvas.height / 2 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      color,
      size: Math.random() * 6 + 2,
      life: 1,
    });

    for (let i = 0; i < 30; i++) {
      particlesRef.current.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.02;

        if (p.life <= 0) return false;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      particlesRef.current = [];
    };
  }, [active, color]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
}

export function GachaModal({ isOpen, onClose, player, onPlayerUpdate }: GachaModalProps) {
  const [spinState, setSpinState] = useState<SpinState>("idle");
  const [currentResult, setCurrentResult] = useState<GachaSpinResult | null>(null);
  const [multiResults, setMultiResults] = useState<GachaSpinResult[]>([]);
  const [multiResultIndex, setMultiResultIndex] = useState(0);
  const [displayedRarity, setDisplayedRarity] = useState<number>(0);
  const [showParticles, setShowParticles] = useState(false);
  const [isPityResult, setIsPityResult] = useState(false);
  const [activeTab, setActiveTab] = useState("spin");
  const queryClient = useQueryClient();

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/gacha/spin", { username: player.username });
      return response.json();
    },
    onSuccess: (data: { result: GachaSpinResult; isPity: boolean; player: typeof player }) => {
      setCurrentResult(data.result);
      setIsPityResult(data.isPity);
      onPlayerUpdate(data.player);
      startRevealAnimation(data.result.skin.rarity);
    },
    onError: (error) => {
      console.error("Spin failed:", error);
      setSpinState("idle");
    },
  });

  const multiSpinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/gacha/multi-spin", { username: player.username });
      return response.json();
    },
    onSuccess: (data: { result: GachaMultiSpinResult; player: typeof player }) => {
      setMultiResults(data.result.results);
      setMultiResultIndex(0);
      onPlayerUpdate(data.player);
      setSpinState("multi-revealing");
      startMultiReveal(data.result.results);
    },
    onError: (error) => {
      console.error("Multi-spin failed:", error);
      setSpinState("idle");
    },
  });

  const startMultiReveal = useCallback((results: GachaSpinResult[]) => {
    let index = 0;
    const revealNext = () => {
      if (index < results.length) {
        setMultiResultIndex(index);
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 500);
        index++;
        setTimeout(revealNext, 400);
      } else {
        setSpinState("multi-result");
      }
    };
    revealNext();
  }, []);

  const startRevealAnimation = useCallback((finalRarity: string) => {
    setSpinState("revealing");
    setDisplayedRarity(0);
    
    const rarities = Object.keys(rarityConfig);
    const finalIndex = rarities.indexOf(finalRarity);
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < finalIndex) {
        setDisplayedRarity(currentIndex);
        currentIndex++;
      } else {
        setDisplayedRarity(finalIndex);
        clearInterval(interval);
        setShowParticles(true);
        setTimeout(() => {
          setSpinState("result");
          setTimeout(() => setShowParticles(false), 1000);
        }, 500);
      }
    }, 120);
  }, []);

  const handleSpin = () => {
    if (player.coins < player.nextSpinCost) return;
    setSpinState("spinning");
    setCurrentResult(null);
    setIsPityResult(false);
    
    setTimeout(() => {
      spinMutation.mutate();
    }, 1200);
  };

  const handleMultiSpin = () => {
    const multiCost = player.nextMultiSpinCost || player.nextSpinCost * MULTI_SPIN_COUNT;
    if (player.coins < multiCost) return;
    setSpinState("spinning");
    setMultiResults([]);
    setMultiResultIndex(0);
    
    setTimeout(() => {
      multiSpinMutation.mutate();
    }, 1500);
  };

  const handleClose = () => {
    setSpinState("idle");
    setCurrentResult(null);
    setMultiResults([]);
    setActiveTab("spin");
    onClose();
  };

  const handleSpinAgain = () => {
    setSpinState("idle");
    setCurrentResult(null);
    setMultiResults([]);
  };

  const canAffordSpin = player.coins >= player.nextSpinCost;
  const multiCost = player.nextMultiSpinCost || player.nextSpinCost * MULTI_SPIN_COUNT;
  const canAffordMultiSpin = player.coins >= multiCost;
  const rarities = Object.keys(rarityConfig) as (keyof typeof rarityConfig)[];
  const pityProgress = player.pityThreshold 
    ? ((player.pityThreshold - (player.spinsUntilPity || 0)) / player.pityThreshold) * 100
    : 0;

  const currentRevealSkin = multiResults[multiResultIndex];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Skin Gacha
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-6" style={{ width: "calc(100% - 48px)" }}>
            <TabsTrigger value="spin" data-testid="tab-spin">
              <Gift className="w-4 h-4 mr-2" />
              Spin
            </TabsTrigger>
            <TabsTrigger value="info" data-testid="tab-info">
              <Info className="w-4 h-4 mr-2" />
              Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spin" className="p-6 pt-4 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CoinDisplay amount={player.coins} size="lg" />
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Spins: {player.totalSpins}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>Pity Progress</span>
                </div>
                <span className="text-muted-foreground">
                  {player.spinsUntilPity || PITY_THRESHOLD} spins until Gold+ guaranteed
                </span>
              </div>
              <Progress value={pityProgress} className="h-2" />
            </div>

            <Card className="relative overflow-visible p-6 flex flex-col items-center justify-center min-h-[260px] bg-gradient-to-br from-muted/30 to-muted/10">
              {spinState === "idle" && (
                <div className="text-center space-y-4">
                  <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-dashed border-primary/30 animate-pulse">
                    <Gift className="w-14 h-14 text-primary/50" />
                  </div>
                  <p className="text-muted-foreground">
                    Spin to get a random skin!
                  </p>
                </div>
              )}

              {spinState === "spinning" && (
                <div className="text-center space-y-4">
                  <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-chart-2/30 flex items-center justify-center">
                    <RotateCw className="w-14 h-14 text-primary animate-spin" style={{ animationDuration: "0.5s" }} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground animate-pulse font-semibold">
                      Spinning...
                    </p>
                    <div className="flex justify-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {spinState === "revealing" && (
                <div className="text-center space-y-4">
                  <div 
                    className="w-28 h-28 mx-auto rounded-full flex items-center justify-center transition-all duration-200"
                    style={{ 
                      backgroundColor: `${rarityConfig[rarities[displayedRarity]].color}30`,
                      boxShadow: `0 0 40px ${rarityConfig[rarities[displayedRarity]].glowColor}60`,
                    }}
                  >
                    <Zap 
                      className="w-14 h-14 animate-pulse" 
                      style={{ color: rarityConfig[rarities[displayedRarity]].color }} 
                    />
                  </div>
                  <RarityBadge rarity={rarities[displayedRarity]} size="lg" />
                </div>
              )}

              {spinState === "result" && currentResult && (
                <div className="relative text-center space-y-3 animate-in fade-in zoom-in duration-300">
                  <ParticleEffect 
                    color={rarityConfig[currentResult.skin.rarity].glowColor} 
                    active={showParticles} 
                  />
                  
                  {isPityResult && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                      PITY BONUS!
                    </div>
                  )}
                  
                  <div 
                    className="relative"
                    style={{
                      filter: `drop-shadow(0 0 20px ${rarityConfig[currentResult.skin.rarity].glowColor})`,
                    }}
                  >
                    <GachaSkinRenderer 
                      skin={currentResult.skin} 
                      size={120} 
                      showAnimation={true}
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">{currentResult.skin.name}</h3>
                    <RarityBadge rarity={currentResult.skin.rarity} size="md" />
                    
                    {currentResult.isNew ? (
                      <p className="text-sm text-chart-4 font-semibold flex items-center justify-center gap-1">
                        <Star className="w-4 h-4" />
                        NEW SKIN!
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        Duplicate +<CoinIcon size={14} /> {currentResult.coinsRefund}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(spinState === "multi-revealing" || spinState === "multi-result") && (
                <div className="w-full space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {spinState === "multi-revealing" 
                        ? `Revealing... ${multiResultIndex + 1}/${MULTI_SPIN_COUNT}` 
                        : `${MULTI_SPIN_COUNT}x Spin Complete!`}
                    </p>
                  </div>
                  
                  <ScrollArea className="h-[180px] w-full">
                    <div className="grid grid-cols-5 gap-2 p-2">
                      {multiResults.map((result, index) => (
                        <div 
                          key={index}
                          className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                            index <= multiResultIndex ? "opacity-100 scale-100" : "opacity-30 scale-90"
                          }`}
                          style={{
                            backgroundColor: index <= multiResultIndex 
                              ? `${rarityConfig[result.skin.rarity].color}20` 
                              : "transparent",
                            boxShadow: index === multiResultIndex && spinState === "multi-revealing"
                              ? `0 0 15px ${rarityConfig[result.skin.rarity].glowColor}` 
                              : "none",
                          }}
                        >
                          <GachaSkinRenderer 
                            skin={result.skin} 
                            size={50} 
                            showAnimation={index === multiResultIndex}
                          />
                          <div className="mt-1 text-center">
                            <p className="text-[10px] font-medium truncate max-w-[60px]">
                              {result.skin.name}
                            </p>
                            {result.isNew && (
                              <span className="text-[9px] text-chart-4 font-bold">NEW</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {spinState === "multi-result" && (
                    <div className="text-center text-sm space-y-1">
                      <p className="font-semibold text-chart-4">
                        {multiResults.filter(r => r.isNew).length} New Skins!
                      </p>
                      <p className="text-muted-foreground flex items-center justify-center gap-1">
                        Refunded: <CoinIcon size={14} /> {multiResults.reduce((s, r) => s + r.coinsRefund, 0)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <div className="space-y-3">
              {spinState !== "result" && spinState !== "multi-result" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">x1 Spin:</span>
                        <CoinDisplay amount={player.nextSpinCost} size="sm" />
                      </div>
                      <Button
                        onClick={handleSpin}
                        disabled={!canAffordSpin || spinState !== "idle"}
                        className="w-full h-11 font-bold"
                        data-testid="button-gacha-spin"
                      >
                        {spinState === "spinning" || spinState === "revealing" ? (
                          <RotateCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Spin x1
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          x{MULTI_SPIN_COUNT} Spin
                          <span className="text-xs text-chart-4">-10%</span>
                        </span>
                        <CoinDisplay amount={multiCost} size="sm" />
                      </div>
                      <Button
                        onClick={handleMultiSpin}
                        disabled={!canAffordMultiSpin || spinState !== "idle"}
                        variant="default"
                        className="w-full h-11 font-bold bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                        data-testid="button-gacha-multi-spin"
                      >
                        {spinState === "spinning" || spinState === "multi-revealing" ? (
                          <RotateCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Spin x{MULTI_SPIN_COUNT}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {!canAffordSpin && (
                    <p className="text-sm text-center text-destructive">
                      Not enough coins! Play more games to earn coins.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSpinAgain}
                    disabled={!canAffordSpin}
                    className="flex-1 h-11"
                    data-testid="button-spin-again"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Spin Again
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1 h-11"
                    data-testid="button-close-gacha"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="info" className="p-6 pt-4 space-y-4">
            <Card className="p-4 space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Pity System
              </h3>
              <p className="text-sm text-muted-foreground">
                Every {PITY_THRESHOLD} spins, you're guaranteed to get a <strong className="text-yellow-500">Gold</strong> rarity or higher skin!
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span>Your progress:</span>
                <Progress value={pityProgress} className="flex-1 h-2" />
                <span className="text-muted-foreground">{player.spinsUntilPity || PITY_THRESHOLD} left</span>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-chart-2" />
                Multi-Spin Bonus
              </h3>
              <p className="text-sm text-muted-foreground">
                Spin x{MULTI_SPIN_COUNT} at once and get a <strong className="text-chart-4">10% discount</strong> on the total cost!
              </p>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="font-bold">Drop Rates</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {Object.entries(rarityConfig).map(([rarity, config]) => (
                  <div key={rarity} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: config.color }}
                    />
                    <span>{config.name}</span>
                    <span className="text-muted-foreground ml-auto">{config.dropRate}%</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="font-bold">Duplicate Refund</h3>
              <p className="text-sm text-muted-foreground">
                If you get a skin you already own, you'll receive <strong className="text-chart-4">30%</strong> of the spin cost back as coins!
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

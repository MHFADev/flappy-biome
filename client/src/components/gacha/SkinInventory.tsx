import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GachaSkinRenderer, RarityBadge } from "./GachaSkinRenderer";
import type { GachaSkin, RarityType, SkinCategory, Player } from "@shared/schema";
import { rarityConfig, rarityTypes, skinCategories } from "@shared/schema";
import { ALL_GACHA_SKINS } from "@shared/gachaSkins";
import { Check, Lock, Filter, Grid, List, Sparkles } from "lucide-react";

interface SkinInventoryProps {
  player: Player & { ownedSkinIds: string[]; nextSpinCost: number };
  onSelectSkin: (skinId: string) => void;
  selectedSkinId: string | null;
}

type ViewMode = "grid" | "list";
type FilterType = "all" | RarityType | SkinCategory;

export function SkinInventory({ player, onSelectSkin, selectedSkinId }: SkinInventoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showOwned, setShowOwned] = useState<"all" | "owned" | "locked">("all");

  const ownedSet = useMemo(() => new Set(player.ownedSkinIds), [player.ownedSkinIds]);

  const filteredSkins = useMemo(() => {
    return ALL_GACHA_SKINS.filter(skin => {
      // Filter by owned status
      if (showOwned === "owned" && !ownedSet.has(skin.id)) return false;
      if (showOwned === "locked" && ownedSet.has(skin.id)) return false;

      // Filter by rarity or category
      if (filter !== "all") {
        if (rarityTypes.includes(filter as RarityType)) {
          if (skin.rarity !== filter) return false;
        } else if (skinCategories.includes(filter as SkinCategory)) {
          if (skin.category !== filter) return false;
        }
      }

      return true;
    });
  }, [filter, showOwned, ownedSet]);

  // Group skins by rarity for display
  const groupedSkins = useMemo(() => {
    const groups: Record<RarityType, GachaSkin[]> = {} as Record<RarityType, GachaSkin[]>;
    for (const rarity of rarityTypes) {
      groups[rarity] = filteredSkins.filter(s => s.rarity === rarity);
    }
    return groups;
  }, [filteredSkins]);

  const totalOwned = player.ownedSkinIds.length;
  const totalSkins = ALL_GACHA_SKINS.length;
  const completionPercent = Math.round((totalOwned / totalSkins) * 100);

  return (
    <Card className="h-full flex flex-col bg-card/60 backdrop-blur-lg border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Skin Collection
          </CardTitle>
          <Badge variant="secondary" className="text-sm">
            {totalOwned} / {totalSkins} ({completionPercent}%)
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {/* View mode toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="rounded-none"
              data-testid="button-view-grid"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="rounded-none"
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Owned filter */}
          <div className="flex border rounded-md overflow-hidden">
            <Button
              size="sm"
              variant={showOwned === "all" ? "default" : "ghost"}
              onClick={() => setShowOwned("all")}
              className="rounded-none text-xs"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={showOwned === "owned" ? "default" : "ghost"}
              onClick={() => setShowOwned("owned")}
              className="rounded-none text-xs"
            >
              Owned
            </Button>
            <Button
              size="sm"
              variant={showOwned === "locked" ? "default" : "ghost"}
              onClick={() => setShowOwned("locked")}
              className="rounded-none text-xs"
            >
              Locked
            </Button>
          </div>

          {/* Rarity filter dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="h-8 px-2 text-sm rounded-md border bg-background"
            data-testid="select-filter"
          >
            <option value="all">All Rarities</option>
            {rarityTypes.map(rarity => (
              <option key={rarity} value={rarity}>
                {rarityConfig[rarity].name}
              </option>
            ))}
            <optgroup label="Categories">
              {skinCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {viewMode === "grid" ? (
            <div className="space-y-6">
              {rarityTypes.map(rarity => {
                const skins = groupedSkins[rarity];
                if (skins.length === 0) return null;

                return (
                  <div key={rarity}>
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: rarityConfig[rarity].color }}
                      />
                      <h3 className="font-semibold text-sm">{rarityConfig[rarity].name}</h3>
                      <span className="text-xs text-muted-foreground">
                        ({skins.filter(s => ownedSet.has(s.id)).length}/{skins.length})
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                      {skins.map(skin => {
                        const isOwned = ownedSet.has(skin.id);
                        const isSelected = selectedSkinId === skin.id;

                        return (
                          <button
                            key={skin.id}
                            onClick={() => isOwned && onSelectSkin(skin.id)}
                            disabled={!isOwned}
                            className={`
                              relative p-2 rounded-lg transition-all duration-200
                              ${isOwned ? "hover-elevate cursor-pointer" : "opacity-50 cursor-not-allowed"}
                              ${isSelected ? "ring-2 ring-primary bg-primary/10" : "bg-muted/30"}
                            `}
                            data-testid={`skin-card-${skin.id}`}
                          >
                            <div className={`${!isOwned ? "grayscale" : ""}`}>
                              <GachaSkinRenderer 
                                skin={skin} 
                                size={60} 
                                showAnimation={isOwned && isSelected}
                              />
                            </div>
                            
                            {!isOwned && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                                <Lock className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            
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
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSkins.map(skin => {
                const isOwned = ownedSet.has(skin.id);
                const isSelected = selectedSkinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`
                      flex items-center gap-4 p-3 rounded-lg transition-all
                      ${isOwned ? "hover-elevate cursor-pointer" : "opacity-50"}
                      ${isSelected ? "ring-2 ring-primary bg-primary/10" : "bg-muted/30"}
                    `}
                    onClick={() => isOwned && onSelectSkin(skin.id)}
                    data-testid={`skin-list-${skin.id}`}
                  >
                    <div className={`${!isOwned ? "grayscale" : ""}`}>
                      <GachaSkinRenderer 
                        skin={skin} 
                        size={50} 
                        showAnimation={isOwned && isSelected}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{skin.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <RarityBadge rarity={skin.rarity} size="sm" />
                        <span className="text-xs text-muted-foreground capitalize">
                          {skin.category}
                        </span>
                      </div>
                    </div>
                    
                    {!isOwned && (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                    
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerSkin, skinInfo } from "@/components/skins";
import type { SkinType } from "@shared/schema";
import { skinTypes } from "@shared/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkinCarouselProps {
  selectedSkin: SkinType;
  onSelectSkin: (skin: SkinType) => void;
}

export function SkinCarousel({ selectedSkin, onSelectSkin }: SkinCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 160;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = skinTypes.indexOf(selectedSkin);
      const cardWidth = 144;
      const containerWidth = scrollRef.current.clientWidth;
      const scrollPosition = selectedIndex * cardWidth - (containerWidth - cardWidth) / 2;
      scrollRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="ghost"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
        onClick={() => scroll("left")}
        data-testid="button-skin-prev"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-12 py-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {skinTypes.map((skinType) => {
          const info = skinInfo[skinType];
          const isSelected = skinType === selectedSkin;

          return (
            <Card
              key={skinType}
              className={`flex-shrink-0 w-32 p-4 cursor-pointer snap-center transition-all duration-200 ${
                isSelected
                  ? "ring-4 ring-white/50 scale-110 bg-card"
                  : "bg-card/60 opacity-80"
              }`}
              onClick={() => onSelectSkin(skinType)}
              data-testid={`card-skin-${skinType}`}
            >
              <div className="flex flex-col items-center gap-3">
                <div 
                  className={`w-20 h-20 transition-transform duration-300 ${
                    isSelected ? "animate-pulse" : ""
                  }`}
                >
                  <PlayerSkin 
                    skin={skinType} 
                    className="w-full h-full"
                    style={{ 
                      filter: isSelected ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))" : undefined 
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">{info.name}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {info.theme}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
        onClick={() => scroll("right")}
        data-testid="button-skin-next"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}

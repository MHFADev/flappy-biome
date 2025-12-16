import type { Difficulty } from "@shared/schema";
import { difficulties } from "@shared/schema";
import { difficultyConfigs } from "@/lib/gameConfig";
import { Skull, Zap, Target, Flame, AlertTriangle, Smile } from "lucide-react";

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

const difficultyIcons: Record<Difficulty, typeof Skull> = {
  easy: Smile,
  normal: Target,
  hard: Zap,
  insane: Flame,
  expert: AlertTriangle,
  masochist: Skull,
};

export function DifficultySelector({
  selectedDifficulty,
  onSelectDifficulty,
}: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {difficulties.map((difficulty) => {
        const config = difficultyConfigs[difficulty];
        const Icon = difficultyIcons[difficulty];
        const isSelected = difficulty === selectedDifficulty;

        return (
          <button
            key={difficulty}
            onClick={() => onSelectDifficulty(difficulty)}
            className={`relative flex flex-col items-center gap-2 px-4 py-4 rounded-xl font-semibold uppercase tracking-wide transition-all duration-200 ${
              isSelected
                ? "scale-105 shadow-lg"
                : "opacity-70"
            }`}
            style={{
              backgroundColor: isSelected ? config.color : `${config.color}40`,
              color: isSelected ? "#ffffff" : config.color,
              border: `2px solid ${config.color}`,
            }}
            data-testid={`button-difficulty-${difficulty}`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-sm">{config.label}</span>
            {difficulty === "masochist" && isSelected && (
              <span className="absolute -top-2 -right-2 text-xs bg-white text-black px-2 py-0.5 rounded-full font-bold">
                !!!
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

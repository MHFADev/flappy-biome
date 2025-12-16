import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Trophy, RotateCcw, Home, Save } from "lucide-react";
import type { Difficulty, SkinType } from "@shared/schema";

interface GameOverModalProps {
  score: number;
  highScore: number;
  difficulty: Difficulty;
  skin: SkinType;
  playerName: string;
  onRestart: () => void;
  onHome: () => void;
  onSaveScore: (username: string) => Promise<boolean>;
}

export function GameOverModal({
  score,
  highScore,
  difficulty,
  skin,
  playerName,
  onRestart,
  onHome,
  onSaveScore,
}: GameOverModalProps) {
  const [username, setUsername] = useState(playerName);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isNewHighScore = score >= highScore && score > 0;

  const handleSave = async () => {
    if (!username.trim() || saved || isSaving) return;
    setIsSaving(true);
    const success = await onSaveScore(username.trim());
    if (success) {
      setSaved(true);
    }
    setIsSaving(false);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-lg z-50">
      <Card className="w-full max-w-md mx-4 bg-card/95 backdrop-blur-xl border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
            <Trophy className={`w-8 h-8 ${isNewHighScore ? "text-yellow-500" : "text-muted-foreground"}`} />
          </div>
          <CardTitle className="text-3xl font-black">
            {isNewHighScore ? "New High Score!" : "Game Over"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Final Score</p>
              <p className="text-4xl font-bold font-mono" data-testid="text-final-score">{score}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Best Score</p>
              <p className="text-4xl font-bold font-mono text-muted-foreground">{highScore}</p>
            </div>
          </div>

          {/* Save score section */}
          {!saved && score > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Save your score to the leaderboard
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  className="flex-1"
                  data-testid="input-username"
                />
                <Button
                  onClick={handleSave}
                  disabled={!username.trim() || isSaving}
                  data-testid="button-save-score"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}

          {saved && (
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-500 font-medium">Score saved to leaderboard!</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            onClick={onRestart}
            className="w-full"
            size="lg"
            data-testid="button-restart"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          <Button
            onClick={onHome}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="button-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Main Menu
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

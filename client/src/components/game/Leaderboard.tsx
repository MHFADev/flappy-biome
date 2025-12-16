import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerSkin, skinInfo } from "@/components/skins";
import type { Score, Difficulty, SkinType } from "@shared/schema";
import { difficulties } from "@shared/schema";
import { difficultyConfigs } from "@/lib/gameConfig";
import { Trophy, Medal, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LeaderboardProps {
  initialDifficulty?: Difficulty;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
        <Trophy className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
        <Award className="w-4 h-4 text-white" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      <span className="text-sm font-bold text-muted-foreground">{rank}</span>
    </div>
  );
}

function LeaderboardTable({ difficulty }: { difficulty: Difficulty }) {
  const { data: scores, isLoading, error } = useQuery<Score[]>({
    queryKey: ["/api/leaderboard", difficulty],
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="w-16 h-4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Failed to load leaderboard. Please try again.</p>
      </div>
    );
  }

  if (!scores || scores.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No scores yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scores.map((score, index) => {
        const rank = index + 1;
        const isTopThree = rank <= 3;
        const skinType = score.skinUsed as SkinType;

        return (
          <div
            key={score.id}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
              isTopThree
                ? rank === 1
                  ? "bg-yellow-500/10"
                  : rank === 2
                  ? "bg-gray-500/10"
                  : "bg-amber-500/10"
                : "bg-muted/30"
            }`}
            data-testid={`row-leaderboard-${index}`}
          >
            <RankBadge rank={rank} />
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate ${isTopThree ? "text-lg" : ""}`}>
                {score.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(score.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="w-10 h-10 flex-shrink-0">
              <PlayerSkin skin={skinType} className="w-full h-full" />
            </div>
            <div className="text-right">
              <p className={`font-mono font-bold ${isTopThree ? "text-2xl" : "text-lg"}`}>
                {score.score}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Leaderboard({ initialDifficulty = "normal" }: LeaderboardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/80 backdrop-blur-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={initialDifficulty}>
          <TabsList className="w-full flex overflow-x-auto mb-6">
            {difficulties.map((diff) => {
              const config = difficultyConfigs[diff];
              return (
                <TabsTrigger
                  key={diff}
                  value={diff}
                  className="flex-1 min-w-0"
                  style={{ 
                    "--tab-color": config.color 
                  } as React.CSSProperties}
                  data-testid={`tab-leaderboard-${diff}`}
                >
                  <span className="truncate">{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {difficulties.map((diff) => (
            <TabsContent key={diff} value={diff}>
              <LeaderboardTable difficulty={diff} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

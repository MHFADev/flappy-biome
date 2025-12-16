import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Play, Home, Volume2, VolumeX } from "lucide-react";

interface PauseModalProps {
  onResume: () => void;
  onHome: () => void;
}

export function PauseModal({ onResume, onHome }: PauseModalProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
      <Card className="w-full max-w-sm mx-4 bg-card/95 backdrop-blur-xl border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">Paused</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <Button
            onClick={onResume}
            className="w-full"
            size="lg"
            data-testid="button-resume"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
          <Button
            onClick={onHome}
            variant="outline"
            className="w-full"
            size="lg"
            data-testid="button-pause-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Main Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

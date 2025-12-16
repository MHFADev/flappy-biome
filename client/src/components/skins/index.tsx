import { SkinCute } from "./SkinCute";
import { SkinCyber } from "./SkinCyber";
import { SkinFantasy } from "./SkinFantasy";
import { SkinGlitch } from "./SkinGlitch";
import { SkinUFO } from "./SkinUFO";
import type { SkinType } from "@shared/schema";

export { SkinCute, SkinCyber, SkinFantasy, SkinGlitch, SkinUFO };

interface SkinComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

type SkinComponent = React.FC<SkinComponentProps>;

export const skinComponents: Record<SkinType, SkinComponent> = {
  cute: SkinCute,
  cyber: SkinCyber,
  fantasy: SkinFantasy,
  glitch: SkinGlitch,
  ufo: SkinUFO,
};

export const skinInfo: Record<SkinType, { name: string; theme: string; description: string }> = {
  cute: {
    name: "Hammy",
    theme: "Funny",
    description: "A round, kawaii hamster blob",
  },
  cyber: {
    name: "NeonDrone",
    theme: "Cool",
    description: "A sleek, neon-lit cyber drone",
  },
  fantasy: {
    name: "Drakon",
    theme: "Fantasy",
    description: "A mini dragon with wings",
  },
  glitch: {
    name: "C0rrupt3d",
    theme: "Masochist",
    description: "A pixelated, distorted entity",
  },
  ufo: {
    name: "Visitor",
    theme: "Sci-Fi",
    description: "A classic flying saucer",
  },
};

export function getSkinComponent(skinType: SkinType): SkinComponent {
  return skinComponents[skinType];
}

interface PlayerSkinProps {
  skin: SkinType;
  className?: string;
  style?: React.CSSProperties;
}

export function PlayerSkin({ skin, className, style }: PlayerSkinProps) {
  const SkinComponent = getSkinComponent(skin);
  return <SkinComponent className={className} style={style} />;
}

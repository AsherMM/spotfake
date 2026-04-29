export type GameMode = "solo" | "ranked" | "tournament";

export type NotifyMode = Exclude<GameMode, "solo">;

export type ModeCard = {
  id: GameMode;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  available: boolean;
  icon: string;
};

export const MODE_CARDS: ModeCard[] = [
  {
    id: "solo",
    title: "Solo",
    subtitle: "Pure streak mode",
    description:
      "Train your eye, sharpen your instincts, and push your best streak with no pressure except your own performance.",
    badge: "Live",
    available: true,
    icon: "🎯",
  },
  {
    id: "ranked",
    title: "1v1 Ranked",
    subtitle: "Competitive head-to-head",
    description:
      "Face real opponents in pressure-based duels where consistency, speed, and reading accuracy decide who climbs.",
    badge: "Soon",
    available: false,
    icon: "⚔️",
  },
  {
    id: "tournament",
    title: "Tournament",
    subtitle: "Bracket-based competition",
    description:
      "Enter structured events, survive round after round, and prove your perception under serious competitive stress.",
    badge: "Soon",
    available: false,
    icon: "🏆",
  },
];

export function getModeBadgeClasses(available: boolean) {
  return available
    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
    : "border-amber-500/25 bg-amber-500/10 text-amber-300";
}
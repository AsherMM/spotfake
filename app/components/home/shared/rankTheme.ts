// Returns visual theming (colors, badge, glow) for a leaderboard rank.
// Ranks 1/2/3 get gold/silver/bronze treatments; anything beyond is neutral.

export type RankTheme = {
  border: string;
  bg: string;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  scoreColor: string;
  numberColor: string;
  trophy: string;
  label: string;
  glow: string;
  accentHex: string;
};

export function getRankTheme(rank: number): RankTheme {
  if (rank === 1) {
    return {
      border: "border-yellow-400/40",
      bg: "bg-gradient-to-br from-yellow-400/12 via-amber-300/6 to-transparent",
      badgeBorder: "border-yellow-400/30",
      badgeBg: "bg-gradient-to-r from-yellow-500/20 to-amber-400/10",
      badgeText: "text-yellow-200",
      scoreColor: "text-yellow-300",
      numberColor: "text-yellow-400",
      trophy: "🏆",
      label: "Gold",
      glow: "shadow-[0_0_60px_rgba(250,204,21,0.10)]",
      accentHex: "#f59e0b",
    };
  }

  if (rank === 2) {
    return {
      border: "border-slate-300/25",
      bg: "bg-gradient-to-br from-slate-300/8 via-zinc-200/4 to-transparent",
      badgeBorder: "border-slate-300/25",
      badgeBg: "bg-gradient-to-r from-slate-300/15 to-zinc-300/5",
      badgeText: "text-slate-200",
      scoreColor: "text-slate-200",
      numberColor: "text-slate-300",
      trophy: "🥈",
      label: "Silver",
      glow: "shadow-[0_0_40px_rgba(203,213,225,0.06)]",
      accentHex: "#94a3b8",
    };
  }

  if (rank === 3) {
    return {
      border: "border-orange-500/25",
      bg: "bg-gradient-to-br from-orange-600/10 via-amber-500/5 to-transparent",
      badgeBorder: "border-orange-400/25",
      badgeBg: "bg-gradient-to-r from-orange-500/15 to-amber-500/8",
      badgeText: "text-orange-200",
      scoreColor: "text-orange-300",
      numberColor: "text-orange-400",
      trophy: "🥉",
      label: "Bronze",
      glow: "shadow-[0_0_40px_rgba(249,115,22,0.07)]",
      accentHex: "#f97316",
    };
  }

  return {
    border: "border-white/10",
    bg: "bg-white/[0.03]",
    badgeBorder: "border-white/10",
    badgeBg: "bg-white/5",
    badgeText: "text-zinc-400",
    scoreColor: "text-pink-300",
    numberColor: "text-zinc-500",
    trophy: "",
    label: `#${rank}`,
    glow: "",
    accentHex: "#ec4899",
  };
}
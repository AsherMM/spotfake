export type PlayerTier = {
  label: string;
  color: string;
  border: string;
  bg: string;
};

export function getPlayerTierLabel(powerScore: number): PlayerTier {
  if (powerScore >= 200) {
    return {
      label: "⚡ God Tier",
      color: "text-yellow-300",
      border: "border-yellow-400/25",
      bg: "bg-yellow-400/8",
    };
  }

  if (powerScore >= 100) {
    return {
      label: "💀 Legendary",
      color: "text-fuchsia-300",
      border: "border-fuchsia-500/25",
      bg: "bg-fuchsia-500/8",
    };
  }

  if (powerScore >= 50) {
    return {
      label: "🔥 Elite",
      color: "text-pink-300",
      border: "border-pink-500/25",
      bg: "bg-pink-500/8",
    };
  }

  if (powerScore >= 20) {
    return {
      label: "⚔️ Skilled",
      color: "text-blue-300",
      border: "border-blue-500/25",
      bg: "bg-blue-500/8",
    };
  }

  if (powerScore >= 5) {
    return {
      label: "📈 Rising",
      color: "text-emerald-300",
      border: "border-emerald-500/25",
      bg: "bg-emerald-500/8",
    };
  }

  return {
    label: "🌱 Newcomer",
    color: "text-zinc-400",
    border: "border-white/10",
    bg: "bg-white/5",
  };
}
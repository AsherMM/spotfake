// Design tokens — single source of truth.

export const RADIUS = {
  sm: "rounded-xl",        // 12px — small chips, kbd, tiny badges
  md: "rounded-2xl",       // 16px — cards, inputs, buttons
  lg: "rounded-3xl",       // 24px — major cards (top leaderboard entry)
  xl: "rounded-[2rem]",    // 32px — top-level containers
} as const;

export const SURFACE = {
  idle: "bg-white/[0.03]",
  hover: "hover:bg-white/[0.06]",
  active: "bg-white/[0.08]",
  sunken: "bg-black/30",
  deepSunken: "bg-black/40",
} as const;

export const BORDER = {
  subtle: "border-white/10",
  strong: "border-white/15",
  accent: "border-pink-500/25",
} as const;
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GamePreview from "@/app/components/game-preview";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const LEADERBOARD_URL = "/api/leaderboard?mode=global&limit=5";
const LEADERBOARD_REFRESH_INTERVAL_MS = 60_000;

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

type Player = {
  name: string;
  avatar: string | null;
  email?: string;
  provider?: string;
};

type PlayerStats = {
  bestScore: number;
  bestStreak: number;
  flawlessRuns: number;
  powerScore: number;
  totalGames: number;
};

type GameMode = "solo" | "ranked" | "tournament";

type LeaderboardApiEntry = {
  rank: number;
  powerScore: number;
  bestStreak: number;
  flawlessRuns: number;
  bestScore: number;
  player: {
    id: string;
    displayName: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    isGuest: boolean;
  };
};

type LeaderboardApiResponse =
  | LeaderboardApiEntry[]
  | {
      mode?: string;
      limit?: number;
      count?: number;
      items?: LeaderboardApiEntry[];
    };

type LeaderboardEntry = {
  rank: number;
  name: string;
  avatar: string | null;
  bestScore: number;
  bestStreak: number;
  flawlessRuns: number;
  powerScore: number;
  isGuest: boolean;
};

type GameOverSession = {
  streak: number;
  score: number;
  isNewRecord: boolean;
  flawless: boolean;
};

// ──────────────────────────────────────────────────────────────────────────────
// Static config
// ──────────────────────────────────────────────────────────────────────────────

const MODE_CARDS: {
  id: GameMode;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  available: boolean;
  icon: string;
}[] = [
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

const CONTROL_TIPS = [
  { label: "Swipe left", action: "REAL", key: "←", variant: "real" as const },
  { label: "Swipe right", action: "FAKE", key: "→", variant: "fake" as const },
  { label: "Arrow left", action: "REAL", key: "A", variant: "real" as const },
  { label: "Arrow right", action: "FAKE", key: "D", variant: "fake" as const },
  { label: "Enter", action: "Retry", key: "↵", variant: "neutral" as const },
];

const GAME_OVER_MESSAGES: Record<string, string[]> = {
  zero: [
    "Brutal. Zero streak.",
    "Walked straight into the wall.",
    "Even the best ones start somewhere.",
  ],
  low: [
    "Getting there. Not enough yet.",
    "Warming up. Push through.",
    "Focus slipped at the wrong moment.",
  ],
  mid: [
    "Solid run. You can go deeper.",
    "Good reads. Keep sharpening.",
    "Reflexes are locking in.",
  ],
  high: [
    "That's elite-level awareness.",
    "You're in the zone. Don't stop.",
    "Very few players reach this level.",
  ],
};

const GAME_OVER_PROMO: Record<string, string> = {
  zero: "Every mistake is data. Your instincts improve with every run — get back in and beat yourself.",
  low: "You're finding your rhythm. The gap between where you are and the top is smaller than it looks.",
  mid: "Real competitors don't stop at good. The next run is where records are broken.",
  high: "You're in rare company. The leaderboard is watching. Come back and prove it wasn't a fluke.",
};

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function getGameOverTier(streak: number): "zero" | "low" | "mid" | "high" {
  if (streak === 0) return "zero";
  if (streak < 5) return "low";
  if (streak < 10) return "mid";
  return "high";
}

function getModeBadgeClasses(available: boolean) {
  return available
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    : "border-amber-500/20 bg-amber-500/10 text-amber-300";
}

function getControlVariantClasses(variant: "real" | "fake" | "neutral") {
  if (variant === "real") {
    return "border-emerald-500/20 bg-emerald-500/8 text-emerald-300";
  }

  if (variant === "fake") {
    return "border-red-500/20 bg-red-500/8 text-red-300";
  }

  return "border-white/10 bg-white/5 text-zinc-400";
}

function getRankTheme(rank: number) {
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
      border: "border-slate-300/20",
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
    border: "border-white/8",
    bg: "bg-white/[0.025]",
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

function getPlayerTierLabel(powerScore: number) {
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
    color: "text-zinc-500",
    border: "border-white/10",
    bg: "bg-white/5",
  };
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function clampName(name: string, max = 18) {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)] ?? null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizeLeaderboard(payload: LeaderboardApiResponse): LeaderboardEntry[] {
  const raw = Array.isArray(payload) ? payload : payload.items ?? [];

  return raw
    .map((entry) => ({
      rank: entry.rank,
      name: entry.player.fullName?.trim() || entry.player.displayName || "Player",
      avatar: entry.player.avatarUrl ?? null,
      bestScore: entry.bestScore ?? 0,
      bestStreak: entry.bestStreak ?? 0,
      flawlessRuns: entry.flawlessRuns ?? 0,
      powerScore: entry.powerScore ?? 0,
      isGuest: entry.player.isGuest,
    }))
    .filter((entry) => entry.bestScore > 0 || entry.bestStreak > 0 || entry.powerScore > 0)
    .sort((a, b) => {
      if (b.powerScore !== a.powerScore) return b.powerScore - a.powerScore;
      if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      return b.flawlessRuns - a.flawlessRuns;
    })
    .slice(0, 5)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

// ──────────────────────────────────────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (target === prev.current) return;

    const from = prev.current;
    const startedAt = performance.now();
    let rafId = 0;

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        prev.current = target;
      }
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [target, duration]);

  return value;
}

// ──────────────────────────────────────────────────────────────────────────────
// Atoms
// ──────────────────────────────────────────────────────────────────────────────

function Avatar({
  src,
  alt,
  fallback,
  size = 44,
}: {
  src: string | null;
  alt: string;
  fallback: string;
  size?: number;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="shrink-0 overflow-hidden rounded-full border border-white/12 bg-black/60"
      style={{ width: size, height: size, minWidth: size }}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-black text-zinc-400"
          style={{ fontSize: size * 0.38 }}
        >
          {fallback}
        </div>
      )}
    </div>
  );
}

function PulseDot({ color = "bg-pink-400" }: { color?: string }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${color}`}
      style={{ animation: "pulseDot 2s ease-in-out infinite" }}
    />
  );
}

function PowerTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label="Power score formula"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-white/15 bg-white/8 text-[9px] font-black text-zinc-500 transition hover:border-pink-500/30 hover:text-pink-400"
      >
        ?
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2.5 w-52 -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-950/98 p-3.5 shadow-2xl backdrop-blur-xl">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400">
            Power Score
          </div>
          <p className="mt-1.5 text-xs leading-5 text-zinc-400">
            <span className="font-bold text-white">Best Streak × Flawless Runs</span>
            <br />
            Example: streak <span className="font-black text-white">8</span> × flawless{" "}
            <span className="font-black text-white">6</span> ={" "}
            <span className="font-black text-pink-300">48 pts</span>
          </p>
          <div className="absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-zinc-950" />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Leaderboard components
// ──────────────────────────────────────────────────────────────────────────────

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[72px] animate-pulse rounded-2xl border border-white/6 bg-white/[0.02]"
          style={{ animationDelay: `${index * 60}ms` }}
        />
      ))}
    </div>
  );
}

function LeaderboardTopCard({
  entry,
  index,
}: {
  entry: LeaderboardEntry;
  index: number;
}) {
  const theme = getRankTheme(entry.rank);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 ${theme.border} ${theme.bg} ${theme.glow}`}
      style={{
        animation: "lbIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        animationDelay: `${index * 70}ms`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.accentHex}55, transparent)`,
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${theme.badgeBorder} ${theme.badgeText}`}
          style={{ background: theme.badgeBg }}
        >
          <span className="text-sm leading-none">{theme.trophy}</span>
          <span>{theme.label}</span>
        </div>

        {entry.isGuest && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Guest
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-black/40 text-2xl font-black ${theme.border} ${theme.numberColor}`}
        >
          1
        </div>

        <Avatar
          src={entry.avatar}
          alt={entry.name}
          fallback={getInitial(entry.name)}
          size={54}
        />

        <div className="min-w-0">
          <div className="truncate text-xl font-black text-white" title={entry.name}>
            {clampName(entry.name, 22)}
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            Streak {entry.bestStreak} · Flawless {entry.flawlessRuns}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Best Score", value: entry.bestScore, color: "text-white", tip: false },
          { label: "Best Streak", value: entry.bestStreak, color: "text-white", tip: false },
          { label: "Power Score", value: entry.powerScore, color: theme.scoreColor, tip: true },
        ].map(({ label, value, color, tip }) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-black/30 p-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                {label}
              </span>
              {tip && <PowerTooltip />}
            </div>
            <div className={`mt-2 text-2xl font-black ${color}`}>
              {value > 0 ? value : <span className="text-zinc-700">—</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardRow({
  entry,
  index,
}: {
  entry: LeaderboardEntry;
  index: number;
}) {
  const theme = getRankTheme(entry.rank);

  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:border-white/14 hover:bg-white/[0.035] ${theme.border} ${theme.bg}`}
      style={{
        animation: "lbIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        animationDelay: `${index * 70}ms`,
      }}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-black/40 text-sm font-black ${theme.numberColor}`}
      >
        {entry.rank}
      </div>

      <Avatar
        src={entry.avatar}
        alt={entry.name}
        fallback={getInitial(entry.name)}
        size={40}
      />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-white" title={entry.name}>
          {clampName(entry.name, 20)}
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          Streak {entry.bestStreak} · Flawless {entry.flawlessRuns}
          {entry.isGuest ? " · Guest" : ""}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {[
          { label: "Score", value: entry.bestScore, color: "text-white", tip: false },
          { label: "Streak", value: entry.bestStreak, color: "text-white", tip: false },
          { label: "Power", value: entry.powerScore, color: theme.scoreColor, tip: true },
        ].map(({ label, value, color, tip }) => (
          <div
            key={label}
            className="w-14 rounded-xl border border-white/8 bg-black/30 px-2 py-2 text-center"
          >
            <div className="flex items-center justify-center gap-0.5">
              <span className="text-[9px] uppercase tracking-widest text-zinc-600">
                {label}
              </span>
              {tip && <PowerTooltip />}
            </div>
            <div className={`mt-0.5 text-sm font-black ${color}`}>
              {value > 0 ? value : <span className="text-zinc-700">—</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Player stats card
// ──────────────────────────────────────────────────────────────────────────────

function PlayerStatsCard({ stats }: { stats: PlayerStats }) {
  const tier = getPlayerTierLabel(stats.powerScore);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
      <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-600">
          Your stats
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] ${tier.color} ${tier.border} ${tier.bg}`}
        >
          {tier.label}
        </span>
      </div>

      <div className="grid grid-cols-4 divide-x divide-white/6">
        {[
          { label: "Power", value: stats.powerScore, color: "text-pink-300" },
          { label: "Streak", value: stats.bestStreak, color: "text-white" },
          { label: "Score", value: stats.bestScore, color: "text-white" },
          { label: "Flawless", value: stats.flawlessRuns, color: "text-emerald-300" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 text-center">
            <div className="text-[9px] uppercase tracking-widest text-zinc-600">
              {label}
            </div>
            <div className={`mt-1.5 text-lg font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Notify banner
// ──────────────────────────────────────────────────────────────────────────────

function NotifyBanner({ mode }: { mode: "ranked" | "tournament" }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const label = mode === "ranked" ? "1v1 Ranked" : "Tournament";

  function submit() {
    const trimmed = email.trim();

    if (!trimmed) {
      setError("Enter your email.");
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError("Enter a valid email.");
      return;
    }

    setError("");
    setSent(true);
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/8 bg-black/25 p-4">
      {sent ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
          <span>✓</span>
          <span>You&apos;ll be notified when {label} launches.</span>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-zinc-500">
            Get notified when <span className="font-semibold text-white">{label}</span> goes live.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              placeholder="your@email.com"
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              className="flex-1 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/20"
            />
            <button
              type="button"
              onClick={submit}
              className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2 text-sm font-black text-white transition hover:scale-[1.03] active:scale-95"
            >
              Notify me
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Confetti
// ──────────────────────────────────────────────────────────────────────────────

type ConfettiParticle = {
  id: number;
  color: string;
  left: number;
  delay: number;
  duration: number;
  width: number;
  rotation: number;
};

const CONFETTI_COLORS = [
  "#ec4899",
  "#f59e0b",
  "#8b5cf6",
  "#10b981",
  "#3b82f6",
  "#f97316",
] as const;

const CONFETTI_COUNT = 52;

function createConfettiParticles(): ConfettiParticle[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, index) => ({
    id: index,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.4,
    duration: 1.8 + Math.random() * 1.6,
    width: 7 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

function Confetti() {
  const [particles] = useState<ConfettiParticle[]>(() =>
    createConfettiParticles()
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 rounded-sm opacity-90"
          style={{
            left: `${particle.left}%`,
            width: particle.width,
            height: particle.width * 0.4,
            background: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confettiFall ${particle.duration}s ease-in ${particle.delay}s both`,
          }}
        />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Game Over Modal
// ──────────────────────────────────────────────────────────────────────────────

function GameOverModal({
  session,
  onRetry,
  onClose,
  playerName,
}: {
  session: GameOverSession;
  onRetry: () => void;
  onClose: () => void;
  playerName: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(timer);
  }, []);

  const tier = getGameOverTier(session.streak);
  const [message] = useState(() => pickRandom(GAME_OVER_MESSAGES[tier]) ?? "Run ended.");
  const promo = GAME_OVER_PROMO[tier];

  return (
    <>
      {session.isNewRecord && <Confetti />}

      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Game Over"
        className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg overflow-hidden rounded-t-[2.5rem] border border-white/10 bg-zinc-950/98 shadow-2xl backdrop-blur-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:rounded-[2.5rem]"
        style={{
          transform: visible
            ? "translate(-50%, -50%)"
            : "translate(-50%, calc(-50% + 32px))",
          opacity: visible ? 1 : 0,
          transition:
            "transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease",
        }}
      >
        <div className="mx-auto mt-4 h-1 w-10 rounded-full bg-white/12 sm:hidden" />

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                Run ended
              </div>
              <h2 className="mt-1 text-3xl font-black text-white">Game Over</h2>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-500 transition hover:border-white/20 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.025] px-5 py-4">
            <p className="text-lg font-bold text-white">{message}</p>
            {playerName && <p className="mt-0.5 text-sm text-zinc-600">{playerName}</p>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Streak
              </div>
              <div className="mt-2 text-5xl font-black text-white">{session.streak}</div>
              {session.isNewRecord && (
                <div className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-400">
                  ✨ New record!
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Score
              </div>
              <div className="mt-2 text-5xl font-black text-pink-300">{session.score}</div>
              {session.flawless && (
                <div className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
                  ⚡ Flawless run!
                </div>
              )}
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-2xl border border-pink-500/18 bg-gradient-to-br from-pink-500/8 via-fuchsia-500/4 to-transparent p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.10),transparent_55%)]" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <PulseDot color="bg-pink-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-pink-400">
                  Spotfake · Solo Mode
                </span>
              </div>
              <p className="mt-2.5 text-sm font-medium leading-6 text-zinc-300">
                {promo}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-600">
                <span>Unlimited streak</span>
                <span>·</span>
                <span>Live leaderboard</span>
                <span>·</span>
                <span>Ranked coming soon</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/[0.04] py-4 text-sm font-semibold text-white transition hover:bg-white/8 active:scale-[0.98]"
            >
              Keep browsing
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 py-4 text-sm font-black text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              🎯 Play again
            </button>
          </div>

          <Link
            href="/leaderboard"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-400/15 bg-yellow-400/5 py-3.5 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-400/8"
          >
            <span>🏆</span>
            <span>View full leaderboard</span>
          </Link>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Sticky mobile CTA
// ──────────────────────────────────────────────────────────────────────────────

function StickyPlayCTA({ available }: { available: boolean }) {
  if (!available) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-black/90 p-4 backdrop-blur-xl sm:hidden">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 py-4 text-base font-black text-white shadow-2xl shadow-pink-500/25 transition active:scale-[0.98]"
      >
        🎯 Play now — Solo
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────────

export default function GamePage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const leaderboardRequestIdRef = useRef(0);

  const [player, setPlayer] = useState<Player | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [selectedMode, setSelectedMode] = useState<GameMode>("solo");
  const [gameKey, setGameKey] = useState(0);
  const [gameOverSession, setGameOverSession] = useState<GameOverSession | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!alive) return;

        if (!user) {
          setPlayer(null);
          return;
        }

        const meta = user.user_metadata ?? {};

        const name =
          meta.full_name ||
          meta.name ||
          meta.display_name ||
          user.email?.split("@")[0] ||
          "Player";

        const avatar = meta.avatar_url || meta.picture || meta.image || null;

        const provider =
          Array.isArray(user.identities) && user.identities[0]
            ? user.identities[0].provider
            : "auth";

        setPlayer({
          name,
          avatar,
          email: user.email ?? undefined,
          provider,
        });

        try {
          const statsResponse = await fetch("/api/me/stats", {
            cache: "no-store",
          });

          if (statsResponse.ok && alive) {
            const stats: PlayerStats = await statsResponse.json();
            setPlayerStats(stats);
          }
        } catch {
          // optional endpoint
        }
      } catch (error) {
        console.error("[user]", error);
      } finally {
        if (alive) {
          setLoadingUser(false);
        }
      }
    }

    void run();

    return () => {
      alive = false;
    };
  }, [supabase]);

  const refreshLeaderboard = useCallback(async (background = false) => {
    const requestId = ++leaderboardRequestIdRef.current;

    if (background) {
      setRefreshing(true);
    } else {
      setLoadingLeaderboard(true);
    }

    try {
      const response = await fetch(LEADERBOARD_URL, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload: LeaderboardApiResponse = await response.json();

      if (requestId !== leaderboardRequestIdRef.current) return;

      setLeaderboard(normalizeLeaderboard(payload));
      setLeaderboardError(null);
      setLastRefreshed(new Date());
    } catch (error) {
      if (requestId !== leaderboardRequestIdRef.current) return;
      console.error("[leaderboard]", error);
      setLeaderboardError("Could not load the leaderboard. Please try again.");
    } finally {
      if (requestId !== leaderboardRequestIdRef.current) return;
      setLoadingLeaderboard(false);
      setRefreshing(false);
    }
  }, []);

    useEffect(() => {
        let cancelled = false;
        const requestId = ++leaderboardRequestIdRef.current;

     async function bootstrapLeaderboard() {
      try {
        const response = await fetch(LEADERBOARD_URL, {
        cache: "no-store",
       });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload: LeaderboardApiResponse = await response.json();

      if (cancelled || requestId !== leaderboardRequestIdRef.current) return;

      setLeaderboard(normalizeLeaderboard(payload));
      setLeaderboardError(null);
      setLastRefreshed(new Date());
    } catch (error) {
      if (cancelled || requestId !== leaderboardRequestIdRef.current) return;
      console.error("[leaderboard bootstrap]", error);
      setLeaderboardError("Could not load the leaderboard. Please try again.");
    } finally {
      if (cancelled || requestId !== leaderboardRequestIdRef.current) return;
      setLoadingLeaderboard(false);
      setRefreshing(false);
    }
  }

  void bootstrapLeaderboard();

  return () => {
    cancelled = true;
  };
}, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      void refreshLeaderboard(true);
    }, LEADERBOARD_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [refreshLeaderboard]);

  const currentMode = useMemo(
    () => MODE_CARDS.find((mode) => mode.id === selectedMode) ?? MODE_CARDS[0],
    [selectedMode]
  );

  const topEntry = useMemo(() => leaderboard[0] ?? null, [leaderboard]);
  const restEntries = useMemo(() => leaderboard.slice(1), [leaderboard]);

  const animatedCount = useCountUp(leaderboard.length);
  const animatedTopPower = useCountUp(leaderboard[0]?.powerScore ?? 0);

  function handleGameOver(session: GameOverSession) {
    setGameOverSession(session);

    if (session.score > 0 || session.isNewRecord) {
      void refreshLeaderboard(true);
    }
  }

  function handleRetry() {
    setGameOverSession(null);
    setGameKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <style>{`
        @keyframes lbIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }

        @keyframes confettiFall {
          0% { transform: translateY(-16px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(700deg); opacity: 0; }
        }
      `}</style>

      <div className="min-h-screen overflow-x-hidden bg-black pb-24 text-white sm:pb-0">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.13),transparent_22%),radial-gradient(circle_at_80%_15%,rgba(168,85,247,0.09),transparent_20%)]" />
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.88))]" />

        <header className="relative z-30 border-b border-white/[0.055] bg-black/62 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 text-lg font-black shadow-lg shadow-pink-500/20 transition group-hover:scale-105 group-hover:shadow-pink-500/35">
                🔥
              </div>
              <div>
                <div className="text-lg font-black tracking-tight">Spotfake</div>
                <div className="text-xs text-zinc-600">Real or AI — can you tell?</div>
              </div>
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/18 bg-yellow-400/7 px-4 py-2 text-sm font-bold text-yellow-300 transition hover:border-yellow-300/28 hover:bg-yellow-400/11"
              >
                <span>🏆</span>
                <span className="hidden sm:inline">Leaderboard</span>
              </Link>

              {loadingUser ? (
                <div className="h-10 w-32 animate-pulse rounded-full bg-white/8" />
              ) : player ? (
                <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">
                  <Avatar
                    src={player.avatar}
                    alt="Your avatar"
                    fallback={getInitial(player.name)}
                    size={36}
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-white">
                      {clampName(player.name, 14)}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                      {player.provider || "connected"}
                    </span>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-pink-500/18 transition hover:scale-[1.02]"
                >
                  Sign in
                </Link>
              )}

              <Link
                href="/"
                className="hidden rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-semibold text-white transition hover:border-white/18 hover:bg-white/7 sm:inline-flex"
              >
                Back
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <section className="grid gap-6 xl:grid-cols-[1.02fr_1.38fr]">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-pink-500/18 bg-pink-500/7 px-4 py-2 text-sm text-pink-300">
                  <PulseDot />
                  Competitive perception · streak pressure · fast reads
                </div>

                <div>
                  <h1 className="text-4xl font-black leading-[0.96] tracking-tight sm:text-5xl xl:text-6xl">
                    Choose your mode.
                    <br />
                    <span className="bg-gradient-to-r from-pink-500 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                      Build your streak.
                    </span>
                    <br />
                    Own the board.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                    Spotfake turns perception into competition. Read the image,
                    commit fast, and transform raw accuracy into ranking power
                    built on streak and flawless runs.
                  </p>
                </div>

                {player && (
                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.032] p-5">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={player.avatar}
                        alt="Your avatar"
                        fallback={getInitial(player.name)}
                        size={52}
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-600">
                          Player profile
                        </div>
                        <div className="mt-0.5 truncate text-xl font-black text-white">
                          {player.name}
                        </div>
                        {player.email && (
                          <div className="truncate text-sm text-zinc-600">
                            {player.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { label: "Status", value: "Online" },
                        { label: "Focus", value: "Precision" },
                        { label: "Active mode", value: currentMode.title },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/8 bg-black/30 p-3 text-center"
                        >
                          <div className="text-[9px] uppercase tracking-widest text-zinc-600">
                            {label}
                          </div>
                          <div className="mt-1.5 text-sm font-black text-white">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {playerStats && <PlayerStatsCard stats={playerStats} />}
                  </div>
                )}

                <div>
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-600">
                    Game modes
                  </div>
                  <div className="grid gap-3">
                    {MODE_CARDS.map((mode) => {
                      const active = selectedMode === mode.id;

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setSelectedMode(mode.id)}
                          className={`rounded-[1.75rem] border p-5 text-left transition-all duration-250 ${
                            active
                              ? "border-pink-500/32 bg-gradient-to-br from-pink-500/7 to-fuchsia-500/3 shadow-lg shadow-pink-500/7"
                              : "border-white/8 bg-white/[0.022] hover:border-white/14 hover:bg-white/[0.038]"
                          }`}
                          style={active ? { transform: "scale(1.006)" } : undefined}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-xl">
                                {mode.icon}
                              </div>
                              <div>
                                <div className="text-lg font-black text-white">
                                  {mode.title}
                                </div>
                                <div className="mt-0.5 text-sm text-zinc-500">
                                  {mode.subtitle}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${getModeBadgeClasses(
                                mode.available
                              )}`}
                            >
                              {mode.badge}
                            </div>
                          </div>

                          <p className="mt-3.5 text-sm leading-7 text-zinc-400">
                            {mode.description}
                          </p>

                          {active && !mode.available && (
                            <NotifyBanner mode={mode.id as "ranked" | "tournament"} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2.25rem] border border-white/10 bg-white/[0.032] p-3 backdrop-blur-xl sm:p-4">
                  <div className="mb-4 flex items-center justify-between gap-3 px-2 pt-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                        Active mode
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">
                        {currentMode.title}
                      </div>
                    </div>
                    <div
                      className={`rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${getModeBadgeClasses(
                        currentMode.available
                      )}`}
                    >
                      {currentMode.badge}
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/8 bg-black/40 p-2 sm:p-3">
                    {selectedMode === "solo" ? (
                      <GamePreview
                        key={gameKey}
                        mode="solo"
                        onGameOver={handleGameOver}
                      />
                    ) : (
                      <div className="flex flex-col items-center rounded-[1.5rem] border border-white/8 bg-zinc-950/80 px-8 py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-3xl">
                          {selectedMode === "ranked" ? "⚔️" : "🏆"}
                        </div>
                        <h3 className="mt-5 text-2xl font-black text-white">
                          {selectedMode === "ranked"
                            ? "1v1 Ranked is coming"
                            : "Tournament is coming"}
                        </h3>
                        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-zinc-500">
                          The UI is ready. This mode will connect to matchmaking,
                          server-side scoring, and bracket progression once the
                          competition backend is live.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-zinc-400">
                          <PulseDot color="bg-emerald-400" />
                          Solo mode is fully playable now
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_0.88fr]">
                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.032] p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                          Ranking system
                        </div>
                        <h2 className="mt-2 text-2xl font-black text-white">
                          Streak Power Board
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                          Only players with real runs appear here.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href="/leaderboard"
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 transition hover:border-white/18 hover:bg-white/7 hover:text-white"
                        >
                          View all
                        </Link>
                        <button
                          type="button"
                          title="Refresh leaderboard"
                          onClick={() => void refreshLeaderboard(true)}
                          disabled={loadingLeaderboard || refreshing}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-sm text-zinc-400 transition hover:border-white/18 hover:bg-white/7 hover:text-white disabled:opacity-30"
                        >
                          {refreshing ? <span className="animate-spin">↻</span> : "↻"}
                        </button>
                      </div>
                    </div>

                    {lastRefreshed && (
                      <p className="mt-1.5 text-[10px] text-zinc-700">
                        Updated{" "}
                        {lastRefreshed.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" · "}auto-refreshes every 60s
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/8 bg-black/22 px-4 py-3">
                      <span className="text-lg">⚡</span>
                      <p className="flex-1 text-xs leading-6 text-zinc-500">
                        Streak <span className="font-black text-white">8</span> × Flawless{" "}
                        <span className="font-black text-white">6</span> = Power{" "}
                        <span className="font-black text-pink-300">48</span>
                      </p>
                      <PowerTooltip />
                    </div>

                    <div className="mt-5">
                      {loadingLeaderboard ? (
                        <LeaderboardSkeleton />
                      ) : leaderboardError ? (
                        <div className="rounded-2xl border border-red-500/14 bg-red-500/7 p-4 text-sm text-red-400">
                          {leaderboardError}
                        </div>
                      ) : leaderboard.length === 0 ? (
                        <div className="rounded-2xl border border-white/8 bg-black/18 p-5 text-sm text-zinc-600">
                          No entries yet. Play a few rounds and this board will come alive.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {topEntry && <LeaderboardTopCard entry={topEntry} index={0} />}
                          {restEntries.map((entry, index) => (
                            <LeaderboardRow key={entry.rank} entry={entry} index={index + 1} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.032] p-6">
                      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                        Controls
                      </div>
                      <h3 className="mt-2 text-xl font-black text-white">
                        Built for fast comfort
                      </h3>

                      <div className="mt-4 space-y-2">
                        {CONTROL_TIPS.map((tip) => (
                          <div
                            key={tip.label}
                            className="flex items-center justify-between rounded-xl border border-white/8 bg-black/22 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <kbd className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-black text-zinc-300">
                                {tip.key}
                              </kbd>
                              <span className="text-sm text-zinc-400">{tip.label}</span>
                            </div>

                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] ${getControlVariantClasses(
                                tip.variant
                              )}`}
                            >
                              {tip.action}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.032] p-6">
                      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                        Live metrics
                      </div>
                      <h3 className="mt-2 text-xl font-black text-white">
                        Real competitive structure
                      </h3>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
                          <div className="text-[9px] uppercase tracking-widest text-zinc-600">
                            Ranked players
                          </div>
                          <div className="mt-2 text-2xl font-black text-white">
                            {animatedCount}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
                          <div className="text-[9px] uppercase tracking-widest text-zinc-600">
                            Top power
                          </div>
                          <div className="mt-2 text-2xl font-black text-pink-300">
                            {animatedTopPower}
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-zinc-500">
                        Ranked 1v1, bracket tournaments, persistent stats, and daily
                        challenge seeds will grow naturally on top of this backend.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="rounded-[2.25rem] border border-white/8 bg-gradient-to-r from-pink-500/7 via-transparent to-purple-500/7 p-px">
                <div className="rounded-[2.2rem] bg-black/72 px-6 py-8 backdrop-blur-2xl sm:px-8 sm:py-10">
                  <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                        Ready for competitive scale
                      </div>
                      <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                        Structured like a real game hub.
                      </h2>
                      <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
                        Modes, identity, leaderboard, controls, and live ranking data all
                        in one place. The next layer is matchmaking, ranked profiles,
                        and tournament logic.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <Link
                        href="/leaderboard"
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/18 hover:bg-white/7"
                      >
                        Full leaderboard
                      </Link>

                      <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-pink-500/18 transition hover:scale-[1.02]"
                      >
                        <span>🎯</span>
                        <span>Back to top</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <StickyPlayCTA available={currentMode.available} />
      </div>

      {gameOverSession && (
        <GameOverModal
          session={gameOverSession}
          onRetry={handleRetry}
          onClose={() => setGameOverSession(null)}
          playerName={player?.name ?? ""}
        />
      )}
    </>
  );
}
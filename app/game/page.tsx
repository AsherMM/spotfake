"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import GamePreview from "@/app/components/game-preview";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";

type Player = {
  name: string;
  avatar: string | null;
  email?: string;
  provider?: string;
};

type GameMode = "solo" | "ranked" | "tournament";

type LeaderboardApiEntry = {
  rank: number;
  powerScore: number;
  bestStreak: number;
  flawlessRuns: number;
  bestScore: number;
  bestSoloScore?: number;
  bestRankedScore?: number;
  bestTournamentScore?: number;
  totalGames?: number;
  totalWins?: number;
  totalLosses?: number;
  averageScore?: number;
  updatedAt?: string;
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

type LeaderboardCardEntry = {
  rank: number;
  name: string;
  avatar: string | null;
  bestScore: number;
  bestStreak: number;
  flawlessRuns: number;
  powerScore: number;
  isGuest: boolean;
};

const modeCards: {
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

const controlTips = [
  "Swipe left for REAL",
  "Swipe right for FAKE",
  "Arrow left = REAL",
  "Arrow right = FAKE",
  "Enter = instant retry",
];

function getModeBadgeClasses(available: boolean) {
  return available
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    : "border-amber-500/20 bg-amber-500/10 text-amber-300";
}

function getRankTheme(rank: number) {
  if (rank === 1) {
    return {
      border: "border-yellow-400/35",
      bg: "bg-gradient-to-br from-yellow-400/18 via-amber-300/8 to-transparent",
      badge: "border-yellow-300/40 bg-yellow-400/15 text-yellow-100",
      score: "text-yellow-300",
      iconWrap:
        "bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-600 text-black shadow-[0_0_30px_rgba(250,204,21,0.25)]",
      label: "Gold",
      trophy: "🏆",
    };
  }

  if (rank === 2) {
    return {
      border: "border-zinc-300/25",
      bg: "bg-gradient-to-br from-zinc-300/12 via-zinc-200/6 to-transparent",
      badge: "border-zinc-300/30 bg-zinc-200/10 text-zinc-100",
      score: "text-zinc-100",
      iconWrap:
        "bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-500 text-black shadow-[0_0_24px_rgba(228,228,231,0.18)]",
      label: "Silver",
      trophy: "🥈",
    };
  }

  return {
    border: "border-orange-500/25",
    bg: "bg-gradient-to-br from-orange-500/14 via-amber-500/8 to-transparent",
    badge: "border-orange-400/25 bg-orange-500/10 text-orange-200",
    score: "text-orange-300",
    iconWrap:
      "bg-gradient-to-br from-orange-400 via-orange-500 to-amber-800 text-white shadow-[0_0_24px_rgba(249,115,22,0.2)]",
    label: "Bronze",
    trophy: "🥉",
  };
}

function getPlayerInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "P";
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function shouldKeepLeaderboardEntry(entry: LeaderboardCardEntry) {
  return (
    entry.bestScore > 0 ||
    entry.bestStreak > 0 ||
    entry.flawlessRuns > 0 ||
    entry.powerScore > 0
  );
}

function normalizeLeaderboardResponse(
  payload: LeaderboardApiResponse
): LeaderboardCardEntry[] {
  const rawItems = Array.isArray(payload) ? payload : payload.items ?? [];

  const normalized = rawItems.map((entry) => ({
    rank: entry.rank,
    name:
      (entry.player.fullName && entry.player.fullName.trim()) ||
      entry.player.displayName ||
      "Player",
    avatar: entry.player.avatarUrl || null,
    bestScore: entry.bestScore ?? 0,
    bestStreak: entry.bestStreak ?? 0,
    flawlessRuns: entry.flawlessRuns ?? 0,
    powerScore: entry.powerScore ?? 0,
    isGuest: entry.player.isGuest,
  }));

  return normalized
    .filter(shouldKeepLeaderboardEntry)
    .sort((a, b) => {
      if (b.powerScore !== a.powerScore) return b.powerScore - a.powerScore;
      if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      return b.flawlessRuns - a.flawlessRuns;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-2xl border border-white/10 bg-black/25"
        />
      ))}
    </div>
  );
}

function Avatar({
  src,
  alt,
  fallback,
  sizeClassName,
}: {
  src: string | null;
  alt: string;
  fallback: string;
  sizeClassName: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-full border border-white/10 bg-black ${sizeClassName}`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-bold text-zinc-400">
          {fallback}
        </div>
      )}
    </div>
  );
}

function TopLeaderboardCard({ entry }: { entry: LeaderboardCardEntry }) {
  const theme = getRankTheme(entry.rank);

  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border p-5 ${theme.border} ${theme.bg}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${theme.badge}`}
          >
            <span>{theme.trophy}</span>
            <span>
              #{entry.rank} {theme.label}
            </span>
          </div>

          {entry.isGuest && (
            <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
              Guest
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 text-xl font-black ${theme.iconWrap}`}
          >
            {entry.rank}
          </div>

          <Avatar
            src={entry.avatar}
            alt={entry.name}
            fallback={getPlayerInitial(entry.name)}
            sizeClassName="h-14 w-14 shrink-0"
          />

          <div className="min-w-0">
            <div className="truncate text-lg font-black text-white">
              {entry.name}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
              Best {entry.bestStreak} · Flawless {entry.flawlessRuns}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Best
            </div>
            <div className="mt-1 text-lg font-black text-white">
              {entry.bestScore}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Streak
            </div>
            <div className="mt-1 text-lg font-black text-white">
              {entry.bestStreak}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Power
            </div>
            <div className={`mt-1 text-lg font-black ${theme.score}`}>
              {entry.powerScore}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardCardEntry }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-white/5 font-black text-white shadow-inner">
          #{entry.rank}
        </div>

        <Avatar
          src={entry.avatar}
          alt={entry.name}
          fallback={getPlayerInitial(entry.name)}
          sizeClassName="h-10 w-10 shrink-0"
        />

        <div className="min-w-0">
          <div className="truncate font-bold text-white">{entry.name}</div>
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Best {entry.bestStreak} · Flawless {entry.flawlessRuns}
            {entry.isGuest ? " · Guest" : ""}
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-6 text-right sm:grid-cols-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Best
          </div>
          <div className="mt-1 text-base font-black text-white">
            {entry.bestScore}
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Streak
          </div>
          <div className="mt-1 text-base font-black text-white">
            {entry.bestStreak}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Power
          </div>
          <div className="mt-1 text-lg font-black text-pink-300">
            {entry.powerScore}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [player, setPlayer] = useState<Player | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [selectedMode, setSelectedMode] = useState<GameMode>("solo");

  const [leaderboard, setLeaderboard] = useState<LeaderboardCardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [refreshingLeaderboard, setRefreshingLeaderboard] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (!user) {
          setPlayer(null);
          return;
        }

        const meta = user.user_metadata || {};

        const name =
          meta.full_name ||
          meta.name ||
          meta.display_name ||
          user.email?.split("@")[0] ||
          "Player";

        const avatar = meta.avatar_url || meta.picture || meta.image || null;

        const provider =
          Array.isArray(user.identities) && user.identities.length > 0
            ? user.identities[0]?.provider ?? "auth"
            : "auth";

        setPlayer({
          name,
          avatar,
          email: user.email || undefined,
          provider,
        });
      } catch (error) {
        console.error("load user error:", error);
        if (active) {
          setPlayer(null);
        }
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [supabase]);

  const loadLeaderboard = useCallback(async (options?: { background?: boolean }) => {
    const background = options?.background ?? false;

    try {
      if (background) {
        setRefreshingLeaderboard(true);
      } else {
        setLoadingLeaderboard(true);
      }

      const response = await fetch("/api/leaderboard?mode=global&limit=10", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load leaderboard.");
      }

      const data: LeaderboardApiResponse = await response.json();
      const normalized = normalizeLeaderboardResponse(data);

      setLeaderboard(normalized);
      setLeaderboardError(null);
    } catch (error) {
      console.error("leaderboard load error:", error);
      setLeaderboardError("Unable to load the leaderboard right now.");
    } finally {
      setLoadingLeaderboard(false);
      setRefreshingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrapLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard?mode=global&limit=10", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load leaderboard.");
        }

        const data: LeaderboardApiResponse = await response.json();
        const normalized = normalizeLeaderboardResponse(data);

        if (!active) return;

        setLeaderboard(normalized);
        setLeaderboardError(null);
      } catch (error) {
        console.error("leaderboard bootstrap error:", error);
        if (active) {
          setLeaderboardError("Unable to load the leaderboard right now.");
        }
      } finally {
        if (active) {
          setLoadingLeaderboard(false);
          setRefreshingLeaderboard(false);
        }
      }
    }

    void bootstrapLeaderboard();

    return () => {
      active = false;
    };
  }, []);

  const currentMode = useMemo(
    () => modeCards.find((mode) => mode.id === selectedMode) ?? modeCards[0],
    [selectedMode]
  );

  const topEntries = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const remainingLeaderboard = useMemo(
    () => leaderboard.slice(3, 10),
    [leaderboard]
  );

  const leaderboardCount = leaderboard.length;
  const topPower = leaderboard[0]?.powerScore ?? 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.14),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.12),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.04),transparent_28%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.42)_52%,rgba(0,0,0,0.82))]" />

      <header className="relative z-30 border-b border-white/5 bg-black/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-500 text-lg font-black shadow-lg shadow-pink-500/20 transition group-hover:scale-105">
              🔥
            </div>

            <div>
              <div className="text-lg font-black tracking-tight">Spotfake</div>
              <div className="text-xs text-zinc-500">
                Real or AI image challenge
              </div>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-200 transition hover:border-yellow-300/30 hover:bg-yellow-400/15"
            >
              Full leaderboard
            </Link>

            {loadingUser ? (
              <div className="h-10 w-36 animate-pulse rounded-full bg-white/10" />
            ) : player ? (
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">
                <Avatar
                  src={player.avatar}
                  alt="Player avatar"
                  fallback={getPlayerInitial(player.name)}
                  sizeClassName="h-10 w-10"
                />

                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold text-white">
                    {player.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {player.provider || "Connected"}
                  </span>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signup"
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.02]"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/"
              className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 sm:inline-flex"
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
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-sm text-pink-200">
                <span className="h-2 w-2 rounded-full bg-pink-400" />
                Competitive perception game · streak pressure · fast reads
              </div>

              <div>
                <h1 className="text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl xl:text-6xl">
                  Choose your mode.
                  <br />
                  <span className="bg-gradient-to-r from-pink-500 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                    Build your streak.
                  </span>
                  <br />
                  Own the board.
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                  Spotfake turns perception into competition. Read the image,
                  commit fast, and transform raw accuracy into ranking power
                  built on both best streak and repeat flawless runs.
                </p>
              </div>

              {player && (
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 flex items-center gap-4">
                    <Avatar
                      src={player.avatar}
                      alt="Player avatar"
                      fallback={getPlayerInitial(player.name)}
                      sizeClassName="h-14 w-14"
                    />

                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                        Player profile
                      </div>
                      <div className="mt-1 text-xl font-black text-white">
                        {player.name}
                      </div>
                      {player.email && (
                        <div className="text-sm text-zinc-500">
                          {player.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Status
                      </div>
                      <div className="mt-2 text-lg font-black text-white">
                        Online
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Focus
                      </div>
                      <div className="mt-2 text-lg font-black text-white">
                        Precision
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Active mode
                      </div>
                      <div className="mt-2 text-lg font-black text-white">
                        {currentMode.title}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Modes
                </div>

                <div className="grid gap-4">
                  {modeCards.map((mode) => {
                    const selected = selectedMode === mode.id;

                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSelectedMode(mode.id)}
                        className={`rounded-[2rem] border p-5 text-left transition-all duration-300 ${
                          selected
                            ? "border-pink-500/40 bg-pink-500/10 shadow-lg shadow-pink-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-2xl">
                              {mode.icon}
                            </div>

                            <div>
                              <div className="text-2xl font-black">
                                {mode.title}
                              </div>
                              <div className="mt-1 text-sm font-semibold text-zinc-400">
                                {mode.subtitle}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${getModeBadgeClasses(
                              mode.available
                            )}`}
                          >
                            {mode.badge}
                          </div>
                        </div>

                        <p className="mt-4 leading-7 text-zinc-300">
                          {mode.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2.25rem] border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl sm:p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2 pt-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                      Active mode
                    </div>
                    <div className="mt-1 text-2xl font-black text-white">
                      {currentMode.title}
                    </div>
                  </div>

                  <div
                    className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${getModeBadgeClasses(
                      currentMode.available
                    )}`}
                  >
                    {currentMode.badge}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-black/35 p-2 sm:p-3">
                  {selectedMode === "solo" ? (
                    <GamePreview mode="solo" />
                  ) : (
                    <div className="rounded-[1.55rem] border border-white/10 bg-zinc-900/70 p-8 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl">
                        {selectedMode === "ranked" ? "⚔️" : "🏆"}
                      </div>

                      <div className="mt-5 text-3xl font-black">
                        {selectedMode === "ranked"
                          ? "1v1 Ranked is coming"
                          : "Tournament mode is coming"}
                      </div>

                      <p className="mx-auto mt-4 max-w-xl leading-7 text-zinc-400">
                        The interface is already ready. This mode will connect
                        to matchmaking, server-side scoring, ranked identity,
                        and tournament progression once the competition backend
                        is in place.
                      </p>

                      <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200">
                        Solo mode is fully playable right now
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">
                        Ranking system
                      </div>
                      <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                        Live streak power leaderboard
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                        The top players are ranked by consistency-driven power,
                        combining best streaks with repeat flawless performances
                        instead of one lucky run.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/leaderboard"
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/10"
                      >
                        View all
                      </Link>

                      <button
                        type="button"
                        onClick={() => void loadLeaderboard({ background: true })}
                        disabled={loadingLeaderboard || refreshingLeaderboard}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/10 disabled:opacity-60"
                      >
                        {refreshingLeaderboard ? "Refreshing..." : "Refresh"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    {loadingLeaderboard ? (
                      <LeaderboardSkeleton />
                    ) : leaderboardError ? (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                        {leaderboardError}
                      </div>
                    ) : leaderboard.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-sm text-zinc-400">
                        No leaderboard data yet. Play a few sessions and this
                        board will come alive.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid gap-4 xl:grid-cols-3">
                          {topEntries.map((entry) => (
                            <TopLeaderboardCard key={entry.rank} entry={entry} />
                          ))}
                        </div>

                        {remainingLeaderboard.length > 0 && (
                          <div className="space-y-3">
                            {remainingLeaderboard.map((entry) => (
                              <LeaderboardRow key={entry.rank} entry={entry} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                    <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">
                      Control
                    </div>
                    <h3 className="mt-3 text-2xl font-black">
                      Built for fast comfort
                    </h3>

                    <div className="mt-5 space-y-3">
                      {controlTips.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-zinc-300"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                    <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">
                      Live metrics
                    </div>
                    <h3 className="mt-3 text-2xl font-black">
                      Real competitive structure
                    </h3>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                          Leaderboard size
                        </div>
                        <div className="mt-1 text-xl font-black text-white">
                          {formatCompactNumber(leaderboardCount)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                          Top power
                        </div>
                        <div className="mt-1 text-xl font-black text-pink-300">
                          {topPower}
                        </div>
                      </div>
                    </div>

                    <p className="mt-5 leading-8 text-zinc-300">
                      Ranked 1v1, tournament brackets, persistent player stats,
                      daily challenge seeds, and leaderboard logic can now grow
                      naturally on top of a real backend instead of static UI.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="rounded-[2.25rem] border border-white/10 bg-gradient-to-r from-pink-500/10 via-transparent to-purple-500/10 p-[1px]">
              <div className="rounded-[2.2rem] bg-black/60 px-6 py-8 backdrop-blur-xl sm:px-8 sm:py-10">
                <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">
                      Ready for competitive scale
                    </div>

                    <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                      This page is now structured like a real game hub.
                    </h2>

                    <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
                      Modes, identity, leaderboard, controls, and backend-fed
                      ranking data now live in the same place. The next layer is
                      matchmaking, ranked profiles, and tournament logic.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <Link
                      href="/leaderboard"
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                    >
                      Full leaderboard
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.02]"
                    >
                      Back to top
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
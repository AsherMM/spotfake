"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type LeaderboardMode = "global" | "solo" | "ranked" | "tournament";

type LeaderboardApiEntry = {
  rank: number;
  profileId?: string;
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

type LeaderboardEntry = {
  rank: number;
  name: string;
  avatar: string | null;
  isGuest: boolean;
  powerScore: number;
  bestScore: number;
  bestStreak: number;
  flawlessRuns: number;
  totalGames: number;
  averageScore: number;
  bestSoloScore: number;
  bestRankedScore: number;
  bestTournamentScore: number;
  modeBestScore: number;
};

const MODE_TABS: {
  id: LeaderboardMode;
  label: string;
  subtitle: string;
  description: string;
}[] = [
  {
    id: "global",
    label: "Global",
    subtitle: "Overall leaderboard",
    description:
      "Best overall players ranked by streak power, consistency, and repeat flawless runs.",
  },
  {
    id: "solo",
    label: "Solo",
    subtitle: "Solo mode leaderboard",
    description:
      "Only solo performances are highlighted here. Best solo score leads the board.",
  },
  {
    id: "ranked",
    label: "Ranked",
    subtitle: "1v1 competitive leaderboard",
    description:
      "Only ranked performances appear here. Solo data does not decide this board.",
  },
  {
    id: "tournament",
    label: "Tournament",
    subtitle: "Bracket leaderboard",
    description:
      "Only tournament performances appear here. This board ignores solo runs.",
  },
];

function getPlayerInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "P";
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatAverage(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

function getRankTheme(rank: number) {
  if (rank === 1) {
    return {
      border: "border-yellow-400/35",
      bg: "bg-gradient-to-br from-yellow-400/18 via-amber-300/8 to-transparent",
      badge: "border-yellow-300/40 bg-yellow-400/15 text-yellow-100",
      accent: "text-yellow-300",
      trophy: "🏆",
      label: "Gold",
    };
  }

  if (rank === 2) {
    return {
      border: "border-zinc-300/25",
      bg: "bg-gradient-to-br from-zinc-300/12 via-zinc-200/6 to-transparent",
      badge: "border-zinc-300/30 bg-zinc-200/10 text-zinc-100",
      accent: "text-zinc-100",
      trophy: "🥈",
      label: "Silver",
    };
  }

  if (rank === 3) {
    return {
      border: "border-orange-500/25",
      bg: "bg-gradient-to-br from-orange-500/14 via-amber-500/8 to-transparent",
      badge: "border-orange-400/25 bg-orange-500/10 text-orange-200",
      accent: "text-orange-300",
      trophy: "🥉",
      label: "Bronze",
    };
  }

  return {
    border: "border-white/10",
    bg: "bg-white/[0.03]",
    badge: "border-white/10 bg-white/5 text-zinc-200",
    accent: "text-pink-300",
    trophy: "•",
    label: "Ranked",
  };
}

function normalizeLeaderboardResponse(
  payload: LeaderboardApiResponse,
  mode: LeaderboardMode
): LeaderboardEntry[] {
  const rawItems = Array.isArray(payload) ? payload : payload.items ?? [];

  const normalized = rawItems.map((entry, index) => {
    const bestSoloScore = entry.bestSoloScore ?? 0;
    const bestRankedScore = entry.bestRankedScore ?? 0;
    const bestTournamentScore = entry.bestTournamentScore ?? 0;

    const modeBestScore =
      mode === "solo"
        ? bestSoloScore
        : mode === "ranked"
        ? bestRankedScore
        : mode === "tournament"
        ? bestTournamentScore
        : entry.bestScore ?? 0;

    return {
      rank: entry.rank ?? index + 1,
      name:
        (entry.player.fullName && entry.player.fullName.trim()) ||
        entry.player.displayName ||
        "Player",
      avatar: entry.player.avatarUrl || null,
      isGuest: entry.player.isGuest,
      powerScore: entry.powerScore ?? 0,
      bestScore: entry.bestScore ?? 0,
      bestStreak: entry.bestStreak ?? 0,
      flawlessRuns: entry.flawlessRuns ?? 0,
      totalGames: entry.totalGames ?? 0,
      averageScore: entry.averageScore ?? 0,
      bestSoloScore,
      bestRankedScore,
      bestTournamentScore,
      modeBestScore,
    };
  });

  const filtered = normalized.filter((entry) => {
    if (mode === "solo") {
      return entry.bestSoloScore > 0;
    }

    if (mode === "ranked") {
      return entry.bestRankedScore > 0;
    }

    if (mode === "tournament") {
      return entry.bestTournamentScore > 0;
    }

    return (
      entry.bestScore > 0 ||
      entry.bestStreak > 0 ||
      entry.flawlessRuns > 0 ||
      entry.powerScore > 0 ||
      entry.totalGames > 0
    );
  });

  filtered.sort((a, b) => {
    if (mode === "solo" && b.bestSoloScore !== a.bestSoloScore) {
      return b.bestSoloScore - a.bestSoloScore;
    }

    if (mode === "ranked" && b.bestRankedScore !== a.bestRankedScore) {
      return b.bestRankedScore - a.bestRankedScore;
    }

    if (mode === "tournament" && b.bestTournamentScore !== a.bestTournamentScore) {
      return b.bestTournamentScore - a.bestTournamentScore;
    }

    if (b.powerScore !== a.powerScore) return b.powerScore - a.powerScore;
    if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    if (b.flawlessRuns !== a.flawlessRuns) return b.flawlessRuns - a.flawlessRuns;
    return b.totalGames - a.totalGames;
  });

  return filtered.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
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

function HeroTopCard({
  entry,
  mode,
}: {
  entry: LeaderboardEntry;
  mode: LeaderboardMode;
}) {
  const theme = getRankTheme(entry.rank);

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-6 ${theme.border} ${theme.bg}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_38%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
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

        <div className="mt-5 flex items-center gap-4">
          <Avatar
            src={entry.avatar}
            alt={entry.name}
            fallback={getPlayerInitial(entry.name)}
            sizeClassName="h-16 w-16 shrink-0"
          />

          <div className="min-w-0">
            <div className="truncate text-2xl font-black text-white">
              {entry.name}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
              Best streak {entry.bestStreak} · Flawless {entry.flawlessRuns}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              {mode === "global" ? "Best score" : `${mode} best`}
            </div>
            <div className="mt-1 text-xl font-black text-white">
              {entry.modeBestScore}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Power
            </div>
            <div className={`mt-1 text-xl font-black ${theme.accent}`}>
              {entry.powerScore}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Games
            </div>
            <div className="mt-1 text-xl font-black text-white">
              {entry.totalGames}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Average
            </div>
            <div className="mt-1 text-xl font-black text-white">
              {formatAverage(entry.averageScore)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankRow({
  entry,
  mode,
}: {
  entry: LeaderboardEntry;
  mode: LeaderboardMode;
}) {
  const theme = getRankTheme(entry.rank);

  return (
    <div
      className={`rounded-2xl border p-4 transition ${entry.rank <= 3 ? `${theme.border} ${theme.bg}` : "border-white/10 bg-black/25"}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 font-black ${entry.rank <= 3 ? theme.accent : "text-white"} bg-gradient-to-br from-white/10 to-white/5`}
          >
            #{entry.rank}
          </div>

          <Avatar
            src={entry.avatar}
            alt={entry.name}
            fallback={getPlayerInitial(entry.name)}
            sizeClassName="h-12 w-12 shrink-0"
          />

          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-white">
              {entry.name}
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Best streak {entry.bestStreak} · Flawless {entry.flawlessRuns}
              {entry.isGuest ? " · Guest" : ""}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-center">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              {mode === "global" ? "Score" : "Mode best"}
            </div>
            <div className="mt-1 text-base font-black text-white">
              {entry.modeBestScore}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-center">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Power
            </div>
            <div className="mt-1 text-base font-black text-pink-300">
              {entry.powerScore}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-center">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Games
            </div>
            <div className="mt-1 text-base font-black text-white">
              {entry.totalGames}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-center">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Average
            </div>
            <div className="mt-1 text-base font-black text-white">
              {formatAverage(entry.averageScore)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [mode, setMode] = useState<LeaderboardMode>("global");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/leaderboard?mode=${mode}&limit=50`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load leaderboard.");
        }

        const payload: LeaderboardApiResponse = await response.json();
        const normalized = normalizeLeaderboardResponse(payload, mode);

        if (cancelled) return;
        setLeaderboard(normalized);
      } catch (err) {
        console.error("leaderboard page error:", err);
        if (cancelled) return;
        setError("Unable to load the leaderboard right now.");
        setLeaderboard([]);
      } finally {
        if (cancelled) return;
        setLoading(false);
        setRefreshing(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError(null);

      const response = await fetch(`/api/leaderboard?mode=${mode}&limit=50`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh leaderboard.");
      }

      const payload: LeaderboardApiResponse = await response.json();
      const normalized = normalizeLeaderboardResponse(payload, mode);

      setLeaderboard(normalized);
    } catch (err) {
      console.error("leaderboard refresh error:", err);
      setError("Unable to refresh the leaderboard right now.");
    } finally {
      setRefreshing(false);
    }
  }

  const currentTab = useMemo(
    () => MODE_TABS.find((tab) => tab.id === mode) ?? MODE_TABS[0],
    [mode]
  );

  const heroEntry = leaderboard[0] ?? null;
  const listEntries = heroEntry ? leaderboard.slice(1) : leaderboard;
  const listedPlayers = leaderboard.length;
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

          <div className="flex items-center gap-3">
            <Link
              href="/game"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              Back to game
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="rounded-[2.25rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-sm text-pink-200">
                  <span className="h-2 w-2 rounded-full bg-pink-400" />
                  Competitive ranking · filtered by real mode performance
                </div>

                <h1 className="mt-5 text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
                  Leaderboard
                </h1>

                <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
                  Browse the strongest players, inspect true mode-based rankings,
                  and compare streak power built on real runs.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    Listed players
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {formatCompactNumber(listedPlayers)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    Top power
                  </div>
                  <div className="mt-1 text-2xl font-black text-pink-300">
                    {topPower}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Mode selector
                </div>
                <h2 className="mt-3 text-3xl font-black tracking-tight">
                  Change ranking board
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Ranked and tournament boards do not inherit solo results. Each
                  board stays tied to its own real performance data.
                </p>

                <div className="mt-5 grid gap-3">
                  {MODE_TABS.map((tab) => {
                    const active = tab.id === mode;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setMode(tab.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-pink-500/40 bg-pink-500/10 shadow-lg shadow-pink-500/10"
                            : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-lg font-black text-white">
                              {tab.label}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-zinc-400">
                              {tab.subtitle}
                            </div>
                            <div className="mt-2 text-sm leading-7 text-zinc-500">
                              {tab.description}
                            </div>
                          </div>

                          {active && (
                            <div className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-pink-200">
                              Active
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Current board
                </div>
                <h3 className="mt-3 text-2xl font-black">{currentTab.label}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {currentTab.description}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      Top players
                    </div>
                    <div className="mt-1 text-xl font-black text-white">
                      {listedPlayers}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      Best power
                    </div>
                    <div className="mt-1 text-xl font-black text-pink-300">
                      {topPower}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      Refresh
                    </div>
                    <div className="mt-1 text-xl font-black text-white">
                      {refreshing ? "..." : "Ready"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">
                    Live board
                  </div>
                  <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                    {currentTab.label} leaderboard
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                    Clean mode-separated rankings, based only on the relevant
                    performances for the board you selected.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading || refreshing}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/10 disabled:opacity-60"
                >
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {loading ? (
                <LeaderboardSkeleton />
              ) : error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-sm text-zinc-400">
                  No valid players found for this leaderboard yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {heroEntry && <HeroTopCard entry={heroEntry} mode={mode} />}

                  <div className="space-y-3">
                    {listEntries.map((entry) => (
                      <RankRow
                        key={`${mode}-${entry.rank}-${entry.name}`}
                        entry={entry}
                        mode={mode}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
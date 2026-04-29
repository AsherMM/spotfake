import type { LeaderboardApiResponse, LeaderboardEntry } from "./types";


export function normalizeLeaderboard(
  payload: LeaderboardApiResponse
): LeaderboardEntry[] {
  const raw = Array.isArray(payload) ? payload : payload.items ?? [];

  return raw
    .map((entry) => ({
      rank: entry.rank,
      name:
        entry.player.fullName?.trim() || entry.player.displayName || "Player",
      avatar: entry.player.avatarUrl ?? null,
      bestScore: entry.bestScore ?? 0,
      bestStreak: entry.bestStreak ?? 0,
      flawlessRuns: entry.flawlessRuns ?? 0,
      powerScore: entry.powerScore ?? 0,
      isGuest: entry.player.isGuest,
    }))
    .filter(
      (entry) =>
        entry.bestScore > 0 || entry.bestStreak > 0 || entry.powerScore > 0
    )
    .sort((a, b) => {
      if (b.powerScore !== a.powerScore) return b.powerScore - a.powerScore;
      if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      return b.flawlessRuns - a.flawlessRuns;
    })
    .slice(0, 5)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}
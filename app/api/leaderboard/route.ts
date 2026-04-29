import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

// ──────────────────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────────────────

type LeaderboardMode = "global" | "solo" | "ranked" | "tournament";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

// Modes that don't have live data yet — we short-circuit to an empty
// response instead of scanning the DB. Remove entries from this set as
// they launch.
const UNAVAILABLE_MODES = new Set<LeaderboardMode>(["ranked", "tournament"]);

// ──────────────────────────────────────────────────────────────────────────
// Query-param parsing
// ──────────────────────────────────────────────────────────────────────────

function parseLimit(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

function parseMode(value: string | null): LeaderboardMode {
  if (
    value === "global" ||
    value === "solo" ||
    value === "ranked" ||
    value === "tournament"
  ) {
    return value;
  }
  return "global";
}

// ──────────────────────────────────────────────────────────────────────────
// Query builders
// ──────────────────────────────────────────────────────────────────────────

/**
 * WHERE clause — only surface profiles that have actually contributed to
 * this specific board. Avoids polluting mode-specific boards with players
 * who only played other modes.
 */
function buildWhere(mode: LeaderboardMode): Prisma.GameStatWhereInput {
  switch (mode) {
    case "solo":
      return { bestSoloScore: { gt: 0 } };
    case "ranked":
      return { bestRankedScore: { gt: 0 } };
    case "tournament":
      return { bestTournamentScore: { gt: 0 } };
    case "global":
      return {
        OR: [
          { powerScore: { gt: 0 } },
          { bestScore: { gt: 0 } },
          { bestStreak: { gt: 0 } },
          { flawlessRuns: { gt: 0 } },
        ],
      };
  }
}

/**
 * ORDER BY — multi-key, deterministic. The DB does the sort, not us.
 *
 * Global board ranks by powerScore (the headline metric shown in the UI),
 * with tie-breakers that favor consistency (streak, flawless) over raw
 * score. Mode-specific boards lead with the mode's best score so players
 * understand the ranking reflects their performance in *that* mode.
 */
function buildOrderBy(
  mode: LeaderboardMode
): Prisma.GameStatOrderByWithRelationInput[] {
  const commonTail: Prisma.GameStatOrderByWithRelationInput[] = [
    { bestStreak: "desc" },
    { flawlessRuns: "desc" },
    { bestScore: "desc" },
  ];

  switch (mode) {
    case "solo":
      return [
        { bestSoloScore: "desc" },
        { powerScore: "desc" },
        ...commonTail,
      ];
    case "ranked":
      return [
        { bestRankedScore: "desc" },
        { powerScore: "desc" },
        ...commonTail,
      ];
    case "tournament":
      return [
        { bestTournamentScore: "desc" },
        { powerScore: "desc" },
        ...commonTail,
      ];
    case "global":
      return [
        { powerScore: "desc" },
        ...commonTail,
        { totalGames: "desc" },
        // Final, stable tie-breaker — guarantees deterministic ranking
        // even when every score-based key ties.
        { profileId: "asc" },
      ];
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Response helpers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Cache headers suitable for a public leaderboard: short edge cache,
 * longer stale-while-revalidate so a burst of requests (e.g. 10 tabs
 * auto-refreshing at the same time) collapses into one DB hit.
 */
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
} as const;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
} as const;

function emptyBoard(mode: LeaderboardMode, limit: number) {
  return NextResponse.json(
    { mode, limit, count: 0, items: [] },
    { headers: CACHE_HEADERS }
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"));
    const mode = parseMode(searchParams.get("mode"));

    // Unreleased modes — return empty without touching the DB.
    if (UNAVAILABLE_MODES.has(mode)) {
      return emptyBoard(mode, limit);
    }

    // Single DB roundtrip: filtered, ordered, and limited at the source.
    const entries = await prisma.gameStat.findMany({
      where: buildWhere(mode),
      orderBy: buildOrderBy(mode),
      take: limit,
      select: {
        powerScore: true,
        bestStreak: true,
        flawlessRuns: true,
        bestScore: true,
        // Only include mode-specific best when it's the active board,
        // so the payload stays lean.
        ...(mode === "solo" && { bestSoloScore: true }),
        profile: {
          select: {
            id: true,
            displayName: true,
            fullName: true,
            avatarUrl: true,
            isGuest: true,
          },
        },
      },
    });

    const items = entries
      // Defensive: skip orphaned stats with no profile. Shouldn't happen
      // given the Cascade relation, but a missing profile would crash the
      // map below if it ever did.
      .filter((entry) => entry.profile !== null)
      .map((entry, index) => ({
        rank: index + 1,
        powerScore: entry.powerScore,
        bestStreak: entry.bestStreak,
        flawlessRuns: entry.flawlessRuns,
        bestScore: entry.bestScore,
        ...(mode === "solo" && "bestSoloScore" in entry
          ? { bestSoloScore: entry.bestSoloScore }
          : {}),
        player: {
          id: entry.profile.id,
          displayName: entry.profile.displayName,
          fullName: entry.profile.fullName,
          avatarUrl: entry.profile.avatarUrl,
          isGuest: entry.profile.isGuest,
        },
      }));

    return NextResponse.json(
      { mode, limit, count: items.length, items },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error("[leaderboard]", error);
    return NextResponse.json(
      { error: "Unable to load leaderboard." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
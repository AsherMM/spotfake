import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type LeaderboardMode = "global" | "solo" | "ranked" | "tournament";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

function parseLimit(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

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

function shouldKeepEntry(entry: {
  powerScore: number;
  bestStreak: number;
  flawlessRuns: number;
  bestScore: number;
  bestSoloScore: number;
  bestRankedScore: number;
  bestTournamentScore: number;
  totalGames: number;
}) {
  return (
    entry.totalGames > 0 ||
    entry.powerScore > 0 ||
    entry.bestScore > 0 ||
    entry.bestStreak > 0 ||
    entry.flawlessRuns > 0 ||
    entry.bestSoloScore > 0 ||
    entry.bestRankedScore > 0 ||
    entry.bestTournamentScore > 0
  );
}

function getModeScore(entry: {
  powerScore: number;
  bestScore: number;
  bestStreak: number;
  flawlessRuns: number;
  bestSoloScore: number;
  bestRankedScore: number;
  bestTournamentScore: number;
  totalGames: number;
}) {
  return {
    global: [
      entry.powerScore,
      entry.bestStreak,
      entry.bestScore,
      entry.flawlessRuns,
      entry.totalGames,
    ],
    solo: [
      entry.bestSoloScore,
      entry.powerScore,
      entry.bestStreak,
      entry.flawlessRuns,
      entry.bestScore,
    ],
    ranked: [
      entry.bestRankedScore,
      entry.powerScore,
      entry.bestStreak,
      entry.flawlessRuns,
      entry.bestScore,
    ],
    tournament: [
      entry.bestTournamentScore,
      entry.powerScore,
      entry.bestStreak,
      entry.flawlessRuns,
      entry.bestScore,
    ],
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = parseLimit(searchParams.get("limit"));
    const mode = parseMode(searchParams.get("mode"));

    const rawLeaderboard = await prisma.gameStat.findMany({
      select: {
        profileId: true,
        powerScore: true,
        bestStreak: true,
        flawlessRuns: true,
        bestScore: true,
        bestSoloScore: true,
        bestRankedScore: true,
        bestTournamentScore: true,
        totalGames: true,
        totalWins: true,
        totalLosses: true,
        averageScore: true,
        updatedAt: true,
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

    const filtered = rawLeaderboard.filter((entry) =>
      shouldKeepEntry({
        powerScore: entry.powerScore,
        bestStreak: entry.bestStreak,
        flawlessRuns: entry.flawlessRuns,
        bestScore: entry.bestScore,
        bestSoloScore: entry.bestSoloScore,
        bestRankedScore: entry.bestRankedScore,
        bestTournamentScore: entry.bestTournamentScore,
        totalGames: entry.totalGames,
      })
    );

    const sorted = filtered.sort((a, b) => {
      const aScores = getModeScore(a)[mode];
      const bScores = getModeScore(b)[mode];

      for (let i = 0; i < aScores.length; i += 1) {
        if (bScores[i] !== aScores[i]) {
          return bScores[i] - aScores[i];
        }
      }

      return a.profile.displayName.localeCompare(b.profile.displayName);
    });

    const items = sorted.slice(0, limit).map((entry, index) => ({
      rank: index + 1,
      profileId: entry.profileId,
      powerScore: entry.powerScore,
      bestStreak: entry.bestStreak,
      flawlessRuns: entry.flawlessRuns,
      bestScore: entry.bestScore,
      bestSoloScore: entry.bestSoloScore,
      bestRankedScore: entry.bestRankedScore,
      bestTournamentScore: entry.bestTournamentScore,
      totalGames: entry.totalGames,
      totalWins: entry.totalWins,
      totalLosses: entry.totalLosses,
      averageScore: entry.averageScore,
      updatedAt: entry.updatedAt,
      player: {
        id: entry.profile.id,
        displayName: entry.profile.displayName,
        fullName: entry.profile.fullName,
        avatarUrl: entry.profile.avatarUrl,
        isGuest: entry.profile.isGuest,
      },
    }));

    return NextResponse.json(
      {
        mode,
        limit,
        count: items.length,
        items,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("leaderboard error:", error);

    return NextResponse.json(
      {
        error: "Unable to load leaderboard.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
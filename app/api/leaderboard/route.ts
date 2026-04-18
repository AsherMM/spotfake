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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = parseLimit(searchParams.get("limit"));
    const mode = parseMode(searchParams.get("mode"));

    const leaderboard = await prisma.gameStat.findMany({
      take: limit,
      orderBy:
        mode === "solo"
          ? [
              { bestSoloScore: "desc" },
              { powerScore: "desc" },
              { bestStreak: "desc" },
              { flawlessRuns: "desc" },
              { bestScore: "desc" },
            ]
          : mode === "ranked"
          ? [
              { bestRankedScore: "desc" },
              { powerScore: "desc" },
              { bestStreak: "desc" },
              { flawlessRuns: "desc" },
              { bestScore: "desc" },
            ]
          : mode === "tournament"
          ? [
              { bestTournamentScore: "desc" },
              { powerScore: "desc" },
              { bestStreak: "desc" },
              { flawlessRuns: "desc" },
              { bestScore: "desc" },
            ]
          : [
              { powerScore: "desc" },
              { bestStreak: "desc" },
              { bestScore: "desc" },
              { flawlessRuns: "desc" },
              { totalGames: "desc" },
            ],
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

    const items = leaderboard.map((entry, index) => ({
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
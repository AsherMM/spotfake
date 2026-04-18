import { prisma } from "@/app/lib/prisma";
import { GameMode, SessionEndReason } from "@prisma/client";

type RecordGameSessionInput = {
  profileId: string;
  mode: GameMode;
  score: number;
  streakReached: number;
  correctAnswers: number;
  wrongAnswers: number;
  timedOut: boolean;
  flawless: boolean;
  durationMs: number;
  difficultyReached?: "easy" | "medium" | "hard" | null;
  category?: "faces" | "landscapes" | "objects" | "animals" | "scenes" | null;
  endedBy: SessionEndReason;
};

export async function recordGameSession(input: RecordGameSessionInput) {
  const session = await prisma.gameSession.create({
    data: {
      profileId: input.profileId,
      mode: input.mode,
      score: input.score,
      streakReached: input.streakReached,
      correctAnswers: input.correctAnswers,
      wrongAnswers: input.wrongAnswers,
      timedOut: input.timedOut,
      flawless: input.flawless,
      durationMs: input.durationMs,
      difficultyReached: input.difficultyReached ?? undefined,
      category: input.category ?? undefined,
      endedBy: input.endedBy,
    },
  });

  const existingStats = await prisma.gameStat.findUnique({
    where: { profileId: input.profileId },
  });

  if (!existingStats) {
    const bestSoloScore = input.mode === "solo" ? input.score : 0;
    const bestRankedScore = input.mode === "ranked" ? input.score : 0;
    const bestTournamentScore = input.mode === "tournament" ? input.score : 0;
    const flawlessRuns = input.flawless ? 1 : 0;
    const bestStreak = input.streakReached;
    const powerScore = bestStreak * flawlessRuns;
    const totalGames = 1;
    const totalScoreCumulated = input.score;

    await prisma.gameStat.create({
      data: {
        profileId: input.profileId,
        bestScore: input.score,
        bestStreak,
        flawlessRuns,
        powerScore,
        totalGames,
        totalWins: input.flawless ? 1 : 0,
        totalLosses: input.flawless ? 0 : 1,
        totalTimeoutLosses: input.timedOut ? 1 : 0,
        totalCorrect: input.correctAnswers,
        totalWrong: input.wrongAnswers,
        totalPlayTimeMs: input.durationMs,
        totalScoreCumulated,
        averageScore: totalScoreCumulated / totalGames,
        bestSoloScore,
        bestRankedScore,
        bestTournamentScore,
      },
    });

    return session;
  }

  const bestScore = Math.max(existingStats.bestScore, input.score);
  const bestStreak = Math.max(existingStats.bestStreak, input.streakReached);
  const flawlessRuns = existingStats.flawlessRuns + (input.flawless ? 1 : 0);
  const powerScore = bestStreak * flawlessRuns;

  const totalGames = existingStats.totalGames + 1;
  const totalWins = existingStats.totalWins + (input.flawless ? 1 : 0);
  const totalLosses = existingStats.totalLosses + (input.flawless ? 0 : 1);
  const totalTimeoutLosses =
    existingStats.totalTimeoutLosses + (input.timedOut ? 1 : 0);

  const totalCorrect = existingStats.totalCorrect + input.correctAnswers;
  const totalWrong = existingStats.totalWrong + input.wrongAnswers;
  const totalPlayTimeMs = existingStats.totalPlayTimeMs + input.durationMs;
  const totalScoreCumulated = existingStats.totalScoreCumulated + input.score;
  const averageScore = totalScoreCumulated / totalGames;

  const bestSoloScore =
    input.mode === "solo"
      ? Math.max(existingStats.bestSoloScore, input.score)
      : existingStats.bestSoloScore;

  const bestRankedScore =
    input.mode === "ranked"
      ? Math.max(existingStats.bestRankedScore, input.score)
      : existingStats.bestRankedScore;

  const bestTournamentScore =
    input.mode === "tournament"
      ? Math.max(existingStats.bestTournamentScore, input.score)
      : existingStats.bestTournamentScore;

  await prisma.gameStat.update({
    where: { profileId: input.profileId },
    data: {
      bestScore,
      bestStreak,
      flawlessRuns,
      powerScore,
      totalGames,
      totalWins,
      totalLosses,
      totalTimeoutLosses,
      totalCorrect,
      totalWrong,
      totalPlayTimeMs,
      totalScoreCumulated,
      averageScore,
      bestSoloScore,
      bestRankedScore,
      bestTournamentScore,
    },
  });

  return session;
}
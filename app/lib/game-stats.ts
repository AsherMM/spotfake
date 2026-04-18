import { prisma } from "@/app/lib/prisma";
import { GameMode, SessionEndReason } from "@prisma/client";

type Difficulty = "easy" | "medium" | "hard";
type Category = "faces" | "landscapes" | "objects" | "animals" | "scenes";

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
  difficultyReached?: Difficulty | null;
  category?: Category | null;
  endedBy: SessionEndReason;
};

function toSafeInt(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function toSafeAverage(totalScoreCumulated: number, totalGames: number) {
  if (totalGames <= 0) return 0;
  return totalScoreCumulated / totalGames;
}

function normalizeInput(input: RecordGameSessionInput): RecordGameSessionInput {
  const score = toSafeInt(input.score);
  const streakReached = Math.max(toSafeInt(input.streakReached), score);
  const correctAnswers = toSafeInt(input.correctAnswers);
  const wrongAnswers = toSafeInt(input.wrongAnswers);
  const durationMs = toSafeInt(input.durationMs);

  return {
    ...input,
    score,
    streakReached,
    correctAnswers,
    wrongAnswers,
    durationMs,
    timedOut: Boolean(input.timedOut),
    flawless: Boolean(input.flawless),
    difficultyReached: input.difficultyReached ?? null,
    category: input.category ?? null,
  };
}

export async function recordGameSession(rawInput: RecordGameSessionInput) {
  const input = normalizeInput(rawInput);

  return prisma.$transaction(async (tx) => {
    const session = await tx.gameSession.create({
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

    const existingStats = await tx.gameStat.findUnique({
      where: { profileId: input.profileId },
    });

    const sessionBestSoloScore = input.mode === "solo" ? input.score : 0;
    const sessionBestRankedScore = input.mode === "ranked" ? input.score : 0;
    const sessionBestTournamentScore =
      input.mode === "tournament" ? input.score : 0;

    if (!existingStats) {
      const flawlessRuns = input.flawless ? 1 : 0;
      const bestStreak = input.streakReached;
      const powerScore = bestStreak * flawlessRuns;
      const totalGames = 1;
      const totalWins = input.flawless ? 1 : 0;
      const totalLosses = input.flawless ? 0 : 1;
      const totalTimeoutLosses = input.timedOut ? 1 : 0;
      const totalCorrect = input.correctAnswers;
      const totalWrong = input.wrongAnswers;
      const totalPlayTimeMs = input.durationMs;
      const totalScoreCumulated = input.score;
      const averageScore = toSafeAverage(totalScoreCumulated, totalGames);

      await tx.gameStat.create({
        data: {
          profileId: input.profileId,
          bestScore: input.score,
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
          bestSoloScore: sessionBestSoloScore,
          bestRankedScore: sessionBestRankedScore,
          bestTournamentScore: sessionBestTournamentScore,
        },
      });

      return session;
    }

    const bestScore = Math.max(existingStats.bestScore, input.score);
    const bestStreak = Math.max(existingStats.bestStreak, input.streakReached);

    const flawlessRuns =
      existingStats.flawlessRuns + (input.flawless ? 1 : 0);

    const powerScore = bestStreak * flawlessRuns;

    const totalGames = existingStats.totalGames + 1;
    const totalWins = existingStats.totalWins + (input.flawless ? 1 : 0);
    const totalLosses = existingStats.totalLosses + (input.flawless ? 0 : 1);
    const totalTimeoutLosses =
      existingStats.totalTimeoutLosses + (input.timedOut ? 1 : 0);

    const totalCorrect = existingStats.totalCorrect + input.correctAnswers;
    const totalWrong = existingStats.totalWrong + input.wrongAnswers;
    const totalPlayTimeMs = existingStats.totalPlayTimeMs + input.durationMs;
    const totalScoreCumulated =
      existingStats.totalScoreCumulated + input.score;
    const averageScore = toSafeAverage(totalScoreCumulated, totalGames);

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

    await tx.gameStat.update({
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
  });
}
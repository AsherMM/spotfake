// Short, factual messages per performance tier. Kept intentionally terse —
// right after a failed run, players want their score, not a motivational essay.

export type GameOverTier = "zero" | "low" | "mid" | "high";

export function getGameOverTier(streak: number): GameOverTier {
  if (streak === 0) return "zero";
  if (streak < 5) return "low";
  if (streak < 10) return "mid";
  return "high";
}

export const GAME_OVER_MESSAGES: Record<GameOverTier, string[]> = {
  zero: [
    "Zero streak.",
    "Walked into the wall.",
    "Reset. Try again.",
  ],
  low: [
    "Getting warm.",
    "Not enough yet.",
    "Focus slipped.",
  ],
  mid: [
    "Solid run.",
    "Good reads.",
    "Reflexes locking in.",
  ],
  high: [
    "Elite-level run.",
    "You're in the zone.",
    "Rarefied air.",
  ],
};
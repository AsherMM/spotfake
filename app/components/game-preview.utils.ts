import type {
  Answer,
  Difficulty,
  ImageCategory,
  MockImage,
} from "@/app/components/game-preview.types";
import {
  BEST_SCORE_KEY,
  GLOBAL_RECENT_HISTORY_SIZE,
  RECENT_GLOBAL_KEY,
} from "@/app/components/game-preview.constants";

export function subscribeToClientReady() {
  return () => {};
}

export function getClientSnapshot() {
  return true;
}

export function getServerSnapshot() {
  return false;
}

export function hasImages(list: MockImage[]): boolean {
  return Array.isArray(list) && list.length > 0;
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

export function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function loadBestScore(): number {
  if (typeof window === "undefined") return 0;

  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(v: number): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(v));
  } catch {
    // no-op
  }
}

export function loadGlobalRecentHistory(): number[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECENT_GLOBAL_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((x) => Number.isInteger(x) && x >= 0);
  } catch {
    return [];
  }
}

export function saveGlobalRecentHistory(indexes: number[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      RECENT_GLOBAL_KEY,
      JSON.stringify(indexes.slice(-GLOBAL_RECENT_HISTORY_SIZE))
    );
  } catch {
    // no-op
  }
}

export function getDifficulty(score: number): Difficulty {
  if (score >= 8) return "hard";
  if (score >= 4) return "medium";
  return "easy";
}

export function getAdaptiveDifficulty(
  score: number,
  avgReactionMs: number
): Difficulty {
  const base = getDifficulty(score);

  if (avgReactionMs > 0 && avgReactionMs <= 850) {
    if (score >= 6) return "hard";
    if (score >= 3) return "medium";
    return "easy";
  }

  if (avgReactionMs >= 1600) {
    if (score >= 10) return "hard";
    if (score >= 5) return "medium";
    return "easy";
  }

  return base;
}

export function haptic(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // no-op
  }
}

export function preloadImage(src?: string) {
  if (!src || typeof window === "undefined") return;

  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName;

  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function weightedPickIndex(
  weighted: Array<{ index: number; weight: number }>,
  random: () => number
): number {
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);

  if (total <= 0) return weighted[0]?.index ?? 0;

  let cursor = random() * total;

  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) return item.index;
  }

  return weighted[weighted.length - 1]?.index ?? 0;
}

export function countRecentTypeStreak(
  images: MockImage[],
  recentIndexes: number[],
  expectedType: Answer | undefined
): number {
  if (!expectedType) return 0;

  let streak = 0;

  for (let i = recentIndexes.length - 1; i >= 0; i -= 1) {
    const img = images[recentIndexes[i]];
    if (!img) break;
    if (img.type === expectedType) streak += 1;
    else break;
  }

  return streak;
}

export function countRecentCategoryStreak(
  images: MockImage[],
  recentIndexes: number[],
  expectedCategory: ImageCategory | undefined
): number {
  if (!expectedCategory) return 0;

  let streak = 0;

  for (let i = recentIndexes.length - 1; i >= 0; i -= 1) {
    const img = images[recentIndexes[i]];
    if (!img) break;
    if (img.category === expectedCategory) streak += 1;
    else break;
  }

  return streak;
}
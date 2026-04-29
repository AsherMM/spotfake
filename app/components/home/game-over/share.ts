// Share score logic, extracted so it's trivially testable and swappable.
// Uses navigator.share when available (mobile + modern desktop), falls back
// to clipboard copy otherwise.

export type ShareScoreInput = {
  streak: number;
  score: number;
  powerScore?: number;
  flawless?: boolean;
  isNewRecord?: boolean;
  /** Absolute URL to put at the end of the share text. */
  url?: string;
};

export type ShareResult =
  | { kind: "shared" }
  | { kind: "copied" }
  | { kind: "cancelled" }
  | { kind: "unsupported" };

/**
 * Builds a Wordle-style share string. Intentionally short and emoji-heavy
 * because that's what travels well on mobile and social.
 */
export function buildShareText(input: ShareScoreInput): string {
  const { streak, score, powerScore, flawless, isNewRecord, url } = input;

  const pieces = [`Spotfake · streak ${streak} 🔥`];

  if (flawless) pieces.push("⚡ flawless");
  if (isNewRecord) pieces.push("✨ new PB");
  pieces.push(`score ${score}`);
  if (typeof powerScore === "number" && powerScore > 0) {
    pieces.push(`power ${powerScore}`);
  }

  const line = pieces.join(" · ");
  return url ? `${line}\n${url}` : line;
}

export async function shareScore(input: ShareScoreInput): Promise<ShareResult> {
  if (typeof window === "undefined") return { kind: "unsupported" };

  const text = buildShareText(input);

  // Prefer the native Share Sheet on mobile and supported desktop browsers.
  const nav = window.navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
  };

  if (typeof nav.share === "function") {
    try {
      await nav.share({ title: "Spotfake", text });
      return { kind: "shared" };
    } catch (err) {
      // User aborted the share sheet — not an error.
      if ((err as Error)?.name === "AbortError") return { kind: "cancelled" };
      // Fall through to clipboard fallback on other errors.
    }
  }

  // Clipboard fallback.
  try {
    await navigator.clipboard.writeText(text);
    return { kind: "copied" };
  } catch {
    return { kind: "unsupported" };
  }
}
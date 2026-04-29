// ──────────────────────────────────────────────────────────────────────────────
// Image model — must match @/app/lib/mock-images
// ──────────────────────────────────────────────────────────────────────────────

export type ImageType = "real" | "fake";

export type ImageCategory =
  | "faces"
  | "landscapes"
  | "objects"
  | "animals"
  | "scenes";

export type ImageCredit = {
  label: string;
  href: string;
};

export type MockImage = {
  id: string;
  src: string;
  alt: string;
  type: ImageType;
  category: ImageCategory;
  credit?: ImageCredit;
};

// ──────────────────────────────────────────────────────────────────────────────
// Game state types
// ──────────────────────────────────────────────────────────────────────────────

export type Answer = "real" | "fake";
export type Feedback = "correct" | "wrong" | "timeout" | null;
export type SubmitState = "idle" | "submitting" | "submitted" | "error";
export type GameMode = "solo" | "ranked" | "tournament";

// ──────────────────────────────────────────────────────────────────────────────
// Component props & callbacks
// ──────────────────────────────────────────────────────────────────────────────


export type GameOverPayload = {
  streak: number;
  score: number;
  isNewRecord: boolean;
  flawless: boolean;
};

export type GamePreviewProps = {
  mode?: GameMode;
  onGameOver?: (payload: GameOverPayload) => void;
};
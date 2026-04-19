export type Answer = "real" | "fake";
export type Feedback = "correct" | "wrong" | "timeout" | null;
export type Difficulty = "easy" | "medium" | "hard";
export type GameMode = "solo" | "ranked" | "tournament";
export type EndReason = "wrong" | "timeout" | "completed" | "quit";
export type ImageCategory = "faces" | "landscapes" | "objects" | "animals" | "scenes";

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

export type MockImage = {
  src: string;
  alt: string;
  type: Answer;
  difficulty: Difficulty;
  category: ImageCategory;
};

export type RoundSeed = {
  currentIndex: number;
  nextIndex: number;
};

export type SubmitState = "idle" | "submitting" | "submitted" | "error";
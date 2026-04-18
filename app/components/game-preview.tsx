"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ClipboardEvent as ReactClipboardEvent,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { mockImages } from "@/app/lib/mock-images";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

type Answer = "real" | "fake";
type Feedback = "correct" | "wrong" | "timeout" | null;
type Difficulty = "easy" | "medium" | "hard";
type GameMode = "solo" | "ranked" | "tournament";
type EndReason = "wrong" | "timeout" | "completed" | "quit";
type ImageCategory = "faces" | "landscapes" | "objects" | "animals" | "scenes";

export type GameOverPayload = {
  streak: number;
  score: number;
  isNewRecord: boolean;
  flawless: boolean;
};

type GamePreviewProps = {
  mode?: GameMode;
  onGameOver?: (payload: GameOverPayload) => void;
};

type MockImage = {
  src: string;
  alt: string;
  type: Answer;
  difficulty: Difficulty;
  category: ImageCategory;
};

type RoundSeed = {
  currentIndex: number;
  nextIndex: number;
};

type SubmitState = "idle" | "submitting" | "submitted" | "error";

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const ROUND_DURATION_MS = 3000;
const FEEDBACK_DELAY_MS = 520;
const BEST_SCORE_KEY = "spotfake-best-score";
const RECENT_GLOBAL_KEY = "spotfake-recent-global-v1";

const SWIPE_TRIGGER_PX = 110;
const MAX_DRAG_PX = 180;
const MAX_ROTATION_DEG = 14;

const RECENT_HISTORY_SIZE = 16;
const GLOBAL_RECENT_HISTORY_SIZE = 24;
const PANIC_THRESHOLD_MS = 800;
const TIMER_FPS_LIMIT_MS = 33;

const EXIT_ANIMATION_MS = 160;
const ENTER_ANIMATION_MS = 260;
const BUMP_ANIMATION_MS = 320;

const PRELOAD_BUFFER_SIZE = 3;

// ──────────────────────────────────────────────────────────────────────────────
// SSR guard
// ──────────────────────────────────────────────────────────────────────────────

function subscribeToClientReady() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

// ──────────────────────────────────────────────────────────────────────────────
// Data helpers
// ──────────────────────────────────────────────────────────────────────────────

const images = mockImages as MockImage[];

function hasImages(list: MockImage[]): boolean {
  return Array.isArray(list) && list.length > 0;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveBestScore(v: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(v));
  } catch {
    // no-op
  }
}

function loadGlobalRecentHistory(): number[] {
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

function saveGlobalRecentHistory(indexes: number[]) {
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

function getDifficulty(score: number): Difficulty {
  if (score >= 8) return "hard";
  if (score >= 4) return "medium";
  return "easy";
}

function getAdaptiveDifficulty(score: number, avgReactionMs: number): Difficulty {
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

function haptic(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // no-op
  }
}

function preloadImage(src?: string) {
  if (!src || typeof window === "undefined") return;
  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Randomisation
// ──────────────────────────────────────────────────────────────────────────────

function weightedPickIndex(
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

function countRecentTypeStreak(
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

function countRecentCategoryStreak(
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

function pickNextIndex(params: {
  excludeIndex?: number;
  difficulty: Difficulty;
  recentIndexes: number[];
  globalRecentIndexes?: number[];
  lastType?: Answer;
  lastCategory?: ImageCategory;
  random: () => number;
}): number {
  const {
    excludeIndex = -1,
    difficulty: _difficulty,
    recentIndexes,
    globalRecentIndexes = [],
    lastType,
    lastCategory,
    random,
  } = params;

  if (!hasImages(images)) return -1;
  if (images.length === 1) return 0;

  const recentSet = new Set(recentIndexes);
  const globalRecentSet = new Set(globalRecentIndexes);

  const candidates = images
    .map((img, index) => ({ img, index }))
    .filter(({ index }) => index !== excludeIndex);

  if (candidates.length === 0) return 0;

  const typeStreak = countRecentTypeStreak(recentIndexes, lastType);
  const categoryStreak = countRecentCategoryStreak(recentIndexes, lastCategory);

  const weighted = candidates.map(({ img, index }) => {
    let weight = 10;

    if (!recentSet.has(index)) {
      weight += 18;
    } else {
      weight -= 12;
    }

    if (!globalRecentSet.has(index)) {
      weight += 5;
    } else {
      weight -= 3;
    }

    if (lastType) {
      if (img.type !== lastType) {
        weight += 6;
      } else {
        weight -= 3;
      }
    }

    if (typeStreak >= 2 && lastType) {
      if (img.type === lastType) weight -= 8;
      else weight += 8;
    }

    if (typeStreak >= 3 && lastType) {
      if (img.type === lastType) weight -= 12;
      else weight += 10;
    }

    if (lastCategory) {
      if (img.category !== lastCategory) {
        weight += 4;
      } else {
        weight -= 2;
      }
    }

    if (categoryStreak >= 2 && lastCategory) {
      if (img.category === lastCategory) weight -= 6;
      else weight += 5;
    }

    if (categoryStreak >= 3 && lastCategory) {
      if (img.category === lastCategory) weight -= 10;
      else weight += 7;
    }

    const localPos = recentIndexes.lastIndexOf(index);
    if (localPos !== -1) {
      const age = recentIndexes.length - localPos;
      weight += Math.max(0, age - 1);
    }

    const globalPos = globalRecentIndexes.lastIndexOf(index);
    if (globalPos !== -1) {
      const age = globalRecentIndexes.length - globalPos;
      weight += Math.max(0, Math.floor(age / 3));
    }

    const recentWindow = recentIndexes
      .slice(-8)
      .map((i) => images[i]?.difficulty)
      .filter(Boolean);

    const sameDifficultyCount = recentWindow.filter(
      (d) => d === img.difficulty
    ).length;

    if (sameDifficultyCount <= 1) {
      weight += 3;
    } else if (sameDifficultyCount >= 4) {
      weight -= 4;
    }

    return {
      index,
      weight: Math.max(1, weight),
    };
  });

  return weightedPickIndex(weighted, random);
}

function buildInitialRound(
  random: () => number,
  globalRecentIndexes: number[]
): RoundSeed {
  if (!hasImages(images)) {
    return { currentIndex: -1, nextIndex: -1 };
  }

  if (images.length === 1) {
    return { currentIndex: 0, nextIndex: 0 };
  }

  const first = pickNextIndex({
    excludeIndex: -1,
    difficulty: "easy",
    recentIndexes: [],
    globalRecentIndexes,
    lastType: undefined,
    lastCategory: undefined,
    random,
  });

  const firstImage = images[first];

  const second = pickNextIndex({
    excludeIndex: first,
    difficulty: "easy",
    recentIndexes: first >= 0 ? [first] : [],
    globalRecentIndexes,
    lastType: firstImage?.type,
    lastCategory: firstImage?.category,
    random,
  });

  return {
    currentIndex: first,
    nextIndex: second,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// UI
// ──────────────────────────────────────────────────────────────────────────────

function GamePreviewSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-pink-500/20 via-fuchsia-500/10 to-purple-500/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/80 p-5 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded-full bg-white/10" />
            <div className="h-7 w-16 rounded-full bg-white/10" />
          </div>
          <div className="h-72 rounded-[1.6rem] bg-white/5 sm:h-80" />
          <div className="h-2 rounded-full bg-white/10" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-14 rounded-2xl bg-white/8" />
            <div className="h-14 rounded-2xl bg-white/8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyGameState() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-red-500/15 via-orange-500/10 to-pink-500/15 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">
            No images found
          </div>
          <div className="mt-2 text-xl font-black text-white">
            Add some mock images first.
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            The game cannot start because the image dataset is empty.
          </p>
        </div>
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const styles: Record<Difficulty, string> = {
    easy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    hard: "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

function StreakCounter({
  score,
  bumped,
}: {
  score: number;
  bumped: boolean;
}) {
  const tier =
    score >= 15
      ? "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]"
      : score >= 8
        ? "text-fuchsia-300 drop-shadow-[0_0_6px_rgba(232,121,249,0.5)]"
        : score >= 4
          ? "text-pink-300"
          : "text-white";

  const emoji = score >= 15 ? "🔥" : score >= 8 ? "⚡" : score >= 4 ? "🎯" : "🔥";

  return (
    <div
      className={`shrink-0 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-sm font-black ${tier}`}
      style={{
        transform: bumped ? "scale(1.28)" : "scale(1)",
        transition: "transform 200ms cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {emoji} {score}
    </div>
  );
}

function TimerBar({
  progress,
  feedback,
  isPanic,
}: {
  progress: number;
  feedback: Feedback;
  isPanic: boolean;
}) {
  const color =
    feedback === "timeout"
      ? "from-red-500 to-orange-400"
      : feedback === "wrong"
        ? "from-red-500 to-pink-500"
        : feedback === "correct"
          ? "from-emerald-400 to-teal-400"
          : isPanic
            ? "from-red-500 to-orange-500"
            : progress > 60
              ? "from-pink-500 to-purple-500"
              : progress > 30
                ? "from-orange-400 to-pink-500"
                : "from-red-500 to-orange-400";

  const secondsLeft = Math.max(
    0,
    Math.ceil((progress / 100) * (ROUND_DURATION_MS / 1000))
  );

  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
          Decision timer
        </span>
        <span
          className={`text-[10px] font-black tabular-nums ${
            isPanic && !feedback ? "text-red-400" : "text-zinc-500"
          }`}
        >
          {secondsLeft}s
        </span>
      </div>

      <div
        className={`relative h-2 overflow-hidden rounded-full bg-white/8 ${
          isPanic && !feedback
            ? "animate-[timerPulse_0.45s_ease-in-out_infinite]"
            : ""
        }`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${progress}%` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_20%,rgba(255,255,255,0.10)_50%,transparent_80%)]" />
      </div>
    </div>
  );
}

function CardStack({ nextSrc }: { nextSrc?: string }) {
  return (
    <>
      <div
        className="absolute inset-0 rounded-[1.6rem] border border-white/5 bg-zinc-900"
        style={{ transform: "scale(0.90) translateY(10px)", zIndex: 0 }}
      />
      <div
        className="absolute inset-0 overflow-hidden rounded-[1.6rem] border border-white/8 bg-zinc-900"
        style={{ transform: "scale(0.95) translateY(5px)", zIndex: 1 }}
      >
        {nextSrc ? (
          <img
            src={nextSrc}
            alt=""
            className="pointer-events-none h-full w-full select-none object-cover opacity-25 blur-[3px]"
            draggable={false}
            loading="eager"
            decoding="async"
            onDragStart={(e) => e.preventDefault()}
          />
        ) : null}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────

function GamePreviewInner({ mode = "solo", onGameOver }: GamePreviewProps) {
  const rng = useCallback(() => Math.random(), []);  const [globalRecentHistory, setGlobalRecentHistory] = useState<number[]>(() =>
    loadGlobalRecentHistory()
  );
  const [avgReactionMsUi, setAvgReactionMsUi] = useState(0);
  const [didSetNewRecord, setDidSetNewRecord] = useState(false);

  const [initialRound] = useState<RoundSeed>(() =>
    buildInitialRound(rng, globalRecentHistory)
  );

  const avgReactionMsRef = useRef(0);
  const answersCountRef = useRef(0);
  const roundAnswerStartedAtRef = useRef(0);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => loadBestScore());
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [progress, setProgress] = useState(100);
  const [isLocked, setIsLocked] = useState(false);
  const [revealedType, setRevealedType] = useState<Answer | null>(null);
  const [streakBumped, setStreakBumped] = useState(false);
  const [cardExiting, setCardExiting] = useState<"left" | "right" | null>(null);
  const [cardEntering, setCardEntering] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(initialRound.currentIndex);
  const [nextIndex, setNextIndex] = useState(initialRound.nextIndex);

  const scoreRef = useRef(score);
  const bestRef = useRef(best);
  const isGameOverRef = useRef(isGameOver);
  const isLockedRef = useRef(isLocked);
  const correctAnswersRef = useRef(correctAnswers);
  const wrongAnswersRef = useRef(wrongAnswers);
  const currentIndexRef = useRef(currentIndex);
  const recentIndexesRef = useRef<number[]>([]);
  const submittedRef = useRef(false);
  const sessionStartRef = useRef(0);

  const rafRef = useRef<number | null>(null);
  const roundStartRef = useRef<number | null>(null);
  const lastTimerFrameRef = useRef(0);

  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pointerIdRef = useRef<number | null>(null);
  const pointerElementRef = useRef<HTMLDivElement | null>(null);
  const pointerStartXRef = useRef(0);
  const pointerStartYRef = useRef(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    bestRef.current = best;
  }, [best]);

  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  useEffect(() => {
    correctAnswersRef.current = correctAnswers;
  }, [correctAnswers]);

  useEffect(() => {
    wrongAnswersRef.current = wrongAnswers;
  }, [wrongAnswers]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const currentImage = currentIndex >= 0 ? images[currentIndex] : undefined;
  const nextImage = nextIndex >= 0 ? images[nextIndex] : undefined;
  const currentDifficulty = currentImage?.difficulty ?? "easy";

  const rotation = useMemo(
    () =>
      clamp(
        (dragX / MAX_DRAG_PX) * MAX_ROTATION_DEG,
        -MAX_ROTATION_DEG,
        MAX_ROTATION_DEG
      ),
    [dragX]
  );

  const remainingMs = (progress / 100) * ROUND_DURATION_MS;
  const isPanic = remainingMs < PANIC_THRESHOLD_MS && !feedback && !isGameOver;

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stopFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current !== null) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const stopEnterTimer = useCallback(() => {
    if (enterTimerRef.current !== null) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
  }, []);

  const stopBumpTimer = useCallback(() => {
    if (bumpTimerRef.current !== null) {
      clearTimeout(bumpTimerRef.current);
      bumpTimerRef.current = null;
    }
  }, []);

  const abortSubmit = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const clearAllTimers = useCallback(() => {
    stopRaf();
    stopFeedbackTimer();
    stopEnterTimer();
    stopBumpTimer();
  }, [stopBumpTimer, stopEnterTimer, stopFeedbackTimer, stopRaf]);

  const resetPointerState = useCallback(() => {
    const el = pointerElementRef.current;
    const pointerId = pointerIdRef.current;

    try {
      if (el && pointerId !== null && el.hasPointerCapture(pointerId)) {
        el.releasePointerCapture(pointerId);
      }
    } catch {
      // no-op
    }

    pointerElementRef.current = null;
    pointerIdRef.current = null;
    setDragX(0);
    setDragY(0);
    setIsDragging(false);
  }, []);

  const pushGlobalRecent = useCallback((index: number) => {
    if (index < 0) return;

    setGlobalRecentHistory((prev) => {
      const next = [...prev, index].slice(-GLOBAL_RECENT_HISTORY_SIZE);
      saveGlobalRecentHistory(next);
      return next;
    });
  }, []);

  const updateReactionAverage = useCallback(() => {
    if (!roundAnswerStartedAtRef.current) return;

    const reactionMs = Math.max(0, Math.round(nowMs() - roundAnswerStartedAtRef.current));
    answersCountRef.current += 1;

    let nextAvg = reactionMs;
    if (avgReactionMsRef.current !== 0) {
      nextAvg = Math.round(avgReactionMsRef.current * 0.78 + reactionMs * 0.22);
    }

    avgReactionMsRef.current = nextAvg;
    setAvgReactionMsUi(nextAvg);
  }, []);

  const buildNextRound = useCallback(
    (_nextScore: number) => {
      const current = images[currentIndexRef.current];

      const recent = [...recentIndexesRef.current, currentIndexRef.current].slice(
        -RECENT_HISTORY_SIZE
      );

      recentIndexesRef.current = recent;

      const nextCurrent = pickNextIndex({
        excludeIndex: currentIndexRef.current,
        difficulty: "easy",
        recentIndexes: recent,
        globalRecentIndexes: globalRecentHistory,
        lastType: current?.type,
        lastCategory: current?.category,
        random: rng,
      });

      const previewBase = [...recent, nextCurrent].slice(-RECENT_HISTORY_SIZE);
      const nextCurrentImage = images[nextCurrent];

      const nextNext = pickNextIndex({
        excludeIndex: nextCurrent,
        difficulty: "easy",
        recentIndexes: previewBase,
        globalRecentIndexes: globalRecentHistory,
        lastType: nextCurrentImage?.type,
        lastCategory: nextCurrentImage?.category,
        random: rng,
      });

      return {
        nextCurrent,
        nextNext,
      };
    },
    [globalRecentHistory, rng]
  );

  const preloadLookahead = useCallback(
    (baseScore: number) => {
      if (!currentImage) return;

      let tempExclude = currentIndexRef.current;
      let tempRecent = [...recentIndexesRef.current, currentIndexRef.current].slice(
        -RECENT_HISTORY_SIZE
      );
      let tempLastType = currentImage.type;
      let tempLastCategory = currentImage.category;

      const targetDifficulty = getAdaptiveDifficulty(
        baseScore,
        avgReactionMsRef.current
      );

      for (let i = 0; i < PRELOAD_BUFFER_SIZE; i += 1) {
        const idx = pickNextIndex({
          excludeIndex: tempExclude,
          difficulty: targetDifficulty,
          recentIndexes: tempRecent,
          globalRecentIndexes: globalRecentHistory,
          lastType: tempLastType,
          lastCategory: tempLastCategory,
          random: rng,
        });

        const img = images[idx];
        preloadImage(img?.src);

        if (idx >= 0) {
          tempRecent = [...tempRecent, idx].slice(-RECENT_HISTORY_SIZE);
          tempExclude = idx;
          tempLastType = img?.type;
          tempLastCategory = img?.category;
        }
      }
    },
    [currentImage, globalRecentHistory, rng]
  );

  const submitSession = useCallback(
    async (
      reason: EndReason,
      finalScore: number,
      finalCorrect: number,
      finalWrong: number
    ) => {
      if (submittedRef.current) return;
      if (typeof window === "undefined") return;

      submittedRef.current = true;
      setSubmitState("submitting");

      abortSubmit();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const guestToken = window.localStorage.getItem("spotfake_guest_token");
        const durationMs = Math.max(0, Math.round(nowMs() - sessionStartRef.current));
        const img = images[currentIndexRef.current];

        const response = await fetch("/api/game/session", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...(guestToken ? { "x-guest-token": guestToken } : {}),
          },
          body: JSON.stringify({
            mode,
            score: finalScore,
            streakReached: finalScore,
            correctAnswers: finalCorrect,
            wrongAnswers: finalWrong,
            timedOut: reason === "timeout",
            flawless: finalScore > 0 && finalWrong === 0 && reason !== "timeout",
            durationMs,
            difficultyReached: images[currentIndexRef.current]?.difficulty ?? "easy",
            category: img?.category ?? null,
            endedBy: reason,
            avgReactionMs: avgReactionMsRef.current || null,
          }),
        });

        if (!response.ok) {
          throw new Error("session save failed");
        }

        setSubmitState("submitted");
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        console.error("[session]", error);
        setSubmitState("error");
      } finally {
        abortControllerRef.current = null;
      }
    },
    [abortSubmit, mode]
  );

  const finishGame = useCallback(
    (reason: "wrong" | "timeout") => {
      if (isGameOverRef.current) return;

      clearAllTimers();
      isLockedRef.current = true;

      const finalScore = scoreRef.current;
      const finalCorrect = correctAnswersRef.current;
      const finalWrong =
        reason === "wrong" ? wrongAnswersRef.current + 1 : wrongAnswersRef.current;
      const img = images[currentIndexRef.current];
      const previousBest = bestRef.current;
      const isNewRecord = finalScore > previousBest;
      const nextBest = Math.max(previousBest, finalScore);

      haptic(reason === "wrong" ? [80, 30, 80] : [200]);

      setIsLocked(true);
      setFeedback(reason);
      setIsGameOver(true);
      setRevealedType(img?.type ?? null);
      setProgress(0);
      setDidSetNewRecord(isNewRecord);

      if (reason === "wrong") {
        setWrongAnswers(finalWrong);
      }

      resetPointerState();

      saveBestScore(nextBest);
      setBest(nextBest);

      onGameOver?.({
        streak: finalScore,
        score: finalScore,
        isNewRecord,
        flawless: finalScore > 0 && finalWrong === 0 && reason !== "timeout",
      });

      void submitSession(reason, finalScore, finalCorrect, finalWrong);
    },
    [clearAllTimers, onGameOver, resetPointerState, submitSession]
  );

  const advanceRound = useCallback(
    (nextScore: number) => {
      const { nextCurrent, nextNext } = buildNextRound(nextScore);

      setProgress(100);
      setFeedback(null);
      setRevealedType(null);

      isLockedRef.current = false;
      setIsLocked(false);

      resetPointerState();

      setCurrentIndex(nextCurrent);
      setNextIndex(nextNext);

      requestAnimationFrame(() => {
        setCardExiting(null);
        setCardEntering(true);

        stopEnterTimer();
        enterTimerRef.current = setTimeout(() => {
          setCardEntering(false);
        }, ENTER_ANIMATION_MS);
      });

      preloadLookahead(nextScore);
    },
    [buildNextRound, preloadLookahead, resetPointerState, stopEnterTimer]
  );

  const handleCorrectAnswer = useCallback(() => {
    clearAllTimers();
    updateReactionAverage();
    haptic(40);

    const nextScore = scoreRef.current + 1;

    isLockedRef.current = true;
    setIsLocked(true);
    setFeedback("correct");
    setRevealedType(images[currentIndexRef.current]?.type ?? null);
    setScore(nextScore);
    setCorrectAnswers((prev) => prev + 1);

    setStreakBumped(true);
    stopBumpTimer();
    bumpTimerRef.current = setTimeout(() => {
      setStreakBumped(false);
    }, BUMP_ANIMATION_MS);

    setBest((prev) => {
      const nextBest = Math.max(prev, nextScore);
      saveBestScore(nextBest);
      return nextBest;
    });

    setCardExiting(nextScore % 2 === 0 ? "right" : "left");
    pushGlobalRecent(currentIndexRef.current);

    stopFeedbackTimer();
    feedbackTimerRef.current = setTimeout(() => {
      advanceRound(nextScore);
    }, FEEDBACK_DELAY_MS);
  }, [
    advanceRound,
    clearAllTimers,
    pushGlobalRecent,
    stopBumpTimer,
    stopFeedbackTimer,
    updateReactionAverage,
  ]);

  const processAnswer = useCallback(
    (answer: Answer) => {
      const img = images[currentIndexRef.current];
      if (!img) return;
      if (isGameOverRef.current || isLockedRef.current) return;

      isLockedRef.current = true;

      if (img.type === answer) {
        handleCorrectAnswer();
      } else {
        pushGlobalRecent(currentIndexRef.current);
        finishGame("wrong");
      }
    },
    [finishGame, handleCorrectAnswer, pushGlobalRecent]
  );

  const commitSwipe = useCallback(
    (answer: Answer) => {
      if (isGameOverRef.current || isLockedRef.current) return;

      isLockedRef.current = true;
      setIsLocked(true);
      setCardExiting(answer === "real" ? "left" : "right");

      stopFeedbackTimer();
      feedbackTimerRef.current = setTimeout(() => {
        resetPointerState();
        processAnswer(answer);
      }, EXIT_ANIMATION_MS);
    },
    [processAnswer, resetPointerState, stopFeedbackTimer]
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (isGameOverRef.current || isLockedRef.current) return;
      if (e.button !== 0 && e.pointerType !== "touch" && e.pointerType !== "pen") {
        return;
      }

      pointerIdRef.current = e.pointerId;
      pointerElementRef.current = e.currentTarget;
      pointerStartXRef.current = e.clientX;
      pointerStartYRef.current = e.clientY;
      setIsDragging(true);

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // no-op
      }
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      if (pointerIdRef.current !== e.pointerId) return;

      const nextDragX = clamp(
        e.clientX - pointerStartXRef.current,
        -MAX_DRAG_PX,
        MAX_DRAG_PX
      );
      const nextDragY = clamp(
        (e.clientY - pointerStartYRef.current) * 0.18,
        -24,
        24
      );

      setDragX(nextDragX);
      setDragY(nextDragY);
    },
    [isDragging]
  );

  const handlePointerEnd = useCallback(
    (e?: ReactPointerEvent<HTMLDivElement>) => {
      if (e && pointerIdRef.current !== null) {
        try {
          if (e.currentTarget.hasPointerCapture(pointerIdRef.current)) {
            e.currentTarget.releasePointerCapture(pointerIdRef.current);
          }
        } catch {
          // no-op
        }
      }

      if (!isDragging) {
        resetPointerState();
        return;
      }

      if (dragX <= -SWIPE_TRIGGER_PX) {
        commitSwipe("real");
        return;
      }

      if (dragX >= SWIPE_TRIGGER_PX) {
        commitSwipe("fake");
        return;
      }

      resetPointerState();
    },
    [commitSwipe, dragX, isDragging, resetPointerState]
  );

  const handleProtectedContextMenu = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const handleProtectedDragStart = useCallback(
    (e: ReactDragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const handleProtectedCopy = useCallback(
    (e: ReactClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const handleProtectedCut = useCallback(
    (e: ReactClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const handleProtectedPaste = useCallback(
    (e: ReactClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const handleProtectedMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    []
  );

  const handleRestart = useCallback(() => {
    clearAllTimers();
    abortSubmit();
    resetPointerState();

    recentIndexesRef.current = [];
    submittedRef.current = false;
    sessionStartRef.current = nowMs();
    avgReactionMsRef.current = 0;
    answersCountRef.current = 0;
    roundAnswerStartedAtRef.current = 0;
    setAvgReactionMsUi(0);
    setDidSetNewRecord(false);

    const fresh = buildInitialRound(rng, globalRecentHistory);

    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);

    isLockedRef.current = false;
    setIsLocked(false);
    setIsGameOver(false);
    setFeedback(null);
    setRevealedType(null);
    setProgress(100);
    setSubmitState("idle");
    setCardExiting(null);
    setCardEntering(false);
    setStreakBumped(false);

    setCurrentIndex(fresh.currentIndex);
    setNextIndex(fresh.nextIndex);
  }, [
    abortSubmit,
    clearAllTimers,
    globalRecentHistory,
    resetPointerState,
    rng,
  ]);

  useEffect(() => {
    sessionStartRef.current = nowMs();
  }, []);

  useEffect(() => {
    preloadImage(nextImage?.src);
    preloadLookahead(score);
  }, [nextImage?.src, preloadLookahead, score]);

  useEffect(() => {
    if (!currentImage) return;
    if (isGameOver || isLocked) return;

    roundStartRef.current = nowMs();
    roundAnswerStartedAtRef.current = nowMs();
    lastTimerFrameRef.current = 0;

    const tick = (now: number) => {
      if (isGameOverRef.current || isLockedRef.current) return;
      if (roundStartRef.current === null) return;

      const elapsed = now - roundStartRef.current;
      const progressValue = clamp(
        100 - (elapsed / ROUND_DURATION_MS) * 100,
        0,
        100
      );

      if (
        lastTimerFrameRef.current === 0 ||
        now - lastTimerFrameRef.current >= TIMER_FPS_LIMIT_MS ||
        progressValue === 0
      ) {
        setProgress(progressValue);
        lastTimerFrameRef.current = now;
      }

      if (elapsed >= ROUND_DURATION_MS) {
        pushGlobalRecent(currentIndexRef.current);
        finishGame("timeout");
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return stopRaf;
  }, [currentImage, finishGame, isGameOver, isLocked, pushGlobalRecent, stopRaf]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (isTypingTarget(e.target)) return;

      const protectedTarget =
        e.target instanceof HTMLElement &&
        e.target.closest("[data-spotfake-protected='true']");

      if (
        protectedTarget &&
        (e.ctrlKey || e.metaKey) &&
        ["s", "u", "c", "x", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowLeft") {
        processAnswer("real");
        return;
      }

      if (e.key === "ArrowRight") {
        processAnswer("fake");
        return;
      }

      if (e.key === "Enter" && isGameOverRef.current) {
        handleRestart();
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("[data-spotfake-protected='true']")) {
        e.preventDefault();
      }
    };

    const onDragStart = (e: DragEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("[data-spotfake-protected='true']")) {
        e.preventDefault();
      }
    };

    const onSelectStart = (e: Event) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("[data-spotfake-protected='true']")) {
        e.preventDefault();
      }
    };

    const onCopy = (e: ClipboardEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("[data-spotfake-protected='true']")) {
        e.preventDefault();
      }
    };

    const onCut = (e: ClipboardEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("[data-spotfake-protected='true']")) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("dragstart", onDragStart);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
    };
  }, [handleRestart, processAnswer]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      abortSubmit();
      resetPointerState();
    };
  }, [abortSubmit, clearAllTimers, resetPointerState]);

  const statusText = useMemo(() => {
    if (feedback === "correct") return "Correct.";
    if (feedback === "wrong") return "Wrong call.";
    if (feedback === "timeout") return "Too slow.";
    if (isGameOver) return "Run ended.";
    if (isPanic) return "Decide now.";
    return "Real or Fake?";
  }, [feedback, isGameOver, isPanic]);

  const panelBorder = useMemo(() => {
    if (feedback === "correct") {
      return "border-emerald-400/50 shadow-[0_0_0_1px_rgba(52,211,153,0.12),0_0_48px_rgba(52,211,153,0.07)]";
    }

    if (feedback === "wrong" || feedback === "timeout") {
      return "border-red-400/50 shadow-[0_0_0_1px_rgba(248,113,113,0.12),0_0_48px_rgba(248,113,113,0.07)]";
    }

    if (isPanic) {
      return "border-orange-500/40 shadow-[0_0_0_1px_rgba(249,115,22,0.10)]";
    }

    return "border-white/10";
  }, [feedback, isPanic]);

  const cardTransform = useMemo(() => {
    if (cardExiting === "left") {
      return "translate3d(-280px,-22px,0) rotate(-20deg)";
    }

    if (cardExiting === "right") {
      return "translate3d(280px,-22px,0) rotate(20deg)";
    }

    if (cardEntering) {
      return "scale(0.93) translateY(10px)";
    }

    return `translate3d(${dragX}px,${dragY}px,0) rotate(${rotation}deg)`;
  }, [cardEntering, cardExiting, dragX, dragY, rotation]);

  const cardTransition = useMemo(() => {
    if (cardExiting) {
      return "transform 210ms cubic-bezier(0.4,0,1,1), opacity 210ms ease";
    }

    if (cardEntering) {
      return "transform 260ms cubic-bezier(0.16,1,0.3,1), opacity 260ms ease";
    }

    if (isDragging) {
      return "none";
    }

    return "transform 180ms cubic-bezier(0.22,1,0.36,1)";
  }, [cardEntering, cardExiting, isDragging]);

  const isNewRecordAtGameOver = isGameOver && didSetNewRecord;

  if (!currentImage) {
    return <EmptyGameState />;
  }

  return (
    <>
      <style>{`
        @keyframes timerPulse {
          0%,100% { opacity:1; }
          50% { opacity:0.30; }
        }
        @keyframes feedbackIn {
          from { opacity:0; transform:translateY(6px) scale(0.96); }
          to { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes newRecord {
          0% { transform:scale(1); }
          40% { transform:scale(1.12); }
          100% { transform:scale(1); }
        }
      `}</style>

      <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
        <div
          className={`absolute -inset-6 rounded-[2.5rem] blur-2xl transition-all duration-500 ${
            feedback === "correct"
              ? "bg-gradient-to-br from-emerald-500/22 via-teal-500/10 to-emerald-500/22"
              : feedback === "wrong" || feedback === "timeout"
                ? "bg-gradient-to-br from-red-500/22 via-pink-500/10 to-red-500/22"
                : isPanic
                  ? "bg-gradient-to-br from-orange-500/20 via-red-500/10 to-pink-500/18"
                  : "bg-gradient-to-br from-pink-500/20 via-fuchsia-500/10 to-purple-500/20"
          }`}
        />

        <div
          className={`relative overflow-hidden rounded-[2rem] border bg-zinc-900/80 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 sm:p-5 ${panelBorder}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_26%)]" />

          <div className="relative">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-600">
                  {mode} mode
                </div>

                <div
                  className={`mt-1 text-lg font-black tracking-tight transition-colors duration-200 sm:text-xl ${
                    feedback === "correct"
                      ? "text-emerald-300"
                      : feedback === "wrong" || feedback === "timeout"
                        ? "text-red-300"
                        : isPanic
                          ? "text-orange-300"
                          : "text-white"
                  }`}
                >
                  {statusText}
                </div>
              </div>

              <StreakCounter score={score} bumped={streakBumped} />
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <DifficultyBadge difficulty={currentDifficulty} />

              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {currentImage.category}
              </span>

              <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                ← Real · Fake →
              </span>
            </div>

            <div className="relative" style={{ zIndex: 2 }}>
              <CardStack nextSrc={nextImage?.src} />

              <div
                className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-zinc-950"
                style={{ zIndex: 3 }}
                data-spotfake-protected="true"
                onContextMenu={handleProtectedContextMenu}
                onDragStart={handleProtectedDragStart}
                onCopy={handleProtectedCopy}
                onCut={handleProtectedCut}
                onPaste={handleProtectedPaste}
                onMouseDown={handleProtectedMouseDown}
              >
                <div
                  key={currentIndex}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                  className="relative cursor-grab select-none active:cursor-grabbing"
                  style={{
                    touchAction: "pan-y",
                    transform: cardTransform,
                    transition: cardTransition,
                    opacity: cardExiting ? 0 : 1,
                    WebkitUserSelect: "none",
                    userSelect: "none",
                    WebkitTouchCallout: "none",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    willChange: "transform, opacity",
                  }}
                >
                  <img
                    src={currentImage.src}
                    alt={currentImage.alt}
                    className={`pointer-events-none h-72 w-full select-none object-cover transition-[filter,transform] duration-300 sm:h-80 ${
                      feedback === "correct"
                        ? "scale-[1.01] brightness-110"
                        : feedback === "wrong" || feedback === "timeout"
                          ? "scale-[1.02] brightness-75 saturate-50"
                          : "scale-100"
                    }`}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "translateZ(0)",
                    }}
                  />

                  <div className="pointer-events-none absolute inset-0">
                    <div
                      className="absolute left-3 top-3 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.24em]"
                      style={{
                        opacity: Math.max(0, (-dragX - 16) / 70),
                        borderColor: "rgba(255,255,255,0.95)",
                        background: "rgba(255,255,255,0.90)",
                        color: "#000",
                        transform: `scale(${1 + Math.max(0, (-dragX - 16) / 700)})`,
                      }}
                    >
                      REAL ✓
                    </div>

                    <div
                      className="absolute right-3 top-3 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.24em]"
                      style={{
                        opacity: Math.max(0, (dragX - 16) / 70),
                        borderColor: "rgba(236,72,153,0.95)",
                        background: "rgba(236,72,153,0.90)",
                        color: "#fff",
                        transform: `scale(${1 + Math.max(0, (dragX - 16) / 700)})`,
                      }}
                    >
                      FAKE ✗
                    </div>

                    <div
                      className="absolute inset-0"
                      style={{
                        opacity: Math.min(0.14, Math.abs(dragX) / MAX_DRAG_PX),
                        background:
                          dragX < 0 ? "rgba(255,255,255,1)" : "rgba(236,72,153,1)",
                      }}
                    />

                    {feedback === "correct" && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-emerald-500/18"
                        style={{ animation: "feedbackIn 0.18s ease" }}
                      >
                        <div className="rounded-full bg-emerald-400/92 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/30">
                          ✓ {currentImage.type.toUpperCase()}
                        </div>
                      </div>
                    )}

                    {(feedback === "wrong" || feedback === "timeout") && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-red-500/18"
                        style={{ animation: "feedbackIn 0.18s ease" }}
                      >
                        <div className="rounded-full bg-red-500/92 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-red-500/30">
                          {feedback === "timeout" ? "⏱ TIME" : "✗"} —{" "}
                          {currentImage.type.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <TimerBar progress={progress} feedback={feedback} isPanic={isPanic} />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => processAnswer("real")}
                disabled={isGameOver || isLocked}
                className="group rounded-[1.35rem] border border-white/10 bg-zinc-800 px-4 py-4 text-left transition-all duration-150 hover:scale-[1.02] hover:border-white/20 hover:bg-zinc-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500 transition group-hover:text-zinc-400">
                  ← Arrow left
                </div>
                <div className="mt-1 text-lg font-black tracking-wide text-white">
                  REAL
                </div>
              </button>

              <button
                onClick={() => processAnswer("fake")}
                disabled={isGameOver || isLocked}
                className="group rounded-[1.35rem] bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-4 text-left text-white shadow-lg shadow-pink-500/20 transition-all duration-150 hover:scale-[1.02] hover:shadow-pink-500/35 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-pink-100/70">
                  Arrow right →
                </div>
                <div className="mt-1 text-lg font-black tracking-wide">FAKE</div>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                {
                  label: "Streak",
                  value: score,
                  color: score > 0 ? "text-pink-300" : "text-white",
                },
                {
                  label: "Best",
                  value: best,
                  color: best > 0 ? "text-yellow-300" : "text-white",
                },
                {
                  label: "Right",
                  value: correctAnswers,
                  color: "text-emerald-300",
                },
                {
                  label: "Answer",
                  value: revealedType ?? "—",
                  color: "text-zinc-300",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/8 bg-white/[0.032] p-3 text-center"
                >
                  <div className="text-[9px] uppercase tracking-widest text-zinc-600">
                    {label}
                  </div>
                  <div className={`mt-1 text-base font-black capitalize ${color}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 overflow-hidden rounded-[1.4rem] border border-white/8 bg-white/[0.028]">
              {isGameOver ? (
                <div
                  className="p-5 text-center"
                  style={{ animation: "feedbackIn 0.3s ease" }}
                >
                  <div className="text-sm font-bold text-zinc-200">
                    {feedback === "timeout"
                      ? `Ran out of time — it was ${currentImage.type.toUpperCase()}.`
                      : `Wrong call — it was ${currentImage.type.toUpperCase()}.`}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-600">
                    <span>
                      Streak <span className="font-black text-white">{score}</span>
                    </span>
                    <span>·</span>
                    <span>
                      Best{" "}
                      <span
                        className={`font-black ${
                          isNewRecordAtGameOver ? "text-yellow-300" : "text-white"
                        }`}
                      >
                        {best}
                      </span>
                    </span>
                    <span>·</span>
                    <span
                      className={
                        submitState === "submitted"
                          ? "font-bold text-emerald-400"
                          : submitState === "error"
                            ? "font-bold text-red-400"
                            : "text-zinc-600"
                      }
                    >
                      {submitState === "submitting"
                        ? "Saving…"
                        : submitState === "submitted"
                          ? "Saved ✓"
                          : submitState === "error"
                            ? "Save failed"
                            : "Pending"}
                    </span>
                  </div>

                  {isNewRecordAtGameOver && (
                    <div
                      className="mt-2 text-[11px] font-black uppercase tracking-[0.2em] text-yellow-400"
                      style={{ animation: "newRecord 0.5s ease" }}
                    >
                      ✨ New record!
                    </div>
                  )}

                  <button
                    onClick={handleRestart}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 px-7 py-3 text-sm font-black text-white shadow-lg shadow-pink-500/25 transition hover:scale-[1.04] active:scale-[0.97]"
                  >
                    <span>🎯</span>
                    <span>Play again</span>
                    <kbd className="ml-1 rounded-full border border-white/20 bg-white/10 px-1.5 py-0.5 text-[9px] font-black tracking-wide">
                      ENTER
                    </kbd>
                  </button>
                </div>
              ) : feedback === "correct" ? (
                <div className="p-4" style={{ animation: "feedbackIn 0.2s ease" }}>
                  <div className="text-sm font-bold text-emerald-300">Correct.</div>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Streak {score}
                    {score >= 4 ? " — difficulty rising." : " — keep going."}
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    How to play
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                    Swipe or tap — <span className="font-semibold text-white">Real</span>{" "}
                    or <span className="font-semibold text-pink-300">Fake</span>.
                    One mistake ends your streak. Difficulty scales with score.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────────────────────────────────────

export default function GamePreview(props: GamePreviewProps) {
  const isClient = useSyncExternalStore(
    subscribeToClientReady,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isClient) return <GamePreviewSkeleton />;
  if (!hasImages(images)) return <EmptyGameState />;

  return <GamePreviewInner {...props} />;
}
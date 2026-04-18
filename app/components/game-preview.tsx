"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { mockImages } from "@/app/lib/mock-images";

type Answer = "real" | "fake";
type Feedback = "correct" | "wrong" | "timeout" | null;
type Difficulty = "easy" | "medium" | "hard";
type GameMode = "solo" | "ranked" | "tournament";
type EndReason = "wrong" | "timeout" | "completed" | "quit";
type ImageCategory = "faces" | "landscapes" | "objects" | "animals" | "scenes";

type GamePreviewProps = {
  mode?: GameMode;
};

const ROUND_DURATION_MS = 3000;
const FEEDBACK_DELAY_MS = 600;
const BEST_SCORE_KEY = "spotfake-best-score";

const SWIPE_TRIGGER_PX = 110;
const MAX_DRAG_PX = 180;
const MAX_ROTATION_DEG = 14;

function subscribeToClientReady() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function loadBestScoreSafe() {
  try {
    const stored = window.localStorage.getItem(BEST_SCORE_KEY);
    if (!stored) return 0;

    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function getDifficultyFromScore(score: number): Difficulty {
  if (score >= 8) return "hard";
  if (score >= 4) return "medium";
  return "easy";
}

function pickRandomIndex(
  excludeIndex?: number,
  difficulty?: Difficulty,
  recentIndexes: number[] = []
) {
  let pool = mockImages
    .map((image, index) => ({ image, index }))
    .filter(({ index }) => index !== excludeIndex)
    .filter(({ index }) => !recentIndexes.includes(index));

  if (difficulty) {
    const filteredByDifficulty = pool.filter(
      ({ image }) => image.difficulty === difficulty
    );

    if (filteredByDifficulty.length > 0) {
      pool = filteredByDifficulty;
    }
  }

  if (pool.length === 0) {
    pool = mockImages
      .map((image, index) => ({ image, index }))
      .filter(({ index }) => index !== excludeIndex);
  }

  if (pool.length === 0) return 0;

  const selected = pool[Math.floor(Math.random() * pool.length)];
  return selected.index;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function GamePreviewSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-pink-500/20 via-fuchsia-500/10 to-purple-500/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/80 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-5">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-40 rounded bg-white/10" />
          <div className="mb-4 h-72 rounded-[1.6rem] bg-white/5 sm:h-80" />
          <div className="h-2.5 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function GamePreviewInner({ mode = "solo" }: GamePreviewProps) {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => loadBestScoreSafe());
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [progress, setProgress] = useState(100);
  const [isLocked, setIsLocked] = useState(false);
  const [revealedType, setRevealedType] = useState<Answer | null>(null);
  const [currentIndex, setCurrentIndex] = useState(() =>
    pickRandomIndex(undefined, "easy")
  );
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "submitted" | "error"
  >("idle");

  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const roundStartedAtRef = useRef<number | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pointerIdRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const pointerStartYRef = useRef(0);

  const recentIndexesRef = useRef<number[]>([]);
  const submittedSessionRef = useRef(false);

  const currentImage = useMemo(() => mockImages[currentIndex], [currentIndex]);
  const currentDifficulty = useMemo(
    () => getDifficultyFromScore(score),
    [score]
  );

  const swipeDirection = useMemo<Answer | null>(() => {
    if (dragX <= -32) return "real";
    if (dragX >= 32) return "fake";
    return null;
  }, [dragX]);

  const rotation = useMemo(() => {
    return clamp(
      (dragX / MAX_DRAG_PX) * MAX_ROTATION_DEG,
      -MAX_ROTATION_DEG,
      MAX_ROTATION_DEG
    );
  }, [dragX]);

  const clearTimers = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (feedbackTimeoutRef.current !== null) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  }, []);

  const saveBestScore = useCallback((value: number) => {
    try {
      window.localStorage.setItem(BEST_SCORE_KEY, String(value));
    } catch {
      // no-op
    }
  }, []);

  const resetDrag = useCallback(() => {
    setDragX(0);
    setDragY(0);
    setIsDragging(false);
    pointerIdRef.current = null;
  }, []);

  const updateRecentIndexes = useCallback((index: number) => {
    const nextRecent = [...recentIndexesRef.current, index].slice(-4);
    recentIndexesRef.current = nextRecent;
    return nextRecent;
  }, []);

  const submitSession = useCallback(
    async (reason: EndReason, finalWrongAnswers: number) => {
      if (submittedSessionRef.current) return;
      submittedSessionRef.current = true;
      setSubmitState("submitting");

      try {
        const guestToken = window.localStorage.getItem("spotfake_guest_token");

        const durationMs =
          sessionStartedAtRef.current !== null
            ? Math.max(
                0,
                Math.round(performance.now() - sessionStartedAtRef.current)
              )
            : 0;

        const payload = {
          mode,
          score,
          streakReached: score,
          correctAnswers,
          wrongAnswers: finalWrongAnswers,
          timedOut: reason === "timeout",
          flawless:
            score > 0 && finalWrongAnswers === 0 && reason !== "timeout",
          durationMs,
          difficultyReached: currentDifficulty,
          category: currentImage.category as ImageCategory,
          endedBy: reason,
        };

        const response = await fetch("/api/game/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(guestToken ? { "x-guest-token": guestToken } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to save game session");
        }

        setSubmitState("submitted");
      } catch (error) {
        console.error("submit session error:", error);
        setSubmitState("error");
      }
    },
    [mode, score, correctAnswers, currentDifficulty, currentImage.category]
  );

  const finishGame = useCallback(
    (reason: "wrong" | "timeout") => {
      clearTimers();
      resetDrag();

      const finalWrongAnswers =
        reason === "wrong" ? wrongAnswers + 1 : wrongAnswers;

      setIsLocked(true);
      setFeedback(reason);
      setIsGameOver(true);
      setRevealedType(currentImage.type);
      setProgress(0);

      if (reason === "wrong") {
        setWrongAnswers(finalWrongAnswers);
      }

      setBest((prevBest) => {
        const nextBest = Math.max(prevBest, score);
        saveBestScore(nextBest);
        return nextBest;
      });

      void submitSession(reason, finalWrongAnswers);
    },
    [
      clearTimers,
      currentImage.type,
      resetDrag,
      wrongAnswers,
      score,
      saveBestScore,
      submitSession,
    ]
  );

  const startRoundTimer = useCallback(() => {
    clearTimers();
    roundStartedAtRef.current = performance.now();

    const tick = (now: number) => {
      if (roundStartedAtRef.current === null || isGameOver || isLocked) return;

      const elapsed = now - roundStartedAtRef.current;
      const nextProgress = Math.max(
        0,
        100 - (elapsed / ROUND_DURATION_MS) * 100
      );

      setProgress(nextProgress);

      if (elapsed >= ROUND_DURATION_MS) {
        finishGame("timeout");
        return;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [clearTimers, finishGame, isGameOver, isLocked]);

  const goToNextRound = useCallback(
    (nextScore: number) => {
      const nextDifficulty = getDifficultyFromScore(nextScore);
      const nextRecent = updateRecentIndexes(currentIndex);

      setCurrentIndex((prevIndex) =>
        pickRandomIndex(prevIndex, nextDifficulty, nextRecent)
      );

      setFeedback(null);
      setRevealedType(null);
      setIsLocked(false);
      setProgress(100);
      resetDrag();
    },
    [currentIndex, resetDrag, updateRecentIndexes]
  );

  const handleCorrectAnswer = useCallback(() => {
    clearTimers();
    setIsLocked(true);
    setFeedback("correct");
    setRevealedType(currentImage.type);

    const nextScore = score + 1;
    setScore(nextScore);
    setCorrectAnswers((prev) => prev + 1);

    if (nextScore > best) {
      setBest(nextScore);
      saveBestScore(nextScore);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      goToNextRound(nextScore);
    }, FEEDBACK_DELAY_MS);
  }, [
    best,
    clearTimers,
    currentImage.type,
    goToNextRound,
    saveBestScore,
    score,
  ]);

  const processAnswer = useCallback(
    (answer: Answer, bypassLock = false) => {
      if ((!bypassLock && (isGameOver || isLocked)) || !currentImage) return;

      const isCorrect = currentImage.type === answer;

      if (isCorrect) {
        handleCorrectAnswer();
        return;
      }

      finishGame("wrong");
    },
    [currentImage, finishGame, handleCorrectAnswer, isGameOver, isLocked]
  );

  const handleAnswer = useCallback(
    (answer: Answer) => {
      processAnswer(answer);
    },
    [processAnswer]
  );

  const handleRestart = useCallback(() => {
    clearTimers();
    resetDrag();
    recentIndexesRef.current = [];
    submittedSessionRef.current = false;

    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setIsGameOver(false);
    setFeedback(null);
    setRevealedType(null);
    setIsLocked(false);
    setProgress(100);
    setSubmitState("idle");
    setCurrentIndex(pickRandomIndex(undefined, "easy"));

    sessionStartedAtRef.current = performance.now();
  }, [clearTimers, resetDrag]);

  const commitSwipe = useCallback(
    (answer: Answer) => {
      if (isGameOver || isLocked) return;

      setIsLocked(true);
      setDragX(answer === "fake" ? 220 : -220);
      setDragY(-8);

      feedbackTimeoutRef.current = setTimeout(() => {
        resetDrag();
        setIsLocked(false);
        processAnswer(answer, true);
      }, 110);
    },
    [isGameOver, isLocked, processAnswer, resetDrag]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (isGameOver || isLocked) return;

      pointerIdRef.current = event.pointerId;
      pointerStartXRef.current = event.clientX;
      pointerStartYRef.current = event.clientY;

      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [isGameOver, isLocked]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || pointerIdRef.current !== event.pointerId) return;

      const deltaX = event.clientX - pointerStartXRef.current;
      const deltaY = event.clientY - pointerStartYRef.current;

      setDragX(clamp(deltaX, -MAX_DRAG_PX, MAX_DRAG_PX));
      setDragY(clamp(deltaY * 0.18, -24, 24));
    },
    [isDragging]
  );

  const handlePointerEnd = useCallback(() => {
    if (!isDragging) return;

    if (dragX <= -SWIPE_TRIGGER_PX) {
      commitSwipe("real");
      return;
    }

    if (dragX >= SWIPE_TRIGGER_PX) {
      commitSwipe("fake");
      return;
    }

    resetDrag();
  }, [commitSwipe, dragX, isDragging, resetDrag]);

  useEffect(() => {
    sessionStartedAtRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (!isGameOver && !isLocked) {
      startRoundTimer();
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentIndex, isGameOver, isLocked, startRoundTimer]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      if (event.key === "ArrowLeft") {
        handleAnswer("real");
      } else if (event.key === "ArrowRight") {
        handleAnswer("fake");
      } else if (event.key === "Enter" && isGameOver) {
        handleRestart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleAnswer, handleRestart, isGameOver]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const statusText = useMemo(() => {
    if (feedback === "correct") return "Correct.";
    if (feedback === "wrong") return "Wrong choice.";
    if (feedback === "timeout") return "Too slow.";
    if (isGameOver) return "Game over";
    return "You have 3 seconds. Real or Fake?";
  }, [feedback, isGameOver]);

  const panelBorderClass =
    feedback === "correct"
      ? "border-emerald-400/60 shadow-[0_0_0_1px_rgba(52,211,153,0.14)]"
      : feedback === "wrong" || feedback === "timeout"
      ? "border-red-400/60 shadow-[0_0_0_1px_rgba(248,113,113,0.14)]"
      : "border-white/10";

  const progressBarClass =
    feedback === "timeout"
      ? "from-red-500 to-orange-400"
      : feedback === "wrong"
      ? "from-red-500 to-pink-500"
      : feedback === "correct"
      ? "from-emerald-400 to-teal-400"
      : "from-pink-500 to-purple-500";

  const cardClassName = `relative overflow-hidden rounded-[2rem] border bg-zinc-900/80 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-300 sm:p-5 ${panelBorderClass}`;
  const progressClassName = `h-full rounded-full bg-gradient-to-r ${progressBarClass} transition-[width] duration-75`;
  const imageClassName = `h-72 w-full object-cover transition duration-300 sm:h-80 ${
    feedback === "correct"
      ? "scale-[1.01]"
      : feedback === "wrong" || feedback === "timeout"
      ? "scale-[1.02] opacity-90"
      : "scale-100"
  }`;

  const resultText =
    feedback === "timeout"
      ? `You ran out of time on a ${currentImage.type} image.`
      : `You lost on a ${currentImage.type} image.`;

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-pink-500/20 via-fuchsia-500/10 to-purple-500/20 blur-2xl" />

      <div className={cardClassName}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%)]" />

        <div className="relative">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                {mode} mode
              </div>
              <div className="mt-1 text-lg font-black tracking-tight sm:text-xl">
                {statusText}
              </div>
            </div>

            <div className="shrink-0 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-sm font-semibold text-pink-200">
              Streak {score} 🔥
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Difficulty: {currentDifficulty}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Category: {currentImage.category}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Swipe left = Real
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Swipe right = Fake
            </span>
          </div>

          <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-zinc-950">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              className="relative cursor-grab active:cursor-grabbing"
              style={{
                touchAction: "pan-y",
                transform: `translate3d(${dragX}px, ${dragY}px, 0) rotate(${rotation}deg)`,
                transition: isDragging
                  ? "none"
                  : "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <img
                src={currentImage.src}
                alt={currentImage.alt}
                className={imageClassName}
                draggable={false}
              />

              <div className="pointer-events-none absolute inset-0">
                <div
                  className={`absolute left-4 top-4 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.24em] transition-all duration-150 ${
                    swipeDirection === "real"
                      ? "border-white bg-white/90 text-black opacity-100"
                      : "border-white/20 bg-black/30 text-white/70 opacity-70"
                  }`}
                >
                  REAL
                </div>

                <div
                  className={`absolute right-4 top-4 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.24em] transition-all duration-150 ${
                    swipeDirection === "fake"
                      ? "border-pink-300 bg-pink-500/90 text-white opacity-100"
                      : "border-white/20 bg-black/30 text-white/70 opacity-70"
                  }`}
                >
                  FAKE
                </div>

                <div
                  className={`absolute inset-0 transition-opacity duration-150 ${
                    swipeDirection === "real"
                      ? "bg-white/10 opacity-100"
                      : swipeDirection === "fake"
                      ? "bg-pink-500/12 opacity-100"
                      : "opacity-0"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>Decision timer</span>
              <span>{Math.max(0, Math.ceil((progress / 100) * 3))}s</span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={progressClassName}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAnswer("real")}
              disabled={isGameOver || isLocked}
              className="group rounded-[1.35rem] border border-white/10 bg-zinc-800 px-4 py-4 text-left transition hover:scale-[1.02] hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 transition group-hover:text-zinc-400">
                Arrow left
              </div>
              <div className="mt-1 text-lg font-black tracking-wide text-white">
                REAL
              </div>
            </button>

            <button
              onClick={() => handleAnswer("fake")}
              disabled={isGameOver || isLocked}
              className="group rounded-[1.35rem] bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-4 text-left text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-pink-100/80">
                Arrow right
              </div>
              <div className="mt-1 text-lg font-black tracking-wide">
                FAKE
              </div>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-zinc-500">Score</div>
              <div className="mt-1 text-lg font-black">{score}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-zinc-500">Best</div>
              <div className="mt-1 text-lg font-black">{best}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-zinc-500">Correct</div>
              <div className="mt-1 text-lg font-black">{correctAnswers}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-zinc-500">Answer</div>
              <div className="mt-1 text-lg font-black capitalize">
                {revealedType ?? "???"}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
            {isGameOver ? (
              <div className="text-center">
                <div className="text-sm font-semibold text-zinc-200 capitalize">
                  {resultText}
                </div>

                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Close enough to sting. Good enough to try again.
                </p>

                <div className="mt-3 text-xs text-zinc-500">
                  Save status:{" "}
                  {submitState === "submitting" && "Saving..."}
                  {submitState === "submitted" && "Saved"}
                  {submitState === "error" && "Save failed"}
                  {submitState === "idle" && "Pending"}
                </div>

                <button
                  onClick={handleRestart}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.02]"
                >
                  PLAY AGAIN
                </button>
              </div>
            ) : feedback === "correct" ? (
              <div>
                <div className="text-sm font-semibold text-emerald-300">
                  Correct.
                </div>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Nice read. The next one might be harder.
                </p>
              </div>
            ) : (
              <div>
                <div className="text-sm font-semibold text-zinc-300">
                  How to play
                </div>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Swipe the card like Tinder, use the buttons, or use your
                  keyboard. Difficulty rises with your streak, and one mistake
                  ends the run.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePreview(props: GamePreviewProps) {
  const isClient = useSyncExternalStore(
    subscribeToClientReady,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isClient) {
    return <GamePreviewSkeleton />;
  }

  return <GamePreviewInner {...props} />;
}
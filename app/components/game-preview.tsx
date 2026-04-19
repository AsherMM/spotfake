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
import {
  BUMP_ANIMATION_MS,
  ENTER_ANIMATION_MS,
  EXIT_ANIMATION_MS,
  FEEDBACK_DELAY_MS,
  PANIC_THRESHOLD_MS,
  ROUND_DURATION_MS,
  TIMER_FPS_LIMIT_MS,
} from "@/app/components/game-preview.constants";
import type {
  Answer,
  Feedback,
  GamePreviewProps,
  MockImage,
  SubmitState,
} from "@/app/components/game-preview.types";
import {
  getClientSnapshot,
  getServerSnapshot,
  haptic,
  hasImages,
  loadBestScore,
  nowMs,
  preloadImage,
  saveBestScore,
  subscribeToClientReady,
} from "@/app/components/game-preview.utils";
import { useGameRandomizer } from "@/app/components/hooks/use-game-randomizer";
import { useRoundTimer } from "@/app/components/hooks/use-round-timer";
import { useSpotfakeProtection } from "@/app/components/hooks/use-spotfake-protection";
import { useSwipeControls } from "@/app/components/hooks/use-swipe-controls";

const images = mockImages as MockImage[];

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

function DifficultyBadge({ difficulty }: { difficulty: MockImage["difficulty"] }) {
  const styles: Record<MockImage["difficulty"], string> = {
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
  const {
    buildInitialRound,
    buildNextRound,
    preloadLookahead,
    pushGlobalRecent,
    resetRandomizer,
  } = useGameRandomizer({ images });

  const [initialRound] = useState(() => buildInitialRound());

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => loadBestScore());
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [revealedType, setRevealedType] = useState<Answer | null>(null);
  const [streakBumped, setStreakBumped] = useState(false);
  const [cardExiting, setCardExiting] = useState<"left" | "right" | null>(null);
  const [cardEntering, setCardEntering] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const [currentIndex, setCurrentIndex] = useState(initialRound.currentIndex);
  const [nextIndex, setNextIndex] = useState(initialRound.nextIndex);

  const scoreRef = useRef(score);
  const isGameOverRef = useRef(isGameOver);
  const isLockedRef = useRef(isLocked);
  const correctAnswersRef = useRef(correctAnswers);
  const wrongAnswersRef = useRef(wrongAnswers);
  const currentIndexRef = useRef(currentIndex);

  const submittedRef = useRef(false);
  const sessionStartRef = useRef(0);
  const avgReactionMsRef = useRef(0);
  const roundAnswerStartedAtRef = useRef(0);

  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const timeoutRef = useRef<() => void>(() => {});
  const finishGameRef = useRef<(reason: "wrong" | "timeout") => void>(() => {});
  const commitSwipeRef = useRef<(answer: Answer) => void>(() => {});

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

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

  const {
    progress,
    isPanic,
    startTimer,
    stopRaf,
    resetTimer,
    setProgress,
  } = useRoundTimer({
    durationMs: ROUND_DURATION_MS,
    panicThresholdMs: PANIC_THRESHOLD_MS,
    fpsLimitMs: TIMER_FPS_LIMIT_MS,
    onTimeout: () => timeoutRef.current(),
  });

  const clearAllTimers = useCallback(() => {
    stopRaf();
    stopFeedbackTimer();
    stopEnterTimer();
    stopBumpTimer();
  }, [stopBumpTimer, stopEnterTimer, stopFeedbackTimer, stopRaf]);

  const {
    dragX,
    dragY,
    isDragging,
    rotation,
    resetPointerState,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
  } = useSwipeControls({
    onCommitSwipe: (answer) => commitSwipeRef.current(answer),
  });

  const updateReactionAverage = useCallback(() => {
    if (!roundAnswerStartedAtRef.current) return;

    const reactionMs = Math.max(0, Math.round(nowMs() - roundAnswerStartedAtRef.current));

    let nextAvg = reactionMs;
    if (avgReactionMsRef.current !== 0) {
      nextAvg = Math.round(avgReactionMsRef.current * 0.78 + reactionMs * 0.22);
    }

    avgReactionMsRef.current = nextAvg;
  }, []);

  const submitSession = useCallback(
    async (
      reason: "wrong" | "timeout",
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

      haptic(reason === "wrong" ? [80, 30, 80] : [200]);

      setIsLocked(true);
      setFeedback(reason);
      setIsGameOver(true);
      setRevealedType(img?.type ?? null);
      setProgress(0);

      if (reason === "wrong") {
        setWrongAnswers(finalWrong);
      }

      resetPointerState();

      setBest((prev) => {
        const nextBest = Math.max(prev, finalScore);
        saveBestScore(nextBest);

        onGameOver?.({
          streak: finalScore,
          score: finalScore,
          isNewRecord: finalScore > prev,
          flawless: finalScore > 0 && finalWrong === 0 && reason !== "timeout",
        });

        return nextBest;
      });

      void submitSession(reason, finalScore, finalCorrect, finalWrong);
    },
    [clearAllTimers, onGameOver, resetPointerState, setProgress, submitSession]
  );

  useEffect(() => {
    finishGameRef.current = finishGame;
  }, [finishGame]);

  const advanceRound = useCallback(
    (nextScore: number) => {
      const { nextCurrent, nextNext } = buildNextRound({
        currentIndex: currentIndexRef.current,
        nextScore,
        avgReactionMs: avgReactionMsRef.current,
      });

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

      preloadLookahead({
        currentIndex: nextCurrent,
        baseScore: nextScore,
        avgReactionMs: avgReactionMsRef.current,
      });
    },
    [buildNextRound, preloadLookahead, resetPointerState, setProgress, stopEnterTimer]
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

  const commitSwipeHandler = useCallback(
    (answer: Answer) => {
      if (isGameOverRef.current || isLockedRef.current) return;

      isLockedRef.current = true;
      setIsLocked(true);
      setCardExiting(answer === "real" ? "left" : "right");

      stopFeedbackTimer();
      feedbackTimerRef.current = setTimeout(() => {
        processAnswer(answer);
        setCardExiting(null);
        resetPointerState();
      }, EXIT_ANIMATION_MS);
    },
    [processAnswer, resetPointerState, stopFeedbackTimer]
  );

  useEffect(() => {
    commitSwipeRef.current = commitSwipeHandler;
  }, [commitSwipeHandler]);

  const restartGame = useCallback(() => {
    clearAllTimers();
    abortSubmit();
    resetPointerState();

    resetRandomizer();
    submittedRef.current = false;
    sessionStartRef.current = nowMs();
    avgReactionMsRef.current = 0;
    roundAnswerStartedAtRef.current = 0;

    const fresh = buildInitialRound();

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

    preloadLookahead({
      currentIndex: fresh.currentIndex,
      baseScore: 0,
      avgReactionMs: 0,
    });
  }, [
    abortSubmit,
    buildInitialRound,
    clearAllTimers,
    preloadLookahead,
    resetPointerState,
    resetRandomizer,
    setProgress,
  ]);

  const {
    handleProtectedContextMenu,
    handleProtectedDragStart,
    handleProtectedCopy,
    handleProtectedCut,
    handleProtectedPaste,
    handleProtectedMouseDown,
  } = useSpotfakeProtection({
    onArrowLeft: () => processAnswer("real"),
    onArrowRight: () => processAnswer("fake"),
    onEnter: () => {
      if (isGameOverRef.current) {
        restartGame();
      }
    },
  });

  useEffect(() => {
    sessionStartRef.current = nowMs();
  }, []);

  useEffect(() => {
    if (nextImage?.src) {
      preloadImage(nextImage.src);
    }

    if (currentIndex >= 0) {
      preloadLookahead({
        currentIndex,
        baseScore: score,
        avgReactionMs: avgReactionMsRef.current,
      });
    }
  }, [currentIndex, nextImage?.src, preloadLookahead, score]);

  useEffect(() => {
    if (!currentImage) return;
    if (isGameOver || isLocked) return;

    roundAnswerStartedAtRef.current = nowMs();

    timeoutRef.current = () => {
      pushGlobalRecent(currentIndexRef.current);
      finishGameRef.current("timeout");
    };

    resetTimer();
    startTimer();

    return stopRaf;
  }, [currentImage, isGameOver, isLocked, pushGlobalRecent, resetTimer, startTimer, stopRaf]);

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

  const isNewRecordAtGameOver = isGameOver && score > 0 && score >= best;

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
                <div key={currentIndex} className="relative">
                  <div
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
                          opacity: Math.min(0.14, Math.abs(dragX) / 180),
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
            </div>

            <TimerBar progress={progress} feedback={feedback} isPanic={isPanic} />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => processAnswer("real")}
                disabled={isGameOver || isLocked}
                className="group rounded-[1.35rem] border border-white/10 bg-zinc-800 px-4 py-4 text-left transition-all duration-150 hover:scale-[1.02] hover:border-white/20 hover:bg-zinc-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500 transition group-hover:text-zinc-400">
                  ← Arrow left / A
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
                  Arrow right / D
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
                    onClick={restartGame}
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
                    One mistake ends your streak. Difficulty varies naturally from one
                    image to another.
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
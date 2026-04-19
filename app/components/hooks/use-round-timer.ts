"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseRoundTimerParams = {
  durationMs: number;
  panicThresholdMs: number;
  fpsLimitMs: number;
  onTimeout: () => void;
};

type UseRoundTimerReturn = {
  progress: number;
  isPanic: boolean;
  startTimer: () => void;
  stopRaf: () => void;
  resetTimer: () => void;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function useRoundTimer({
  durationMs,
  panicThresholdMs,
  fpsLimitMs,
  onTimeout,
}: UseRoundTimerParams): UseRoundTimerReturn {
  const [progress, setProgress] = useState(100);

  const rafRef = useRef<number | null>(null);
  const roundStartRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const timeoutTriggeredRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopRaf();
    roundStartRef.current = null;
    lastFrameRef.current = 0;
    timeoutTriggeredRef.current = false;
    setProgress(100);
  }, [stopRaf]);

  const startTimer = useCallback(() => {
    stopRaf();

    roundStartRef.current = nowMs();
    lastFrameRef.current = 0;
    timeoutTriggeredRef.current = false;
    setProgress(100);

    const tick = (now: number) => {
      if (roundStartRef.current === null) return;

      const elapsed = now - roundStartRef.current;
      const nextProgress = clamp(100 - (elapsed / durationMs) * 100, 0, 100);

      if (
        lastFrameRef.current === 0 ||
        now - lastFrameRef.current >= fpsLimitMs ||
        nextProgress === 0
      ) {
        setProgress(nextProgress);
        lastFrameRef.current = now;
      }

      if (elapsed >= durationMs) {
        if (!timeoutTriggeredRef.current) {
          timeoutTriggeredRef.current = true;
          setProgress(0);
          stopRaf();
          onTimeoutRef.current();
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs, fpsLimitMs, stopRaf]);

  const isPanic = useMemo(() => {
    const remainingMs = (progress / 100) * durationMs;
    return remainingMs <= panicThresholdMs && progress > 0;
  }, [durationMs, panicThresholdMs, progress]);

  return {
    progress,
    isPanic,
    startTimer,
    stopRaf,
    resetTimer,
    setProgress,
  };
}
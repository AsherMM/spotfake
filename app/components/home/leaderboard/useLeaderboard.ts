"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeLeaderboard } from "./normalize";
import type { LeaderboardApiResponse, LeaderboardEntry } from "./types";

const LEADERBOARD_URL = "/api/leaderboard?mode=global&limit=5";
const REFRESH_INTERVAL_MS = 60_000;

type UseLeaderboardOptions = {
  /** Pause background refresh (e.g. during an active run). */
  paused?: boolean;
};

export type UseLeaderboardResult = {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastRefreshed: Date | null;
  refresh: (background?: boolean) => Promise<void>;
};

export function useLeaderboard(options: UseLeaderboardOptions = {}): UseLeaderboardResult {
  const { paused = false } = options;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const requestIdRef = useRef(0);
  const pausedRef = useRef(paused);

  // Keep a ref in sync so the interval callback (captured at setup time)
  // can read the latest paused value without needing to restart.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const refresh = useCallback(async (background = false) => {
    const requestId = ++requestIdRef.current;

    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(LEADERBOARD_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload: LeaderboardApiResponse = await response.json();

      if (requestId !== requestIdRef.current) return;

      setLeaderboard(normalizeLeaderboard(payload));
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("[leaderboard]", err);
      setError("Could not load the leaderboard. Please try again.");
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + polling + visibility handling.
  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    // Inlined bootstrap fetch — avoids the synchronous setLoading(true) that
    // `refresh()` does (our initial state is already loading).
    async function bootstrap() {
      try {
        const response = await fetch(LEADERBOARD_URL, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const payload: LeaderboardApiResponse = await response.json();

        if (controller.signal.aborted) return;
        if (requestId !== requestIdRef.current) return;

        setLeaderboard(normalizeLeaderboard(payload));
        setError(null);
        setLastRefreshed(new Date());
      } catch (err) {
        if (controller.signal.aborted) return;
        if (requestId !== requestIdRef.current) return;
        if ((err as Error)?.name === "AbortError") return;
        console.error("[leaderboard bootstrap]", err);
        setError("Could not load the leaderboard. Please try again.");
      } finally {
        if (controller.signal.aborted) return;
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      }
    }

    void bootstrap();

    // Background polling — skips tick if tab is hidden or paused (e.g. during
    // an active run). A skipped tick is fine; the next one (or manual refresh)
    // will catch up.
    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (pausedRef.current) return;
      void refresh(true);
    }, REFRESH_INTERVAL_MS);

    // Refresh once when the tab becomes visible again — the user is likely
    // looking at the board, so an immediate update feels alive.
    const onVisibilityChange = () => {
      if (typeof document === "undefined") return;
      if (!document.hidden && !pausedRef.current) {
        void refresh(true);
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      controller.abort();
      clearInterval(intervalId);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, [refresh]);

  return { leaderboard, loading, refreshing, error, lastRefreshed, refresh };
}
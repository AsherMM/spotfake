"use client";

import Link from "next/link";
import { useMemo } from "react";
import { RADIUS } from "../shared/tokens";
import { LeaderboardRow } from "./LeaderboardRow";
import { LeaderboardSkeleton } from "./LeaderboardSkeleton";
import { LeaderboardTopCard } from "./LeaderboardTopCard";
import { PowerScoreFormulaBar } from "./PowerScoreFormulaBar";
import type { UseLeaderboardResult } from "./useLeaderboard";

type Props = {
  state: UseLeaderboardResult;
};

export function Leaderboard({ state }: Props) {
  const {
    leaderboard,
    loading,
    refreshing,
    error,
    lastRefreshed,
    refresh,
  } = state;

  const topEntry = useMemo(() => leaderboard[0] ?? null, [leaderboard]);
  const restEntries = useMemo(() => leaderboard.slice(1), [leaderboard]);

  return (
    <section
      aria-label="Global leaderboard"
      aria-live="polite"
      className={`${RADIUS.xl} border border-white/10 bg-white/[0.03] p-6`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            Ranking system
          </div>
          <h2 className="mt-2 text-2xl font-black text-white">
            Streak Power Board
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Only players with real runs appear here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            View all
          </Link>
          <button
            type="button"
            title="Refresh leaderboard"
            aria-label="Refresh leaderboard"
            onClick={() => void refresh(true)}
            disabled={loading || refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            {refreshing ? <span className="animate-spin">↻</span> : "↻"}
          </button>
        </div>
      </div>

      {lastRefreshed && (
        <p className="mt-1.5 text-[10px] text-zinc-500">
          Updated{" "}
          {lastRefreshed.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" · "}auto-refreshes every 60s
        </p>
      )}

      <div className="mt-4">
        <PowerScoreFormulaBar />
      </div>

      <div className="mt-5">
        {loading ? (
          <LeaderboardSkeleton />
        ) : error ? (
          <div
            role="alert"
            className={`${RADIUS.md} border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300`}
          >
            <div className="flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void refresh(false)}
                className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-xs font-bold text-red-200 transition hover:bg-red-500/25"
              >
                Retry
              </button>
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div
            className={`${RADIUS.md} border border-white/10 bg-black/20 p-5 text-sm text-zinc-400`}
          >
            No entries yet. Play a few rounds and this board will come alive.
          </div>
        ) : (
          <div className="space-y-3">
            {topEntry && <LeaderboardTopCard entry={topEntry} index={0} />}
            {restEntries.map((entry, index) => (
              <LeaderboardRow key={entry.rank} entry={entry} index={index + 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
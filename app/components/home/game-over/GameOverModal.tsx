"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { pickRandom } from "../shared/format";
import { RADIUS, SURFACE } from "../shared/tokens";
import { Confetti } from "./Confetti";
import { GAME_OVER_MESSAGES, getGameOverTier } from "./messages";
import { shareScore, type ShareResult } from "./share";

export type GameOverSession = {
  streak: number;
  score: number;
  isNewRecord: boolean;
  flawless: boolean;
  /** Populated once we start computing power score live, null otherwise. */
  powerScore?: number;
};

type Props = {
  session: GameOverSession;
  onRetry: () => void;
  onClose: () => void;
  playerName: string;
};

// ──────────────────────────────────────────────────────────────────────────
// Phase 1 — Continue prompt
// ──────────────────────────────────────────────────────────────────────────
//
// Placeholder for the upcoming "one life + rewarded ad continue" feature.
// Today this component renders nothing and the modal goes straight to the
// FinalResults phase. When rewarded ads are wired in, replace the body of
// `<ContinuePrompt>` with:
//   - a 10s countdown,
//   - "Watch ad to continue" (rewarded ad SDK),
//   - "Use continue token" (if user has any),
//   - "Give up" (skip to FinalResults).
//
// Separating it now means we don't have to tear the modal apart later.
// ──────────────────────────────────────────────────────────────────────────

function _ContinuePrompt(_props: { onResolve: () => void }) {
  // Intentionally empty for now. See comment block above.
  return null;
}

// ──────────────────────────────────────────────────────────────────────────
// Phase 2 — Final results
// ──────────────────────────────────────────────────────────────────────────

function FinalResults({ session, onRetry, onClose, playerName }: Props) {
  const tier = getGameOverTier(session.streak);

  // Pick a tier-appropriate message once per mount — avoids re-picking on
  // every render and keeps the message stable if the user pauses on the modal.
  const [message] = useState(
    () => pickRandom(GAME_OVER_MESSAGES[tier]) ?? "Run ended."
  );

  const [shareState, setShareState] = useState<ShareResult["kind"] | null>(null);

  async function handleShare() {
    const result = await shareScore({
      streak: session.streak,
      score: session.score,
      powerScore: session.powerScore,
      flawless: session.flawless,
      isNewRecord: session.isNewRecord,
      url:
        typeof window !== "undefined" ? window.location.origin : undefined,
    });

    setShareState(result.kind);

    // Auto-reset the "Copied!" confirmation so the button goes back to its
    // default state if the user comes back to it.
    if (result.kind === "copied") {
      setTimeout(() => setShareState(null), 2200);
    }
  }

  const shareLabel =
    shareState === "copied"
      ? "✓ Copied"
      : shareState === "shared"
        ? "✓ Shared"
        : shareState === "unsupported"
          ? "Share unavailable"
          : "Share score";

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            Run ended
          </div>
          <h2 className="mt-1 text-3xl font-black text-white">Game Over</h2>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:border-white/25 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div
        className={`mt-4 ${RADIUS.md} border border-white/10 ${SURFACE.idle} px-5 py-4`}
      >
        <p className="text-lg font-bold text-white">{message}</p>
        {playerName && (
          <p className="mt-0.5 text-sm text-zinc-500">{playerName}</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div
          className={`${RADIUS.md} border border-white/10 ${SURFACE.sunken} p-5`}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Streak
          </div>
          <div className="mt-2 text-5xl font-black text-white">
            {session.streak}
          </div>
          {session.isNewRecord && (
            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-400">
              ✨ New record!
            </div>
          )}
        </div>

        <div
          className={`${RADIUS.md} border border-white/10 ${SURFACE.sunken} p-5`}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Score
          </div>
          <div className="mt-2 text-5xl font-black text-pink-300">
            {session.score}
          </div>
          {session.flawless && (
            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
              ⚡ Flawless run!
            </div>
          )}
        </div>
      </div>

      {/*
        Primary action: Play Again — big, loud, default.
        Secondary: Share — small, grey, next to it.
        "Keep browsing" was removed. In a short-run game the exit door
        should not be sitting next to the retry button.
      */}
      <button
        type="button"
        onClick={onRetry}
        className={`mt-5 w-full ${RADIUS.md} bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 py-5 text-base font-black text-white shadow-lg shadow-pink-500/25 transition hover:scale-[1.01] active:scale-[0.98]`}
      >
        🎯 Play again
      </button>

      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={shareState === "unsupported"}
        className={`mt-3 flex w-full items-center justify-center gap-2 ${RADIUS.md} border border-white/10 ${SURFACE.idle} py-3.5 text-sm font-semibold text-white transition ${SURFACE.hover} active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span aria-hidden="true">📤</span>
        <span>{shareLabel}</span>
      </button>

      <Link
        href="/leaderboard"
        className={`mt-3 flex w-full items-center justify-center gap-2 ${RADIUS.md} border border-yellow-400/20 bg-yellow-400/5 py-3.5 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-400/10`}
      >
        <span aria-hidden="true">🏆</span>
        <span>View full leaderboard</span>
      </Link>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Modal shell
// ──────────────────────────────────────────────────────────────────────────

export function GameOverModal(props: Props) {
  const { session, onClose } = props;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(timer);
  }, []);

  // Close on Escape + retry on Enter (matches the Enter→Retry control hint).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") props.onRetry();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  return (
    <>
      {session.isNewRecord && <Confetti />}

      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Game Over"
        className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg overflow-hidden rounded-t-[2.5rem] border border-white/10 bg-zinc-950/98 shadow-2xl backdrop-blur-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:rounded-[2.5rem]"
        style={{
          transform: visible
            ? "translate(-50%, -50%)"
            : "translate(-50%, calc(-50% + 32px))",
          opacity: visible ? 1 : 0,
          transition:
            "transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease",
        }}
      >
        <div className="mx-auto mt-4 h-1 w-10 rounded-full bg-white/15 sm:hidden" />

        {/*
          Future: conditionally render <ContinuePrompt> first and only fall
          through to <FinalResults> when the continue timer expires or the
          user gives up. Today we render FinalResults directly.
        */}
        <FinalResults {...props} />
      </div>
    </>
  );
}
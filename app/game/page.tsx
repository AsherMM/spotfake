"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import GamePreview from "@/app/components/game-preview";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";

import { useLeaderboard } from "@/app/components/home/leaderboard/useLeaderboard";
import { Leaderboard } from "@/app/components/home/leaderboard/Leaderboard";

import type { GameMode, ModeCard } from "@/app/components/home/modes/config";
import { MODE_CARDS } from "@/app/components/home/modes/config";
import { ModeCards } from "@/app/components/home/modes/ModeCards";

import { Avatar } from "@/app/components/home/shared/Avatar";
import { ControlsCard } from "@/app/components/home/shared/ControlsCard";
import { PulseDot } from "@/app/components/home/shared/PulseDot";
import { StickyMobileCTA } from "@/app/components/home/shared/StickyMobileCTA";
import { getInitial } from "@/app/components/home/shared/format";
import { RADIUS, SURFACE } from "@/app/components/home/shared/tokens";
import { useCountUp } from "@/app/components/home/shared/useCountUp";

import { PlayerStatsCard } from "@/app/components/home/player/PlayerStatsCard";
import type { PlayerStats } from "@/app/components/home/player/PlayerStatsCard";

import type { GameOverSession } from "@/app/components/home/game-over/GameOverModal";

// Dynamic import: the modal + confetti are dead weight until a run ends.
// Loading them on demand keeps the initial JS bundle lean — the whole
// point of this refactor.
const GameOverModal = dynamic(
  () =>
    import("@/app/components/home/game-over/GameOverModal").then(
      (m) => m.GameOverModal
    ),
  { ssr: false }
);

// ──────────────────────────────────────────────────────────────────────────
// Local types
// ──────────────────────────────────────────────────────────────────────────

type Player = {
  name: string;
  avatar: string | null;
  email?: string;
  provider?: string;
};

// ──────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────

export default function GamePage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const gameSectionRef = useRef<HTMLDivElement | null>(null);

  const [player, setPlayer] = useState<Player | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [, setLoadingUser] = useState(true);

  const [selectedMode, setSelectedMode] = useState<GameMode>("solo");
  const [gameKey, setGameKey] = useState(0);
  const [gameOverSession, setGameOverSession] = useState<GameOverSession | null>(
    null
  );

  // Track whether a run is currently active. We use this to pause the
  // leaderboard polling during play — no background fetches at the exact
  // moment the player is swiping.
  const [runActive, setRunActive] = useState(false);

  const leaderboardState = useLeaderboard({
    paused: runActive,
  });
  const { leaderboard, loading: loadingLeaderboard, error: leaderboardError, refresh } =
    leaderboardState;

  // ── User bootstrap ──
  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!alive) return;
        if (!user) {
          setPlayer(null);
          return;
        }

        const meta = user.user_metadata ?? {};

        const name =
          meta.full_name ||
          meta.name ||
          meta.display_name ||
          user.email?.split("@")[0] ||
          "Player";

        const avatar = meta.avatar_url || meta.picture || meta.image || null;

        const provider =
          Array.isArray(user.identities) && user.identities[0]
            ? user.identities[0].provider
            : "auth";

        setPlayer({
          name,
          avatar,
          email: user.email ?? undefined,
          provider,
        });

        try {
          const statsResponse = await fetch("/api/me/stats", {
            cache: "no-store",
          });
          if (statsResponse.ok && alive) {
            const stats: PlayerStats = await statsResponse.json();
            setPlayerStats(stats);
          }
        } catch {
          // optional endpoint
        }
      } catch (error) {
        console.error("[user]", error);
      } finally {
        if (alive) setLoadingUser(false);
      }
    }

    void run();

    return () => {
      alive = false;
    };
  }, [supabase]);

  // ── Derived state ──
  const currentMode = useMemo(
    () => MODE_CARDS.find((mode) => mode.id === selectedMode) ?? MODE_CARDS[0],
    [selectedMode]
  );

  // Only animate counters once the leaderboard has actually loaded, to avoid
  // the "0 → value → 0 → value" double-pop on first paint.
  const leaderboardReady = !loadingLeaderboard && !leaderboardError;
  const animatedCount = useCountUp(leaderboard.length, 900, leaderboardReady);
  const animatedTopPower = useCountUp(
    leaderboard[0]?.powerScore ?? 0,
    900,
    leaderboardReady
  );

  // ── Handlers ──
  const handleGameOver = useCallback(
    (session: GameOverSession) => {
      setRunActive(false);
      setGameOverSession(session);
      if (session.score > 0 || session.isNewRecord) {
        void refresh(true);
      }
    },
    [refresh]
  );

  const handleRetry = useCallback(() => {
    setGameOverSession(null);
    setGameKey((prev) => prev + 1);
    setRunActive(true);
    gameSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleStartNewRun = useCallback(() => {
    setGameKey((prev) => prev + 1);
    setRunActive(true);
    gameSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSwitchToSolo = useCallback(() => {
    setSelectedMode("solo");
  }, []);

  // Mode selection does NOT unmount the game anymore.
  // - Selecting Solo brings the game back / keeps it alive.
  // - Selecting an unavailable mode (Ranked, Tournament) only toggles the
  //   NotifyBanner on that card via ModeCards internal rendering.
  //   The Solo game keeps playing behind the panel.
  const handleModeClick = useCallback((mode: ModeCard) => {
    setSelectedMode(mode.id);
  }, []);

  // ── Render ──
  return (
    <>
      <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 pb-24 text-white sm:pb-0">
        <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <div className="space-y-8">
            {/* ─────────── Hero — GAME FIRST ─────────── */}
            <section className="grid gap-6 xl:grid-cols-[1.38fr_1.02fr]">
              {/* LEFT: game + controls */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-pink-500/25 bg-pink-500/10 px-4 py-2 text-sm text-pink-300">
                    <PulseDot />
                    Competitive perception · streak pressure · fast reads
                  </div>

                  <h1 className="text-4xl font-black leading-[0.96] tracking-tight sm:text-5xl xl:text-6xl">
                    Build your streak.{" "}
                    <span className="bg-gradient-to-r from-pink-500 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                      Own the board.
                    </span>
                  </h1>
                </div>

                {/*
                  The game is always mounted when Solo is selected.
                  Selecting Ranked/Tournament no longer wipes it — the
                  NotifyBanner opens inside the mode card instead.
                */}
                <div
                  ref={gameSectionRef}
                  className={`${RADIUS.xl} border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl sm:p-4`}
                >
                  <div
                    className={`${RADIUS.lg} border border-white/10 bg-black/40 p-2 sm:p-3`}
                  >
                    <GamePreview
                      key={gameKey}
                      mode="solo"
                      onGameOver={handleGameOver}
                    />
                  </div>
                </div>

                <ControlsCard />
              </div>

              {/* RIGHT: player + modes */}
              <div className="space-y-6">
                {player && (
                  <div
                    className={`${RADIUS.xl} border border-white/10 bg-white/[0.03] p-5`}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={player.avatar}
                        alt="Your avatar"
                        fallback={getInitial(player.name)}
                        size={52}
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                          Player profile
                        </div>
                        <div className="mt-0.5 truncate text-xl font-black text-white">
                          {player.name}
                        </div>
                        {player.email && (
                          <div className="truncate text-sm text-zinc-500">
                            {player.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { label: "Status", value: "Online" },
                        { label: "Focus", value: "Precision" },
                        { label: "Active mode", value: currentMode.title },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className={`${RADIUS.md} border border-white/10 ${SURFACE.sunken} p-3 text-center`}
                        >
                          <div className="text-[9px] uppercase tracking-widest text-zinc-500">
                            {label}
                          </div>
                          <div className="mt-1.5 text-sm font-black text-white">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {playerStats && <PlayerStatsCard stats={playerStats} />}
                  </div>
                )}

                <ModeCards selectedMode={selectedMode} onSelect={handleModeClick} />

                {/* Live metrics — compact */}
                <div
                  className={`${RADIUS.xl} border border-white/10 bg-white/[0.03] p-6`}
                >
                  <div className="flex items-center gap-2">
                    <PulseDot color="bg-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
                      Live
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-black text-white">
                    Real competitive structure
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div
                      className={`${RADIUS.md} border border-white/10 ${SURFACE.sunken} p-4`}
                    >
                      <div className="text-[9px] uppercase tracking-widest text-zinc-500">
                        Ranked players
                      </div>
                      <div className="mt-2 text-2xl font-black text-white">
                        {leaderboardReady ? animatedCount : "—"}
                      </div>
                    </div>

                    <div
                      className={`${RADIUS.md} border border-white/10 ${SURFACE.sunken} p-4`}
                    >
                      <div className="text-[9px] uppercase tracking-widest text-zinc-500">
                        Top power
                      </div>
                      <div className="mt-2 text-2xl font-black text-pink-300">
                        {leaderboardReady ? animatedTopPower : "—"}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    Ranked 1v1, bracket tournaments, persistent stats, and daily
                    challenge seeds will grow naturally on top of this backend.
                  </p>
                </div>
              </div>
            </section>

            {/* ─────────── Leaderboard ─────────── */}
            <Leaderboard state={leaderboardState} />

            {/* ─────────── Footer CTA ─────────── */}
            <section>
              <div
                className={`${RADIUS.xl} border border-white/10 bg-gradient-to-r from-pink-500/8 via-transparent to-purple-500/8 p-px`}
              >
                <div
                  className={`${RADIUS.xl} bg-black/75 px-6 py-8 backdrop-blur-2xl sm:px-8 sm:py-10`}
                >
                  <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                        Ready for competitive scale
                      </div>
                      <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                        Structured like a real game hub.
                      </h2>
                      <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
                        Modes, identity, leaderboard, controls, and live ranking
                        data all in one place. The next layer is matchmaking,
                        ranked profiles, and tournament logic.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <Link
                        href="/leaderboard"
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                      >
                        Full leaderboard
                      </Link>

                      <button
                        type="button"
                        onClick={handleStartNewRun}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-pink-500/25 transition hover:scale-[1.02]"
                      >
                        <span aria-hidden="true">🎯</span>
                        <span>Start a new run</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <StickyMobileCTA
          currentMode={currentMode}
          onPlay={handleStartNewRun}
          onSwitchToSolo={handleSwitchToSolo}
        />
      </div>

      {gameOverSession && (
        <GameOverModal
          session={gameOverSession}
          onRetry={handleRetry}
          onClose={() => setGameOverSession(null)}
          playerName={player?.name ?? ""}
        />
      )}
    </>
  );
}
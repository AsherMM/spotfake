"use client";

import type { ModeCard } from "../modes/config";
import { RADIUS, SURFACE } from "./tokens";

type Props = {
  currentMode: ModeCard;
  onPlay: () => void;
  onSwitchToSolo: () => void;
};

export function StickyMobileCTA({ currentMode, onPlay, onSwitchToSolo }: Props) {
  // If the user is on an unavailable mode, offer a path back to Solo
  // instead of disappearing (the old behavior was a dead-end on mobile).
  if (!currentMode.available) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/95 p-4 backdrop-blur-xl sm:hidden">
        <button
          type="button"
          onClick={onSwitchToSolo}
          className={`w-full ${RADIUS.md} border border-white/15 ${SURFACE.active} py-4 text-base font-black text-white transition active:scale-[0.98]`}
        >
          ← Back to Solo mode
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/95 p-4 backdrop-blur-xl sm:hidden">
      <button
        type="button"
        onClick={onPlay}
        className={`w-full ${RADIUS.md} bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 py-4 text-base font-black text-white shadow-2xl shadow-pink-500/25 transition active:scale-[0.98]`}
      >
        🎯 Play now — Solo
      </button>
    </div>
  );
}
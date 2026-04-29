"use client";

import { RADIUS, SURFACE } from "../shared/tokens";
import { NotifyBanner } from "../notify/NotifyBanner";
import type { GameMode, ModeCard, NotifyMode } from "./config";
import { MODE_CARDS, getModeBadgeClasses } from "./config";

type Props = {
  selectedMode: GameMode;
  onSelect: (mode: ModeCard) => void;
};

export function ModeCards({ selectedMode, onSelect }: Props) {
  return (
    <div>
      <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
        Game modes
      </div>
      <div className="grid gap-3">
        {MODE_CARDS.map((mode) => {
          const active = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelect(mode)}
              aria-pressed={active}
              aria-label={`${mode.title} — ${mode.available ? "available" : "coming soon"}`}
              className={`${RADIUS.xl} border p-5 text-left transition-colors duration-200 ${
                active
                  ? "border-pink-500/40 bg-gradient-to-br from-pink-500/10 to-fuchsia-500/5 shadow-lg shadow-pink-500/10"
                  : `border-white/10 ${SURFACE.idle} hover:border-white/20 ${SURFACE.hover}`
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center ${RADIUS.sm} border border-white/10 bg-black/40 text-xl`}
                  >
                    {mode.icon}
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">
                      {mode.title}
                    </div>
                    <div className="mt-0.5 text-sm text-zinc-400">
                      {mode.subtitle}
                    </div>
                  </div>
                </div>
                <div
                  className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${getModeBadgeClasses(
                    mode.available
                  )}`}
                >
                  {mode.badge}
                </div>
              </div>

              <p className="mt-3.5 text-sm leading-7 text-zinc-400">
                {mode.description}
              </p>

              {active && !mode.available && (
                <NotifyBanner mode={mode.id as NotifyMode} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
import { Avatar } from "../shared/Avatar";
import { clampName, getInitial } from "../shared/format";
import { PowerTooltip } from "../shared/PowerTooltip";
import { getRankTheme } from "../shared/rankTheme";
import { RADIUS, SURFACE } from "../shared/tokens";
import type { LeaderboardEntry } from "./types";

type Props = {
  entry: LeaderboardEntry;
  index: number;
};

export function LeaderboardTopCard({ entry, index }: Props) {
  const theme = getRankTheme(entry.rank);

  return (
    <article
      className={`relative overflow-hidden ${RADIUS.lg} border p-6 ${theme.border} ${theme.bg} ${theme.glow}`}
      style={{
        animation: "lbIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        animationDelay: `${index * 70}ms`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.accentHex}55, transparent)`,
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${theme.badgeBorder} ${theme.badgeText}`}
          style={{ background: theme.badgeBg }}
        >
          <span className="text-sm leading-none" aria-hidden="true">
            {theme.trophy}
          </span>
          <span>{theme.label}</span>
        </div>

        {entry.isGuest && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Guest
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center ${RADIUS.md} border bg-black/40 text-2xl font-black ${theme.border} ${theme.numberColor}`}
        >
          1
        </div>

        <Avatar
          src={entry.avatar}
          alt={entry.name}
          fallback={getInitial(entry.name)}
          size={54}
        />

        <div className="min-w-0">
          <div className="truncate text-xl font-black text-white" title={entry.name}>
            {clampName(entry.name, 22)}
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            Streak {entry.bestStreak} · Flawless {entry.flawlessRuns}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Best Score", value: entry.bestScore, color: "text-white", tip: false },
          { label: "Best Streak", value: entry.bestStreak, color: "text-white", tip: false },
          { label: "Power Score", value: entry.powerScore, color: theme.scoreColor, tip: true },
        ].map(({ label, value, color, tip }) => (
          <div
            key={label}
            className={`${RADIUS.md} border border-white/10 ${SURFACE.sunken} p-4`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                {label}
              </span>
              {tip && <PowerTooltip />}
            </div>
            <div className={`mt-2 text-2xl font-black ${color}`}>
              {value > 0 ? value : <span className="text-zinc-600">—</span>}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
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

export function LeaderboardRow({ entry, index }: Props) {
  const theme = getRankTheme(entry.rank);

  return (
    <article
      className={`group flex items-center gap-3 ${RADIUS.md} border px-4 py-3.5 transition-colors duration-200 hover:border-white/20 ${theme.border} ${theme.bg} ${SURFACE.hover}`}
      style={{
        animation: "lbIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        animationDelay: `${index * 70}ms`,
      }}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center ${RADIUS.sm} border border-white/10 bg-black/40 text-sm font-black ${theme.numberColor}`}
      >
        {entry.rank}
      </div>

      <Avatar
        src={entry.avatar}
        alt={entry.name}
        fallback={getInitial(entry.name)}
        size={40}
      />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-white" title={entry.name}>
          {clampName(entry.name, 20)}
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          Streak {entry.bestStreak} · Flawless {entry.flawlessRuns}
          {entry.isGuest ? " · Guest" : ""}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {[
          { label: "Score", value: entry.bestScore, color: "text-white", tip: false },
          { label: "Streak", value: entry.bestStreak, color: "text-white", tip: false },
          { label: "Power", value: entry.powerScore, color: theme.scoreColor, tip: true },
        ].map(({ label, value, color, tip }) => (
          <div
            key={label}
            className={`w-14 ${RADIUS.sm} border border-white/10 ${SURFACE.sunken} px-2 py-2 text-center`}
          >
            <div className="flex items-center justify-center gap-0.5">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500">
                {label}
              </span>
              {tip && <PowerTooltip />}
            </div>
            <div className={`mt-0.5 text-sm font-black ${color}`}>
              {value > 0 ? value : <span className="text-zinc-600">—</span>}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
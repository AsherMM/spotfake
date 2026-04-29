import { RADIUS } from "../shared/tokens";
import { getPlayerTierLabel } from "./tiers";

export type PlayerStats = {
  bestScore: number;
  bestStreak: number;
  flawlessRuns: number;
  powerScore: number;
  totalGames: number;
};

export function PlayerStatsCard({ stats }: { stats: PlayerStats }) {
  const tier = getPlayerTierLabel(stats.powerScore);

  return (
    <div className={`mt-4 overflow-hidden ${RADIUS.md} border border-white/10 bg-black/25`}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
          Your stats
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] ${tier.color} ${tier.border} ${tier.bg}`}
        >
          {tier.label}
        </span>
      </div>

      <div className="grid grid-cols-4 divide-x divide-white/10">
        {[
          { label: "Power", value: stats.powerScore, color: "text-pink-300" },
          { label: "Streak", value: stats.bestStreak, color: "text-white" },
          { label: "Score", value: stats.bestScore, color: "text-white" },
          { label: "Flawless", value: stats.flawlessRuns, color: "text-emerald-300" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 text-center">
            <div className="text-[9px] uppercase tracking-widest text-zinc-500">
              {label}
            </div>
            <div className={`mt-1.5 text-lg font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { RADIUS } from "../shared/tokens";

export function PowerScoreFormulaBar() {
  return (
    <div
      className={`${RADIUS.md} border border-pink-500/20 bg-gradient-to-r from-pink-500/8 via-fuchsia-500/5 to-transparent p-4`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          ⚡
        </span>
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-pink-300">
          How Power Score works
        </div>
      </div>

      <p className="mt-2 text-sm leading-6 text-zinc-300">
        <span className="font-bold text-white">Best Streak × Flawless Runs.</span>{" "}
        Both have to be high to climb — a long streak only counts if you also
        finish runs clean.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span
          className={`${RADIUS.sm} border border-white/10 bg-black/30 px-2.5 py-1 font-mono`}
        >
          Streak <span className="font-black text-white">8</span>
        </span>
        <span aria-hidden="true">×</span>
        <span
          className={`${RADIUS.sm} border border-white/10 bg-black/30 px-2.5 py-1 font-mono`}
        >
          Flawless <span className="font-black text-white">6</span>
        </span>
        <span aria-hidden="true">=</span>
        <span
          className={`${RADIUS.sm} border border-pink-500/30 bg-pink-500/10 px-2.5 py-1 font-mono font-black text-pink-300`}
        >
          Power 48
        </span>
      </div>
    </div>
  );
}
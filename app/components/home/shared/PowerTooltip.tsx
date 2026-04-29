"use client";

import { useState } from "react";
import { RADIUS } from "./tokens";

export function PowerTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label="Power score formula"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[9px] font-black text-zinc-400 transition hover:border-pink-500/40 hover:text-pink-400"
      >
        ?
      </button>

      {open && (
        <div
          role="tooltip"
          className={`absolute bottom-full left-1/2 z-50 mb-2.5 w-52 -translate-x-1/2 ${RADIUS.md} border border-white/10 bg-zinc-950/98 p-3.5 shadow-2xl backdrop-blur-xl`}
        >
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400">
            Power Score
          </div>
          <p className="mt-1.5 text-xs leading-5 text-zinc-400">
            <span className="font-bold text-white">Best Streak × Flawless Runs</span>
            <br />
            Example: streak <span className="font-black text-white">8</span> × flawless{" "}
            <span className="font-black text-white">6</span> ={" "}
            <span className="font-black text-pink-300">48 pts</span>
          </p>
          <div className="absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-zinc-950" />
        </div>
      )}
    </div>
  );
}
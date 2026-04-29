import { RADIUS } from "./tokens";

// A/D previously mislabeled as "Arrow left/right". Now correctly described.
// Enter → Retry is kept because it's a real shortcut on the game-over modal.
const CONTROL_TIPS = [
  { label: "Swipe left", action: "REAL", key: "←", variant: "real" as const },
  { label: "Swipe right", action: "FAKE", key: "→", variant: "fake" as const },
  { label: "Key A", action: "REAL", key: "A", variant: "real" as const },
  { label: "Key D", action: "FAKE", key: "D", variant: "fake" as const },
  { label: "Enter", action: "Retry", key: "↵", variant: "neutral" as const },
];

function getControlVariantClasses(variant: "real" | "fake" | "neutral") {
  if (variant === "real") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  }
  if (variant === "fake") {
    return "border-red-500/25 bg-red-500/10 text-red-300";
  }
  return "border-white/10 bg-white/5 text-zinc-400";
}

export function ControlsCard() {
  return (
    <div className={`${RADIUS.xl} border border-white/10 bg-white/[0.03] p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            Controls
          </div>
          <h3 className="mt-2 text-xl font-black text-white">
            Built for fast comfort
          </h3>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CONTROL_TIPS.map((tip) => (
          <div
            key={tip.label}
            className={`flex items-center justify-between ${RADIUS.sm} border border-white/10 bg-black/25 px-4 py-3`}
          >
            <div className="flex items-center gap-3">
              <kbd
                className={`flex h-7 w-7 items-center justify-center ${RADIUS.sm} border border-white/15 bg-white/5 text-xs font-black text-zinc-300`}
              >
                {tip.key}
              </kbd>
              <span className="text-sm text-zinc-400">{tip.label}</span>
            </div>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] ${getControlVariantClasses(
                tip.variant
              )}`}
            >
              {tip.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
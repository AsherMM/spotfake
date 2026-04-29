import { RADIUS, SURFACE } from "../shared/tokens";

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={`h-[72px] animate-pulse ${RADIUS.md} border border-white/10 ${SURFACE.idle}`}
          style={{ animationDelay: `${index * 60}ms` }}
        />
      ))}
    </div>
  );
}
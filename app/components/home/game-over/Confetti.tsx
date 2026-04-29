"use client";

import { useState } from "react";

type ConfettiParticle = {
  id: number;
  color: string;
  left: number;
  delay: number;
  duration: number;
  width: number;
  rotation: number;
};

const CONFETTI_COLORS = [
  "#ec4899",
  "#f59e0b",
  "#8b5cf6",
  "#10b981",
  "#3b82f6",
  "#f97316",
] as const;

const CONFETTI_COUNT = 52;

function createConfettiParticles(): ConfettiParticle[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, index) => ({
    id: index,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.4,
    duration: 1.8 + Math.random() * 1.6,
    width: 7 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Confetti() {
  // Lazy initializers — run once at mount, no re-renders.
  const [particles] = useState<ConfettiParticle[]>(() => createConfettiParticles());
  const [enabled] = useState(() => !prefersReducedMotion());

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 rounded-sm opacity-90"
          style={{
            left: `${particle.left}%`,
            width: particle.width,
            height: particle.width * 0.4,
            background: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confettiFall ${particle.duration}s ease-in ${particle.delay}s both`,
          }}
        />
      ))}
    </div>
  );
}

// Also export as default so it can be dynamically imported with a clean signature.
export default Confetti;
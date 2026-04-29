// Tiny, pure formatting helpers. No React, no side effects.

export function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function clampName(name: string, max = 18): string {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

export function pickRandom<T>(arr: readonly T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)] ?? null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
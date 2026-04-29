"use client";

import { useState } from "react";
import { isValidEmail } from "../shared/format";
import { RADIUS } from "../shared/tokens";
import type { NotifyMode } from "../modes/config";
import { persistNotifySubscribed, readNotifySubscribed } from "./storage";

export function NotifyBanner({ mode }: { mode: NotifyMode }) {
  const [email, setEmail] = useState("");
  // Lazy initializer — runs once, synchronously, before the first render.
  const [sent, setSent] = useState(() => readNotifySubscribed(mode));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const label = mode === "ranked" ? "1v1 Ranked" : "Tournament";

  async function submit() {
    const trimmed = email.trim();

    if (!trimmed) {
      setError("Enter your email.");
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError("Enter a valid email.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      // Fire-and-forget. We still persist locally even on network failure,
      // so the user sees the confirmation state.
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, mode }),
      }).catch(() => {
        /* swallow — see comment above */
      });

      persistNotifySubscribed(mode, trimmed);
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      // Stop propagation so clicking inside the banner doesn't retrigger
      // the parent mode-card click.
      onClick={(e) => e.stopPropagation()}
      className={`mt-4 ${RADIUS.md} border border-white/10 bg-black/25 p-4`}
    >
      {sent ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
          <span aria-hidden="true">✓</span>
          <span>You&apos;ll be notified when {label} launches.</span>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-zinc-400">
            Get notified when{" "}
            <span className="font-semibold text-white">{label}</span> goes live.
          </p>
          <div className="flex gap-2">
            <label htmlFor={`notify-${mode}`} className="sr-only">
              Email address
            </label>
            <input
              id={`notify-${mode}`}
              type="email"
              value={email}
              placeholder="your@email.com"
              disabled={submitting}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit();
              }}
              className="flex-1 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting}
              className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2 text-sm font-black text-white transition hover:scale-[1.03] active:scale-95 disabled:opacity-60"
            >
              {submitting ? "…" : "Notify me"}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs text-red-400">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
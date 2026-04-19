"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 3l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.9 0-.7-.1-1.5-.2-2.1H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.9-.9 6.6-2.5l-3.1-2.4c-.9.6-2 1-3.5 1-2.7 0-4.9-1.8-5.7-4.2l-3.2 2.5C4.8 19.7 8.1 22 12 22z"
      />
      <path
        fill="#4A90E2"
        d="M6.3 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3.1 7.6C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.4l3.2-2.5z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.9c1.5 0 2.9.5 3.9 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8.1 2 4.8 4.3 3.1 7.6l3.2 2.5C7.1 7.7 9.3 5.9 12 5.9z"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M20.3 4.4A16.7 16.7 0 0 0 16.2 3l-.2.4c1.6.4 2.3 1 2.3 1a10.8 10.8 0 0 0-6.3-1.8c-2.2 0-4.4.6-6.3 1.8 0 0 .8-.7 2.6-1.1L8 3a16.7 16.7 0 0 0-4.1 1.4C1.3 8.3.7 12.1 1 15.8a16.9 16.9 0 0 0 5 2.5l1.2-1.9c-.7-.3-1.3-.7-1.9-1.2.1.1.3.2.4.2 2 1 4.2 1.5 6.4 1.5 2.2 0 4.4-.5 6.4-1.5l.4-.2c-.6.5-1.2.9-1.9 1.2l1.2 1.9a16.9 16.9 0 0 0 5-2.5c.5-4.3-.9-8-2.7-11.4ZM9.7 13.6c-.9 0-1.7-.8-1.7-1.9 0-1 .8-1.9 1.7-1.9 1 0 1.8.8 1.7 1.9 0 1-.8 1.9-1.7 1.9Zm4.6 0c-.9 0-1.7-.8-1.7-1.9 0-1 .8-1.9 1.7-1.9 1 0 1.8.8 1.7 1.9 0 1-.8 1.9-1.7 1.9Z" />
    </svg>
  );
}

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();

  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGuestPlay(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Choisis un display name pour jouer.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/guest-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: trimmed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Impossible de créer le compte invité.");
        setLoading(false);
        return;
      }

      localStorage.setItem("spotfake_guest_profile_id", data.profileId);
      localStorage.setItem("spotfake_guest_token", data.guestToken);
      localStorage.setItem("spotfake_display_name", data.displayName);

      window.location.href = "/game";
    } catch {
      setError("Une erreur est survenue. Réessaie.");
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "discord") {
    const trimmed = displayName.trim();

    if (!trimmed) {
      setError("Choisis un display name avant de continuer.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      localStorage.setItem("spotfake_pending_display_name", trimmed);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/game`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch {
      setError("Impossible de lancer la connexion OAuth.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-sm text-pink-200">
              <span className="h-2 w-2 rounded-full bg-pink-400" />
              Enter Spotfake
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
              Choose your name.
              <br />
              Enter the challenge.
              <br />
              Play your way.
            </h1>

            <p className="mt-6 max-w-lg text-zinc-300">
              Tu peux jouer immédiatement en invité avec un simple display name,
              ou continuer avec Google / Discord pour sauvegarder ton profil
              proprement.
            </p>
          </div>

          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black">Start playing</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Display name only for guest mode, or continue with Google /
                Discord.
              </p>
            </div>

            <form onSubmit={handleGuestPlay} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  Display name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={24}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-pink-500/40"
                  placeholder="Your display name"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 font-black text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? "Preparing game..." : "Play as guest"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                or
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={loading}
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold transition hover:bg-white/10 disabled:opacity-60"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("discord")}
                disabled={loading}
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold transition hover:bg-white/10 disabled:opacity-60"
              >
                <DiscordIcon />
                Continue with Discord
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
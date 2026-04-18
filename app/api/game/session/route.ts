import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { prisma } from "@/app/lib/prisma";
import { recordGameSession } from "@/app/lib/game-stats";
import { GameMode, SessionEndReason } from "@prisma/client";

function isValidMode(value: unknown): value is GameMode {
  return value === "solo" || value === "ranked" || value === "tournament";
}

function isValidEndReason(value: unknown): value is SessionEndReason {
  return (
    value === "wrong" ||
    value === "timeout" ||
    value === "completed" ||
    value === "quit"
  );
}

function isValidDifficulty(value: unknown): value is "easy" | "medium" | "hard" {
  return value === "easy" || value === "medium" || value === "hard";
}

function isValidCategory(
  value: unknown
): value is "faces" | "landscapes" | "objects" | "animals" | "scenes" {
  return (
    value === "faces" ||
    value === "landscapes" ||
    value === "objects" ||
    value === "animals" ||
    value === "scenes"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mode = body?.mode;
    const score = Number(body?.score ?? 0);
    const streakReached = Number(body?.streakReached ?? score);
    const correctAnswers = Number(body?.correctAnswers ?? 0);
    const wrongAnswers = Number(body?.wrongAnswers ?? 0);
    const timedOut = Boolean(body?.timedOut ?? false);
    const flawless = Boolean(body?.flawless ?? false);
    const durationMs = Number(body?.durationMs ?? 0);
    const difficultyReached = body?.difficultyReached ?? null;
    const category = body?.category ?? null;
    const endedBy = body?.endedBy;

    if (!isValidMode(mode)) {
      return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
    }

    if (!isValidEndReason(endedBy)) {
      return NextResponse.json({ error: "Invalid endedBy." }, { status: 400 });
    }

    if (difficultyReached && !isValidDifficulty(difficultyReached)) {
      return NextResponse.json({ error: "Invalid difficultyReached." }, { status: 400 });
    }

    if (category && !isValidCategory(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    if (
      !Number.isFinite(score) ||
      !Number.isFinite(streakReached) ||
      !Number.isFinite(correctAnswers) ||
      !Number.isFinite(wrongAnswers) ||
      !Number.isFinite(durationMs)
    ) {
      return NextResponse.json({ error: "Invalid numeric values." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let profileId: string | null = null;

    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { authUserId: user.id },
        select: { id: true },
      });

      profileId = profile?.id ?? null;
    }

    if (!profileId) {
      const guestToken = req.headers.get("x-guest-token");

      if (!guestToken) {
        return NextResponse.json({ error: "No authenticated player found." }, { status: 401 });
      }

      const guestProfile = await prisma.profile.findUnique({
        where: { guestToken },
        select: { id: true },
      });

      profileId = guestProfile?.id ?? null;
    }

    if (!profileId) {
      return NextResponse.json({ error: "Player profile not found." }, { status: 404 });
    }

    const session = await recordGameSession({
      profileId,
      mode,
      score,
      streakReached,
      correctAnswers,
      wrongAnswers,
      timedOut,
      flawless,
      durationMs,
      difficultyReached,
      category,
      endedBy,
    });

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("game session error:", error);
    return NextResponse.json(
      { error: "Unable to record game session." },
      { status: 500 }
    );
  }
}
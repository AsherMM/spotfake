import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { prisma } from "@/app/lib/prisma";
import { recordGameSession } from "@/app/lib/game-stats";
import { GameMode, SessionEndReason } from "@prisma/client";

type Difficulty = "easy" | "medium" | "hard";
type Category = "faces" | "landscapes" | "objects" | "animals" | "scenes";

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

function isValidDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

function isValidCategory(value: unknown): value is Category {
  return (
    value === "faces" ||
    value === "landscapes" ||
    value === "objects" ||
    value === "animals" ||
    value === "scenes"
  );
}

function toSafeInt(value: unknown, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
}

function toSafeBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mode = body?.mode;
    const endedBy = body?.endedBy;
    const difficultyReached = body?.difficultyReached ?? null;
    const category = body?.category ?? null;

    const score = toSafeInt(body?.score, 0);
    const streakReached = toSafeInt(body?.streakReached, score);
    const correctAnswers = toSafeInt(body?.correctAnswers, 0);
    const wrongAnswers = toSafeInt(body?.wrongAnswers, 0);
    const durationMs = toSafeInt(body?.durationMs, 0);

    const timedOut = toSafeBoolean(body?.timedOut, false);
    const flawless = toSafeBoolean(body?.flawless, false);

    if (!isValidMode(mode)) {
      return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
    }

    if (!isValidEndReason(endedBy)) {
      return NextResponse.json({ error: "Invalid endedBy." }, { status: 400 });
    }

    if (difficultyReached !== null && !isValidDifficulty(difficultyReached)) {
      return NextResponse.json(
        { error: "Invalid difficultyReached." },
        { status: 400 }
      );
    }

    if (category !== null && !isValidCategory(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    if (correctAnswers + wrongAnswers > 0 && score > correctAnswers) {
      return NextResponse.json(
        { error: "Score cannot be greater than correctAnswers." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let profileId: string | null = null;
    let identity: "auth" | "guest" | null = null;

    if (user?.id) {
      const profile = await prisma.profile.findUnique({
        where: { authUserId: user.id },
        select: { id: true },
      });

      if (profile?.id) {
        profileId = profile.id;
        identity = "auth";
      }
    }

    if (!profileId) {
      const guestToken = req.headers.get("x-guest-token")?.trim();

      if (guestToken) {
        const guestProfile = await prisma.profile.findUnique({
          where: { guestToken },
          select: { id: true },
        });

        if (guestProfile?.id) {
          profileId = guestProfile.id;
          identity = "guest";
        }
      }
    }

    if (!profileId) {
      return NextResponse.json(
        { error: "No authenticated or guest player found." },
        { status: 401 }
      );
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

    return NextResponse.json(
      {
        success: true,
        sessionId: session.id,
        profileId,
        identity,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("game session error:", error);

    return NextResponse.json(
      { error: "Unable to record game session." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const displayName = String(body?.displayName || "").trim();

    if (!displayName || displayName.length < 2) {
      return NextResponse.json(
        { error: "Display name invalide." },
        { status: 400 }
      );
    }

    const guestToken = crypto.randomUUID();

    const profile = await prisma.profile.create({
      data: {
        displayName,
        isGuest: true,
        guestToken,
        provider: "guest",
        gameStats: {
          create: {},
        },
      },
      select: {
        id: true,
        displayName: true,
        guestToken: true,
      },
    });

    return NextResponse.json({
      profileId: profile.id,
      displayName: profile.displayName,
      guestToken: profile.guestToken,
    });
  } catch (error) {
    console.error("guest-session error:", error);

    return NextResponse.json(
      { error: "Impossible de créer la session invitée." },
      { status: 500 }
    );
  }
}
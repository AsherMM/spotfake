import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié." },
        { status: 401 }
      );
    }

    const email = user.email ?? null;
    const metadata = user.user_metadata ?? {};

    const displayName =
      metadata.display_name ||
      metadata.full_name ||
      metadata.name ||
      email?.split("@")[0] ||
      "Player";

    const avatarUrl =
      metadata.avatar_url ||
      metadata.picture ||
      metadata.image ||
      null;

    const provider =
      Array.isArray(user.identities) && user.identities.length > 0
        ? user.identities[0]?.provider
        : "oauth";

    const profile = await prisma.profile.upsert({
      where: {
        authUserId: user.id,
      },
      update: {
        displayName,
        email,
        avatarUrl,
        provider,
        isGuest: false,
      },
      create: {
        authUserId: user.id,
        email,
        displayName,
        avatarUrl,
        provider,
        isGuest: false,
        gameStats: {
          create: {},
        },
      },
      select: {
        id: true,
        displayName: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("profile bootstrap error:", error);

    return NextResponse.json(
      { error: "Impossible de créer le profil." },
      { status: 500 }
    );
  }
}
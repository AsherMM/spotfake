import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

function getSafeNext(next: string | null) {
  if (!next) return "/game";
  if (!next.startsWith("/")) return "/game";
  if (next.startsWith("//")) return "/game";
  return next;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = getSafeNext(url.searchParams.get("next"));
  const origin = url.origin;

  const cookieStore = await cookies();

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    console.error("OAuth exchange error:", exchangeError);
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_exchange`);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("OAuth getUser error:", userError);
    return NextResponse.redirect(`${origin}/auth/login?error=user_not_found`);
  }

  try {
    const email = user.email ?? null;
    const metadata = user.user_metadata ?? {};

    const displayName =
      metadata.display_name ||
      metadata.full_name ||
      metadata.name ||
      (email ? email.split("@")[0] : null) ||
      "Player";

    const avatarUrl =
      metadata.avatar_url ||
      metadata.picture ||
      metadata.image ||
      null;

    const provider =
      Array.isArray(user.identities) && user.identities.length > 0
        ? user.identities[0]?.provider ?? "oauth"
        : "oauth";

    await prisma.profile.upsert({
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
    });
  } catch (bootstrapError) {
    console.error("Profile bootstrap error:", bootstrapError);
    return NextResponse.redirect(`${origin}/auth/login?error=profile_bootstrap`);
  }

  return response;
}
"use client";

import { useState } from "react";

type AvatarProps = {
  src: string | null;
  alt: string;
  fallback: string;
  size?: number;
};

export function Avatar({ src, alt, fallback, size = 44 }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="shrink-0 overflow-hidden rounded-full border border-white/15 bg-black/60"
      style={{ width: size, height: size, minWidth: size }}
    >
      {src && !imageError ? (
        // OAuth providers return avatars from arbitrary CDNs (Google, GitHub,
        // Discord, etc.). Using next/image here would force us to maintain an
        // allow-list; plain <img> is intentional. Lint rule disabled locally.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-black text-zinc-400"
          style={{ fontSize: size * 0.38 }}
          aria-label={alt}
        >
          {fallback}
        </div>
      )}
    </div>
  );
}
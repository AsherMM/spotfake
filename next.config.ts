import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,

  images: {
    remotePatterns: [
      new URL("https://images.unsplash.com/**"),

      // Avatars auth fréquents
      new URL("https://avatars.githubusercontent.com/**"),
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },

  poweredByHeader: false,
};

export default nextConfig;
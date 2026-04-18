import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://spotfake.app";
const siteName = "Spotfake";
const defaultTitle = "Spotfake — Real vs AI Image Game";
const titleTemplate = "%s | Spotfake";
const defaultDescription =
  "Spotfake is a fast-paced browser game where you decide whether an image is real or AI-generated under pressure. Build your streak, test your eye, and play instantly.";
const ogImage = "/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: defaultTitle,
    template: titleTemplate,
  },

  description: defaultDescription,

  applicationName: siteName,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  keywords: [
    "spotfake",
    "real vs ai image game",
    "real or fake image",
    "ai generated image test",
    "ai image game",
    "browser game",
    "ai image detection",
    "real vs fake images",
    "spot the fake",
    "ai photo test",
    "real or ai challenge",
    "fake image detector game",
  ],

  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "games",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description:
      "Can you tell whether an image is real or AI-generated? Test your eye, survive the pressure, and build your streak on Spotfake.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Spotfake — Real vs AI image challenge",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description:
      "One image. Seconds to decide. Real or AI-generated? Play Spotfake.",
    images: [ogImage],
    creator: "@spotfakeapp",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },

  manifest: "/site.webmanifest",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
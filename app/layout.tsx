import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://spotfake.app"),
  title: {
    default: "Spotfake",
    template: "%s | Spotfake",
  },
  description:
    "Spotfake is a fast-paced browser game where you decide if an image is real or AI-generated in one second.",
  applicationName: "Spotfake",
  keywords: [
    "spotfake",
    "AI image game",
    "real or fake image",
    "AI generated image test",
    "browser game",
    "AI image detection",
    "real vs fake images",
  ],
  authors: [{ name: "Spotfake" }],
  creator: "Spotfake",
  publisher: "Spotfake",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://spotfake.app",
    siteName: "Spotfake",
    title: "Spotfake",
    description:
      "Can you tell if an image is real or AI-generated? Test your eye in one second.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spotfake",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spotfake",
    description:
      "One image. One second. Real or fake? Play Spotfake.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://spotfake.app",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
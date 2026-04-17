import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Don't Be Shy — Practice the interview you're afraid of.",
  description:
    "Free, open-source AI mock interview simulator. Voice or text. Real-time scoring with CEFR English fluency estimation. Bring your own Anthropic key. By Penguin Alley.",
  openGraph: {
    title: "Don't Be Shy — Practice the interview you're afraid of.",
    description:
      "Free, open-source AI mock interview simulator. Voice or text. Real-time scoring.",
    type: "website",
    siteName: "Don't Be Shy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Don't Be Shy",
    description: "Practice the interview you're afraid of.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1714" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable} ${caveat.variable}`}
    >
      <body className="bg-bone text-charcoal antialiased">{children}</body>
    </html>
  );
}

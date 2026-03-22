import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: "LessonLens Mobile — Cloudflare AI Tutor",
  description:
    "Mobile-first tutoring website powered by Cloudflare Workers AI.",
  keywords: [
    "AI tutor",
    "Cloudflare AI",
    "mobile website",
    "education",
    "LessonLens",
    "Nova",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${ibmPlexSans.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased min-h-screen bg-surface-950 text-text-200">
        {children}
      </body>
    </html>
  );
}

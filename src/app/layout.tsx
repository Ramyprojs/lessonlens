import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LessonLens — AI Screen Tutor",
  description:
    "Share your screen. Nova watches. You learn. Real-time AI tutoring powered by what's on your screen.",
  keywords: [
    "AI tutor",
    "screen sharing",
    "real-time tutoring",
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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-surface-950 text-text-200">
        {children}
      </body>
    </html>
  );
}

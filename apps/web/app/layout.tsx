import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Provider } from "./_trpc/Provider";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BolChaal - AI-Powered English Learning Platform",
  description: "Students practice English through chat and audio with an adaptive bot. Teachers create classrooms and rubrics, and the bot evaluates, coaches, and tracks progress in real time.",
  keywords: [
    "English learning",
    "language practice",
    "AI coach",
    "conversation practice",
    "pronunciation",
    "fluency",
    "vocabulary",
    "online tutoring",
    "language education",
    "chatbot learning",
    "ESL",
    "English as second language"
  ],
  authors: [{ name: "BolChaal Team" }],
  creator: "BolChaal",
  publisher: "BolChaal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BolChaal - Learn English by Speaking with AI",
    description: "Practice English conversation with an AI coach that provides real-time feedback based on your teacher's rubrics. Perfect for fluency, pronunciation, and vocabulary improvement.",
    url: "/",
    siteName: "BolChaal",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BolChaal - AI-Powered English Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BolChaal - Learn English by Speaking with AI",
    description: "Practice English conversation with an AI coach that provides real-time feedback based on your teacher's rubrics.",
    images: ["/og-image.png"],
    creator: "@bolchaal",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
  },
  category: "education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#6366F1" />
        <meta name="msapplication-TileColor" content="#6366F1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BolChaal" />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />

        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Android Chrome Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={geist.className}>
        <Provider>
        <>{children}</>
        <ReactQueryDevtools initialIsOpen={false} />
        </Provider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

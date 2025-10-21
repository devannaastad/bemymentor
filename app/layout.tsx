// app/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import SessionProvider from "@/components/auth/SessionProvider";
import NextTopLoader from "nextjs-toploader";
import ToastContainer from "@/components/common/Toast";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "BeMyMentor - Find Your Perfect Mentor",
    template: "%s | BeMyMentor",
  },
  description:
    "Connect with expert mentors in trading, gaming, design, fitness, languages, and career development. Book 1-on-1 sessions or get exclusive access to mentor communities.",
  keywords: [
    "mentorship",
    "online coaching",
    "trading mentor",
    "gaming coach",
    "design mentor",
    "fitness coach",
    "language tutor",
    "career coaching",
  ],
  authors: [{ name: "BeMyMentor" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BeMyMentor",
    title: "BeMyMentor - Find Your Perfect Mentor",
    description:
      "Connect with expert mentors in trading, gaming, design, fitness, languages, and career development.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BeMyMentor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BeMyMentor - Find Your Perfect Mentor",
    description:
      "Connect with expert mentors in trading, gaming, design, fitness, languages, and career development.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {/* Page transition loader */}
        <NextTopLoader showSpinner={false} color="#a3a3a3" height={2} />

        {/* Auth session context (wrap once only) */}
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen pb-safe-bottom">{children}</main>
          <footer className="border-t border-white/10 py-8 text-center text-sm text-white/60">
            © {new Date().getFullYear()} BeMyMentor
          </footer>
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}
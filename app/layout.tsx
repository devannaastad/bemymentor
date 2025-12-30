// app/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import SessionProvider from "@/components/auth/SessionProvider";
import NextTopLoader from "nextjs-toploader";
import ToastContainer from "@/components/common/Toast";
import OrganizationSchema from "@/components/seo/OrganizationSchema";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "BeMyMentor - Find Your Perfect Mentor",
    template: "%s | BeMyMentor",
  },
  description:
    "Mentorship for the next generation. Learn from top Ecommerce and Marketing experts, Trading pros, Streamers, YouTube creators, and Gaming & Esports professionals. Get 1-on-1 coaching or exclusive access.",
  keywords: [
    "mentorship",
    "online coaching",
    "ecommerce mentor",
    "marketing coach",
    "trading mentor",
    "streaming coach",
    "youtube mentor",
    "gaming coach",
    "esports coach",
  ],
  authors: [{ name: "BeMyMentor" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BeMyMentor",
    title: "BeMyMentor - Find Your Perfect Mentor",
    description:
      "Mentorship for the next generation. Learn from top Ecommerce and Marketing experts, Trading pros, Streamers, YouTube creators, and Gaming & Esports professionals.",
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
      "Mentorship for the next generation. Learn from top Ecommerce and Marketing experts, Trading pros, Streamers, YouTube creators, and Gaming & Esports professionals.",
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
      <head>
        <OrganizationSchema />
      </head>
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
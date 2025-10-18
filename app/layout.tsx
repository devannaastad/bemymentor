// app/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import SessionProvider from "@/components/auth/SessionProvider";
import NextTopLoader from "nextjs-toploader";
import ToastContainer from "@/components/common/Toast";

export const metadata: Metadata = {
  title: "BeMyMentor",
  description: "Connect mentors and learners.",
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
// app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import SessionProvider from "@/components/auth/SessionProvider";

export const metadata = {
  title: "BeMyMentor",
  description: "Connect mentors and learners.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen pb-safe-bottom">{children}</main>
          <footer className="border-t border-white/10 py-8 text-center text-sm text-white/60">
            © {new Date().getFullYear()} BeMyMentor
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}

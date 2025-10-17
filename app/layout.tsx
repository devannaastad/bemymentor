import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "BeMyMentor — Find verified mentors. Learn faster.",
  description:
    "A vetted, review-driven marketplace that connects learners with mentors for skills, strategies, and coaching.",
  openGraph: { title: "BeMyMentor — Find verified mentors. Learn faster.", description: "A vetted, review-driven marketplace that connects learners with mentors for skills, strategies, and coaching.", type: "website", url: "/" },
  twitter: { card: "summary_large_image", title: "BeMyMentor — Find verified mentors. Learn faster.", description: "A vetted, review-driven marketplace that connects learners with mentors." },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className="min-h-screen antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

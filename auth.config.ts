// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";

// Check if Google OAuth is configured
const hasGoogleCreds = !!(
  process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET
);

const config: NextAuthConfig = {
  providers: hasGoogleCreds ? [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ] : [],
  
  session: { strategy: "jwt" },
  trustHost: true,
  
  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // On first sign in, copy name/image from provider
      if (user) {
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
        if (user.image) token.picture = user.image as string;
      }
      return token;
    },

    async session({ session, token }) {
      // Always read the latest user from the DB (by email)
      if (session.user?.email) {
        try {
          const u = await db.user.findUnique({
            where: { email: session.user.email },
            select: { name: true, image: true },
          });
          if (u?.name) session.user.name = u.name;
          if (u?.image) session.user.image = u.image;
        } catch (error) {
          console.error("Session callback DB error:", error);
          // Continue with token data if DB fails
        }
      }
      return session;
    },
  },
};

export default config;
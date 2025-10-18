// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";

const config: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,

  callbacks: {
    // Minimal JWT (let NextAuth issue it)
    async jwt({ token, user }) {
      // On first sign in, copy name/image from provider
      if (user) {
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image as string;
      }
      return token;
    },

    // 🔑 Always read the latest user from the DB (by email)
    async session({ session }) {
      if (session.user?.email) {
        const u = await db.user.findUnique({
          where: { email: session.user.email },
          select: { name: true, image: true },
        });
        if (u?.name) session.user.name = u.name;
        if (u?.image) session.user.image = u.image;
      }
      return session;
    },
  },
};

export default config;

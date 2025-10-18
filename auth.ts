// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "./auth.config";

export const {
  auth,
  signIn,
  signOut,
  handlers,
} = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
});

export const { GET, POST } = handlers;
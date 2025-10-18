// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
      // Vercel Blob (kept, in case you use it elsewhere)
      { protocol: "https", hostname: "public.blob.vercel-storage.com", pathname: "/**" },
      // UploadThing CDN (utfs.io)
      { protocol: "https", hostname: "utfs.io", pathname: "/**" },
    ],
  },
};

export default nextConfig;

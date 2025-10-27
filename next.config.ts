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
      // Pravatar (for seed data profile images)
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
      // Unsplash (for portfolio images)
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;

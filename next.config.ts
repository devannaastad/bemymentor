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
      // UI Avatars (for fake mentor profile images)
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/**" },
    ],
    // Enable image optimization for faster loading
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  // Enable compression for faster page loads
  compress: true,
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@prisma/client", "date-fns", "react-hot-toast"],
  },
  // Optimize production bundle
  productionBrowserSourceMaps: false,
};

export default nextConfig;

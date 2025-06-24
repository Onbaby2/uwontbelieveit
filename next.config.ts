import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      bodySizeLimit: "10mb", // Increase body size limit for file uploads
    },
  },
  // Enable static optimization where possible
  trailingSlash: false,
  // Optimize images
  images: {
    formats: ["image/webp", "image/avif"],
  },
  // Compiler options for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;

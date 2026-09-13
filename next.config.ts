import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 produces a fully static build in ./out for drag-and-drop
 * hosts (Netlify Drop, S3, etc.). The demo needs no server: every API call
 * falls back to local demo logic. Default builds keep API routes for Vercel.
 */
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStatic ? { output: "export" as const, trailingSlash: true, images: { unoptimized: true } } : {}),
};

export default nextConfig;

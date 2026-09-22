import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the app directory so a lockfile in a parent folder is not used as the root.
    root: path.join(__dirname),
  },
};

export default nextConfig;

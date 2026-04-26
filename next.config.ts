
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Removing output: 'export' to support Server Actions (AI Hub) while maintaining PWA capabilities.
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Aligned with vercel.json to ensure consistent asset resolution
  trailingSlash: false,
  // Optimized: Primary Server External Packages for Next.js 15 stability
  serverExternalPackages: [
    'genkit'
  ],
};

module.exports = nextConfig;
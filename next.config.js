/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Aligned with vercel.json to ensure consistent asset resolution
  trailingSlash: false,
  // Optimized: Standard Server External Packages for Next.js 15 stability
  serverExternalPackages: [
    'genkit', 
    '@genkit-ai/core', 
    '@genkit-ai/google-genai'
  ],
};

module.exports = nextConfig;
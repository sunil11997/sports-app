/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NOTE: Remove 'export' for Vercel to support GenAI (Server Actions)
  // Re-enable 'output: export' ONLY when building for Capacitor/Android
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Fixed: Exclude OTel and Genkit from client bundling to resolve "Critical dependency" warnings
  serverExternalPackages: ['@opentelemetry/sdk-node', 'genkit', '@genkit-ai/core', '@genkit-ai/google-genai'],
};

module.exports = nextConfig;

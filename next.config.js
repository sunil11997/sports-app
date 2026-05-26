
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Aligned with vercel.json to ensure consistent asset resolution
  trailingSlash: false,
  // Resolved: Prevent Webpack from bundling Node-specific telemetry in client chunks
  serverExternalPackages: [
    '@opentelemetry/sdk-node', 
    '@opentelemetry/instrumentation',
    '@opentelemetry/api',
    'genkit', 
    '@genkit-ai/core', 
    '@genkit-ai/google-genai'
  ],
};

module.exports = nextConfig;

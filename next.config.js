
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
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

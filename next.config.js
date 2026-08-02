/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  experimental: {
    webpackBuildWorker: false,
    cpus: 1,
  },
  serverExternalPackages: [
    'genkit'
  ],
};

module.exports = nextConfig;
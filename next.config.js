/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  serverExternalPackages: [
    'genkit'
  ],
};

module.exports = nextConfig;
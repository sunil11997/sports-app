/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes for better static routing in Capacitor
  trailingSlash: true,
};

module.exports = nextConfig;

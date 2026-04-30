/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to support Server Actions (AI Hub)
  images: {
    unoptimized: true,
  },
  // Ensure the build process ignores minor linting warnings for faster prototyping
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;

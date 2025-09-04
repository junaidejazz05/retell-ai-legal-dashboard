/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // AWS Amplify specific configuration
  trailingSlash: true,
  // Remove standalone output for API routes support
  // output: 'standalone', // Commented out for Amplify API routes support
}

export default nextConfig

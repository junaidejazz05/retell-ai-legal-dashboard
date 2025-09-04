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
  output: 'standalone',
  trailingSlash: true,
  // Ensure API routes work with Amplify
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

export default nextConfig

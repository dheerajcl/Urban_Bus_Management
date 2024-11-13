/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // appDir: true,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
}

export default nextConfig;
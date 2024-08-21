/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER_BASE_URL: process.env.SERVER_BASE_URL,
  },
}

export default nextConfig

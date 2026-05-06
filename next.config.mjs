/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.vinted.it' },
      { protocol: 'https', hostname: '**.vinted.com' },
    ],
  },
}

export default nextConfig

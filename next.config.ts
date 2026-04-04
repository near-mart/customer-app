import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: false,
  trailingSlash: false,
  env: {
    BASE_URL: process.env.BASE_URL,
    MAP_KEY: process.env.MAP_KEY,
  },
  typescript: {
    // ⚠️ Danger: This allows production builds even if there are type errors.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd192vb5vsy7q58.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.zeptonow.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

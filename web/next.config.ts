import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone', // Required for Docker
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'faithconnectapp.s3.af-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'd25pwvs6zlto08.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;

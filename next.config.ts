import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bỏ qua ESLint và TypeScript errors khi build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/ronreleasefiles/filestorage/**',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  reactStrictMode: false,
  // Use standalone for Docker deployment
  output: 'standalone',
  
  // Optional: Add trailing slash if needed
  trailingSlash: true,
  
  // Keep images optimized (remove unoptimized since we're not doing static export)
  images: {
    // You can remove unoptimized: true or keep it if you prefer
    // unoptimized: true,
  },
  
  // Your existing ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['jspdf', 'jspdf-autotable'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;

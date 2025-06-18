import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }

    return [
      {
        source: '/:all*(css|js|gif|svg|jpg|jpeg|png|woff|woff2|avif|webp)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=43200, must-revalidate'
          }
        ]
      },
      {
        source: '/mentiroso/:slug',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=43200, must-revalidate'
          }
        ]
      }
    ];
  },
};

export default nextConfig;

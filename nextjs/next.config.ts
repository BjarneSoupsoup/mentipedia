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
  async webpack(config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) {
    if (!dev) {
      const gplHeaderBanner = `/*!
        Copyright (C) 2025 Jorge Donis
  
        This program is free software; you can redistribute it and/or
        modify it under the terms of the GNU General Public License
        as published by the Free Software Foundation; exactly version 2
        of the License.
  
        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.
      /`
      
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: gplHeaderBanner,
          raw: true,
          entryOnly: false
        })
      )
    }

    return config
  }
};

export default nextConfig;

import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildRedirects, buildRewrites } from './src/lib/routes'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  // Matches the WordPress URLs (/kurse/hatha-yoga/).
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Uploaded media is served by Payload; the version query (?v=updatedAt) busts stale caches.
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/brand/**', search: '' }],
    formats: ['image/webp'],
  },
  async rewrites() {
    return buildRewrites().map((rule) => ({ ...rule }))
  },
  async redirects() {
    return buildRedirects().map((rule) => ({ ...rule }))
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

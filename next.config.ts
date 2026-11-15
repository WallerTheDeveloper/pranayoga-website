import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildRedirects, buildRewrites } from './src/lib/routes'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  // The Docker image runs .next/standalone/server.js (Dockerfile). `next start` still works,
  // with a warning; E2E uses it.
  output: 'standalone',
  // The tracer copies sharp's .node binding but not the libvips libraries it loads (a separate
  // @img/sharp-libvips-* package on Linux); without them every image upload fails.
  outputFileTracingIncludes: {
    '/*': ['node_modules/.pnpm/@img+sharp-*/node_modules/@img/*/lib/**/*'],
  },
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
  experimental: {
    // Page and data cache live only in the in-memory LRU (cacheMaxMemorySize, 50 MB), never on
    // disk: Next caches the 404 of every unknown /kurse/<slug>/, so random URLs would otherwise
    // fill the disk. The cache starts empty after a restart (docs/PLAN.md, Phase 2 status).
    isrFlushToDisk: false,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

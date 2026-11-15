# Production image. It only packages the standalone build that CI made with `pnpm build`
# (.github/workflows/deploy.yml): the build needs a migrated database, and the 1 GB staging
# droplet can't build. Runs on the DigitalOcean staging droplet now and on the OVH VPS later;
# only env and secrets differ (docs/DEPLOY.md).
#
# The build runs on ubuntu-24.04 (glibc), so sharp's prebuilt linux-x64 binaries in the
# standalone output need a glibc base image too: Debian slim, not Alpine.
ARG NODE_VERSION=24.22.3
FROM node:${NODE_VERSION}-trixie-slim

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    INTERNAL_PORT=3001 \
    PAYLOAD_MIGRATE_ON_START=true

WORKDIR /app

# App files stay owned by root: the server can read them but not change them. It writes only
# to uploads/ (bind-mounted from the host) and Next's image cache.
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
COPY docker/start.mjs docker/warm-up.mjs docker/forward.mjs docker/healthcheck.mjs ./docker/

RUN mkdir -p uploads/media uploads/downloads .next/cache \
    && chown -R node:node uploads .next/cache \
    && rm -f .env .env.*

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=6s --start-period=300s --start-interval=3s --retries=3 \
    CMD ["node", "docker/healthcheck.mjs"]

CMD ["node", "docker/start.mjs"]

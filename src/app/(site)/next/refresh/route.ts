import { revalidatePath } from 'next/cache'

import { revalidateContent } from '@/cache/revalidate'
import { CACHE_TAGS } from '@/cache/tags'
import { getCourses } from '@/content'
import { getPayloadClient } from '@/content/source'
import { createCacheRefreshHandler } from '@/lib/cacheRefresh'
import { getServerEnv } from '@/lib/env'
import { createRateLimiter } from '@/lib/rateLimit'
import { warmUpPaths } from '@/lib/warmUp'

/** Startup cache refresh, POST only; see src/lib/cacheRefresh.ts. */
export const dynamic = 'force-dynamic'

const handler = createCacheRefreshHandler({
  getSecret: () => getServerEnv().CACHE_REFRESH_SECRET,
  // The start script calls it once per container start; a few retries fit easily.
  limiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
  refresh: () => {
    // Every page below the root layouts (both route groups) and every tagged content entry.
    // Without a profile both expire at once: the next request renders fresh, it never gets
    // the old page.
    revalidatePath('/', 'layout')
    revalidateContent(Object.values(CACHE_TAGS))
  },
  listPaths: async () => warmUpPaths((await getCourses()).map((course) => course.slug)),
  log: (level, message) => {
    if (level === 'error') {
      console.error(message)
      return
    }
    void getPayloadClient().then((payload) => payload.logger.info(message))
  },
})

export function POST(request: Request): Promise<Response> {
  return handler(request)
}

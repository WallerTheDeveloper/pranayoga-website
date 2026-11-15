import { getPayloadClient } from '@/content/source'
import { createHealthHandler } from '@/lib/health'

/** Liveness for Docker and deploy.sh; see src/lib/health.ts. */
export const dynamic = 'force-dynamic'

const handler = createHealthHandler(
  async () => {
    const payload = await getPayloadClient()
    await payload.count({ collection: 'users', overrideAccess: true })
  },
  (message) => console.error(message),
)

export function GET(): Promise<Response> {
  return handler()
}

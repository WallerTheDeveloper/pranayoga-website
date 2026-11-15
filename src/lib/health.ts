/**
 * GET /next/health/: 200 once the database answers, 503 otherwise. Payload starts on the first
 * call, and in the production image that start runs pending migrations, so a 200 also means the
 * schema is current. Never cached.
 */

export type HealthProbe = () => Promise<void>

const NO_STORE = { 'Cache-Control': 'no-store' } as const

export function createHealthHandler(
  probe: HealthProbe,
  logError: (message: string) => void,
): () => Promise<Response> {
  return async () => {
    try {
      await probe()
      return Response.json({ status: 'ok' }, { status: 200, headers: NO_STORE })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      logError(`Health check failed: ${reason}`)
      return Response.json({ status: 'unavailable' }, { status: 503, headers: NO_STORE })
    }
  }
}

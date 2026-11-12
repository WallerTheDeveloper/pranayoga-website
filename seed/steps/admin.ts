import type { Payload } from 'payload'
import { z } from 'zod'

import { SEED_WRITE } from './context'

const adminSchema = z.object({
  SEED_ADMIN_EMAIL: z.email(),
  SEED_ADMIN_PASSWORD: z.string().min(12, 'must be at least 12 characters'),
})

/**
 * Optional admin account for local work and the E2E suite. Runs only when both SEED_ADMIN_*
 * variables are set; the password is (re)set on every run so tests can rely on it.
 */
export async function seedAdmin(payload: Payload): Promise<void> {
  const { SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: password } = process.env
  if (!email && !password) return
  const parsed = adminSchema.safeParse({ SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: password })
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    throw new Error(`Invalid seed admin settings:\n  ${issues.join('\n  ')}`)
  }

  const data = { email: parsed.data.SEED_ADMIN_EMAIL, password: parsed.data.SEED_ADMIN_PASSWORD }
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: data.email } },
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
  })
  const user = existing.docs[0]
  if (user) {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { password: data.password },
      ...SEED_WRITE,
    })
  } else {
    await payload.create({ collection: 'users', data, ...SEED_WRITE })
  }
  payload.logger.info('Admin user ready')
}

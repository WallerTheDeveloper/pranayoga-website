import { z } from 'zod'

/**
 * Server environment, validated once at startup (payload.config.ts imports this).
 * Secrets live in env only, never in the database.
 */
const serverEnvSchema = z.object({
  DATABASE_URI: z
    .string()
    .trim()
    .refine((value) => /^postgres(ql)?:\/\//.test(value), {
      message: 'must be a postgres:// connection string',
    }),
  PAYLOAD_SECRET: z.string().trim().min(32, 'must be at least 32 characters'),
  NEXT_PUBLIC_SERVER_URL: z
    .url({ protocol: /^https?$/ })
    .trim()
    .transform((value) => value.replace(/\/+$/, '')),
  PREVIEW_SECRET: z.string().trim().min(24, 'must be at least 24 characters'),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

export class EnvValidationError extends Error {
  constructor(public readonly issues: readonly string[]) {
    super(`Invalid environment configuration:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`)
    this.name = 'EnvValidationError'
  }
}

/** Parses an env-like record. Throws EnvValidationError listing every problem (never the values). */
export function parseServerEnv(source: Readonly<Record<string, string | undefined>>): ServerEnv {
  const result = serverEnvSchema.safeParse(source)
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    )
    throw new EnvValidationError(issues)
  }
  return result.data
}

export const DEFAULT_MEDIA_DIR = 'uploads/media'

/** A folder below the project root: relative, no `..` segments, no drive or leading slash. */
const mediaDirSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !/^([a-z]:|[\\/])/i.test(value) && !value.split(/[\\/]/).includes('..'), {
    message: 'must be a relative folder inside the project',
  })

/**
 * Upload folder, relative to the project root. Optional (defaults to uploads/media); the test
 * environment sets its own so a test seed never collides with files the dev database owns.
 * Separate from the main schema because the Media collection reads it at import time.
 */
export function getMediaDir(
  source: Readonly<Record<string, string | undefined>> = process.env,
): string {
  const raw = source.MEDIA_DIR
  if (raw === undefined || raw.trim() === '') return DEFAULT_MEDIA_DIR
  const result = mediaDirSchema.safeParse(raw)
  if (!result.success)
    throw new EnvValidationError([`MEDIA_DIR: ${result.error.issues[0]?.message ?? 'invalid'}`])
  return result.data
}

let cached: ServerEnv | undefined

/** Validated process.env, parsed on first use and memoised. */
export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env)
  return cached
}

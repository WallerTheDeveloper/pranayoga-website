import { rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Removes Next's data cache (unstable_cache entries) for builds and the dev server. Content is
 * cached with no expiry and keyed by the loader's source text, so old entries would otherwise
 * survive a rebuild or a re-seed: data from another database, or mapped by older code.
 * The image cache stays. A running server also holds entries in memory: restart it afterwards.
 *
 * Runs before `pnpm build`; the seed calls it after writing, since it skips revalidation.
 */
const defaultProjectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** @param {string} [projectDir] */
export function clearDataCache(projectDir = defaultProjectDir) {
  for (const parts of [['cache'], ['dev', 'cache']]) {
    rmSync(path.join(projectDir, '.next', ...parts, 'fetch-cache'), {
      recursive: true,
      force: true,
    })
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  clearDataCache()
}

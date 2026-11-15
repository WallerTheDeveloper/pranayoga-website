/**
 * First load of a server's database: builds a fresh database from the migrations (no schema
 * push), seeds it, and writes a folder that deploy/restore.sh reads on the server:
 *
 *   exports/<stamp>/db.dump          pg_dump, custom format
 *   exports/<stamp>/uploads.tar.gz   the seeded images and PDFs
 *   exports/<stamp>/INFO, SHA256SUMS
 *
 * A dump of the dev database won't do: dev pushes the schema, which leaves a "dev" row that
 * makes the server's start-up migration stop and ask. See docs/DEPLOY.md, "First load".
 *
 * Usage (needs the local docker compose "db" service and .env):
 *   pnpm first-load:export --server-url https://pranayoga.pickmajob.cc
 * Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (min. 12 characters) to include the first admin.
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { closeSync, createReadStream, mkdirSync, openSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import nextEnv from '@next/env'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const isWindows = process.platform === 'win32'

function fail(message) {
  console.error(`[first-load] ${message}`)
  process.exit(1)
}

function log(message) {
  console.log(`[first-load] ${message}`)
}

/** Runs a command from the project folder; throws if it fails. */
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectDir,
    stdio: 'inherit',
    ...options,
  })
  if (result.error) throw new Error(`${command} could not start: ${result.error.message}`)
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(' ')} exited with ${result.status}`)
}

/**
 * Runs a pnpm script without a shell. `pnpm <script>` sets npm_execpath to pnpm itself: a
 * native binary (pnpm 12) or a JS entry point. Only the bare command name needs a shell on
 * Windows, where it is a .cmd file.
 */
function pnpm(args, options) {
  const cli = process.env.npm_execpath ?? ''
  if (/^pnpm/i.test(path.basename(cli))) {
    return /\.[cm]?js$/i.test(cli)
      ? run(process.execPath, [cli, ...args], options)
      : run(cli, args, options)
  }
  return run('pnpm', args, { shell: isWindows, ...options })
}

function psql(sql) {
  const args = ['compose', 'exec', '-T', 'db', 'psql', '-U', 'pranayoga', '-d', 'postgres']
  run('docker', [...args, '-v', 'ON_ERROR_STOP=1', '-q', '-c', sql])
}

/** The public origin the seed stores as the site URL: http(s), no path, no trailing slash. */
export function parseServerUrl(value) {
  let url
  try {
    url = new URL(value ?? '')
  } catch {
    return null
  }
  if (!['https:', 'http:'].includes(url.protocol) || url.pathname !== '/') return null
  if (url.search || url.hash || url.username || url.password) return null
  return url.origin
}

/** The same URL pointing at another database on the same server. */
export function withDatabase(uri, database) {
  const url = new URL(uri)
  url.pathname = `/${database}`
  return url.toString()
}

async function sha256(file) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}

function gitRevision() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: projectDir, encoding: 'utf8' })
  return result.status === 0 ? result.stdout.trim() : 'unknown'
}

async function main() {
  const { values } = parseArgs({ options: { 'server-url': { type: 'string' } } })
  const serverUrl = parseServerUrl(values['server-url'])
  if (!serverUrl) fail('Pass --server-url with the site address, e.g. https://vorschau.example.de')

  nextEnv.loadEnvConfig(projectDir)
  if (!process.env.DATABASE_URI) fail('DATABASE_URI is missing (.env).')

  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*$/, '')
  const database = `pranayoga_export_${stamp.toLowerCase()}`
  const relativeOut = path.posix.join('exports', stamp)
  const outDir = path.join(projectDir, relativeOut)
  const uploadsDir = path.join(outDir, 'uploads')
  mkdirSync(uploadsDir, { recursive: true })

  const env = {
    ...process.env,
    DATABASE_URI: withDatabase(process.env.DATABASE_URI, database),
    NEXT_PUBLIC_SERVER_URL: serverUrl,
    // Migrations built this database; a push would mark it as a dev database.
    PAYLOAD_DB_PUSH: 'false',
    MEDIA_DIR: path.posix.join(relativeOut, 'uploads', 'media'),
    DOWNLOADS_DIR: path.posix.join(relativeOut, 'uploads', 'downloads'),
  }

  log(`creating the scratch database ${database}`)
  psql(`CREATE DATABASE ${database}`)
  try {
    log('building the schema from src/migrations')
    pnpm(['payload', 'migrate'], { env })
    log('seeding')
    pnpm(['seed'], { env })

    log('writing db.dump')
    const dumpFile = openSync(path.join(outDir, 'db.dump'), 'w')
    try {
      const args = ['compose', 'exec', '-T', 'db', 'pg_dump', '-U', 'pranayoga', '-d', database]
      run('docker', [...args, '--format=custom', '--no-owner'], {
        stdio: ['ignore', dumpFile, 'inherit'],
      })
    } finally {
      closeSync(dumpFile)
    }
  } finally {
    // Only the database this run created a moment ago.
    psql(`DROP DATABASE IF EXISTS ${database}`)
  }

  log('writing uploads.tar.gz')
  // Relative paths: GNU tar (Git Bash) would read "D:" in an absolute path as a remote host.
  run('tar', ['-czf', 'uploads.tar.gz', '-C', 'uploads', '.'], { cwd: outDir })
  rmSync(uploadsDir, { recursive: true, force: true })

  writeFileSync(
    path.join(outDir, 'INFO'),
    `created=${new Date().toISOString()}\nsource=first-load-export\nserver_url=${serverUrl}\n` +
      `git_revision=${gitRevision()}\n`,
  )
  const sums = []
  for (const name of ['db.dump', 'uploads.tar.gz']) {
    sums.push(`${await sha256(path.join(outDir, name))}  ${name}`)
  }
  writeFileSync(path.join(outDir, 'SHA256SUMS'), `${sums.join('\n')}\n`)

  log(`done: ${relativeOut}`)
  log('next: copy the folder to the server and run restore.sh there (docs/DEPLOY.md, "First load")')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => fail(error instanceof Error ? (error.stack ?? error.message) : error))
}

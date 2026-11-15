/**
 * A plain TCP forwarder from the container's public port to Next's internal one. docker/start.mjs
 * opens it only after the startup cache refresh. Until then nothing listens on the public port,
 * so the proxy answers 502 instead of serving the pages prerendered at build time from CI's
 * empty database. Bytes pass through unchanged (Host and X-Forwarded-* included), so Next sees
 * every request exactly as the proxy sent it.
 */
import net from 'node:net'

/**
 * @param {{
 *   listen: { host: string, port: number },
 *   target: { host: string, port: number },
 *   onError?: (message: string) => void,
 * }} options
 * @returns {Promise<net.Server>} once the public port is listening
 */
export function forwardTcp({ listen, target, onError = () => {} }) {
  // Half-open sockets: a client that ends its side still gets the rest of the response.
  const server = net.createServer({ allowHalfOpen: true }, (client) => {
    const upstream = net.connect({ ...target, allowHalfOpen: true })
    const closeBoth = () => {
      client.destroy()
      upstream.destroy()
    }
    client.on('error', closeBoth)
    upstream.on('error', (error) => {
      onError(`forwarding to ${target.host}:${target.port} failed: ${error.message}`)
      closeBoth()
    })
    client.pipe(upstream)
    upstream.pipe(client)
  })
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(listen.port, listen.host, () => {
      server.off('error', reject)
      server.on('error', (error) => onError(`public port: ${error.message}`))
      resolve(server)
    })
  })
}

/**
 * A TCP port from env text: an integer from 1 to 65535, or the fallback when unset.
 * @param {string | undefined} value
 * @param {number} fallback
 * @returns {number}
 */
export function parsePort(value, fallback) {
  const text = value?.trim()
  if (!text) return fallback
  const port = Number(text)
  if (!/^\d+$/.test(text) || port < 1 || port > 65_535) throw new Error(`invalid port: ${value}`)
  return port
}

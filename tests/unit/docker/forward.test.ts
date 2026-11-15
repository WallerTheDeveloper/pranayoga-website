import net from 'node:net'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { forwardTcp, parsePort } from '../../../docker/forward.mjs'

const servers: net.Server[] = []

afterEach(async () => {
  await Promise.all(
    servers
      .splice(0)
      .map((server) => new Promise<void>((resolve) => server.close(() => resolve()))),
  )
})

function portOf(server: net.Server): number {
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('not listening on TCP')
  return address.port
}

/** A target that answers once the client has finished sending (needs half-open sockets). */
async function startTarget(): Promise<net.Server> {
  const server = net.createServer({ allowHalfOpen: true }, (socket) => {
    let received = ''
    socket.setEncoding('utf8')
    socket.on('data', (chunk: string) => {
      received += chunk
    })
    socket.on('end', () => socket.end(`got:${received}`))
  })
  servers.push(server)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  return server
}

async function startForwarder(targetPort: number, onError = vi.fn()): Promise<net.Server> {
  const server = await forwardTcp({
    listen: { host: '127.0.0.1', port: 0 },
    target: { host: '127.0.0.1', port: targetPort },
    onError,
  })
  servers.push(server)
  return server
}

/** Sends a message, ends the sending side and collects everything until the socket closes. */
function exchange(port: number, message: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: '127.0.0.1', port, allowHalfOpen: true })
    let reply = ''
    socket.setEncoding('utf8')
    socket.on('data', (chunk: string) => {
      reply += chunk
    })
    socket.on('error', reject)
    socket.on('close', () => resolve(reply))
    socket.end(message)
  })
}

describe('forwardTcp', () => {
  it('passes bytes both ways, including the reply after the client ended its side', async () => {
    const target = await startTarget()
    const forwarder = await startForwarder(portOf(target))

    await expect(exchange(portOf(forwarder), 'GET / HTTP/1.1')).resolves.toBe('got:GET / HTTP/1.1')
  })

  it('closes the client connection and reports when the target is down', async () => {
    const target = await startTarget()
    const deadPort = portOf(target)
    await new Promise<void>((resolve) => servers.splice(0, 1)[0]?.close(() => resolve()))
    const onError = vi.fn()
    const forwarder = await startForwarder(deadPort, onError)

    // Depending on timing the client sees a reset or a plain close; either way, no reply.
    const reply = await exchange(portOf(forwarder), 'hello').catch(
      (error: NodeJS.ErrnoException) => (error.code === 'ECONNRESET' ? '' : Promise.reject(error)),
    )
    expect(reply).toBe('')
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining(`forwarding to 127.0.0.1:${deadPort} failed`),
    )
  })

  it('rejects when the public port is taken', async () => {
    const target = await startTarget()
    await expect(
      forwardTcp({
        listen: { host: '127.0.0.1', port: portOf(target) },
        target: { host: '127.0.0.1', port: 1 },
      }),
    ).rejects.toThrow(/EADDRINUSE/)
  })
})

describe('parsePort', () => {
  it('uses the fallback when unset or blank', () => {
    expect(parsePort(undefined, 3000)).toBe(3000)
    expect(parsePort('  ', 3001)).toBe(3001)
  })

  it('reads a valid port, ignoring surrounding spaces', () => {
    expect(parsePort(' 3100 ', 3000)).toBe(3100)
    expect(parsePort('65535', 3000)).toBe(65_535)
  })

  it.each(['0', '65536', '3.5', '-1', 'abc', '3000x', '1e3'])('refuses %s', (value) => {
    expect(() => parsePort(value, 3000)).toThrow(/invalid port/)
  })
})

import type { FastifyInstance } from 'fastify'

export async function healthRoute(app: FastifyInstance) {
  app.get('/healthz', async () => {
    return { ok: true, timestamp: new Date().toISOString() }
  })
}

import type { FastifyInstance } from 'fastify'

export async function healthRoute(app: FastifyInstance) {
  app.get('/', async () => {
    return { ok: true, message: 'RestoMap API', timestamp: new Date().toISOString() }
  })
  
  app.get('/healthz', async () => {
    return { ok: true, timestamp: new Date().toISOString() }
  })
}

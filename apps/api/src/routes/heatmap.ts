import type { FastifyInstance } from 'fastify'
import { getLocationFactors, getProvinces, getDomains, getRegionalHeatmapCells } from '../services/BPSService'

export async function heatmapRoutes(app: FastifyInstance) {

  // GET /heatmap/factors?lat=&lng=&radius=
  // Returns factor data for a specific location
  app.get('/heatmap/factors', async (request, reply) => {
    const { lat, lng, radius } = request.query as { lat?: string; lng?: string; radius?: string }

    if (!lat || !lng || !radius) {
      return reply.code(400).send({ 
        ok: false, 
        error: 'MISSING_PARAMS',
        message: 'lat, lng, and radius are required' 
      })
    }

    try {
      const factors = await getLocationFactors(
        parseFloat(lat),
        parseFloat(lng),
        parseInt(radius)
      )

      return reply.send({
        ok: true,
        data: {
          location: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) },
          factors,
          source: 'bps_api',
        },
      })
    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: 'Failed to fetch heatmap data' })
    }
  })

  // GET /heatmap/regional?lat=&lng=&radius=
  // Returns regional heatmap cells aligned to BPS-style administrative areas
  app.get('/heatmap/regional', async (request, reply) => {
    const { lat, lng, radius } = request.query as { lat?: string; lng?: string; radius?: string }

    if (!lat || !lng || !radius) {
      return reply.code(400).send({ ok: false, error: 'MISSING_PARAMS', message: 'lat, lng, and radius are required' })
    }

    try {
      const cells = await getRegionalHeatmapCells(parseFloat(lat), parseFloat(lng), parseInt(radius))
      return reply.send({
        ok: true,
        data: {
          location: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseInt(radius) },
          cells,
          source: 'bps_region_model',
        },
      })
    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: 'Failed to fetch regional heatmap data' })
    }
  })

  // GET /heatmap/regions
  // Returns all available regions (provinces) for heatmap selection
  app.get('/heatmap/regions', async (request, reply) => {
    try {
      const provinces = await getProvinces()
      return reply.send({
        ok: true,
        data: provinces,
      })
    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: 'Failed to fetch regions' })
    }
  })

  // GET /heatmap/cities?provinceId=
  // Returns cities for a specific province
  app.get('/heatmap/cities', async (request, reply) => {
    const { provinceId } = request.query as { provinceId?: string }

    if (!provinceId) {
      return reply.code(400).send({ 
        ok: false, 
        error: 'MISSING_PARAMS',
        message: 'provinceId is required' 
      })
    }

    try {
      const cities = await getCities(provinceId)
      return reply.send({
        ok: true,
        data: cities,
      })
    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: 'Failed to fetch cities' })
    }
  })
}

// Need to import getCities
import { getCities } from '../services/BPSService'

import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { buildReportHtml, type SavedLocation } from '../services/ReportGenerator'

const LocationSchema = z.object({
  id:       z.string(),
  name:     z.string(),
  pin:      z.object({ lat: z.number(), lng: z.number(), address: z.string().optional() }),
  radius:   z.number(),
  weights:  z.record(z.number()),
  category: z.string().nullable(),
  score:    z.number().nullable(),
  savedAt:  z.string(),
})

export async function reportRoutes(app: FastifyInstance) {
  // POST /reports/generate — returns PDF binary
  app.post('/generate', async (request, reply) => {
    try {
      const loc = LocationSchema.parse(request.body) as SavedLocation
      const generatedAt = new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })

      const html = buildReportHtml(loc, generatedAt)

      // Try to use Puppeteer if available, otherwise return HTML
      try {
        const puppeteer = await import('puppeteer-core')
        const chromium  = await import('@sparticuz/chromium-min')

        const browser = await puppeteer.default.launch({
          args: (chromium as any).default?.args ?? [],
          executablePath: await (chromium as any).default?.executablePath(
            'https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar'
          ),
          headless: true,
        })

        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })
        const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } })
        await browser.close()

        const filename = `RestoMap_${loc.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`
        return reply
          .header('Content-Type', 'application/pdf')
          .header('Content-Disposition', `attachment; filename="${filename}"`)
          .send(Buffer.from(pdf))

      } catch {
        // Puppeteer not available — return HTML preview instead
        const filename = `RestoMap_${loc.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`
        return reply
          .header('Content-Type', 'text/html; charset=utf-8')
          .header('Content-Disposition', `attachment; filename="${filename}"`)
          .send(html)
      }

    } catch (err: any) {
      return reply.code(400).send({ ok: false, error: err.message })
    }
  })
}

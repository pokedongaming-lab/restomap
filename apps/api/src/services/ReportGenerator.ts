export type SavedLocation = {
  id: string
  name: string
  pin: { lat: number; lng: number; address?: string }
  radius: number
  weights: Record<string, number>
  category: string | null
  score: number | null
  savedAt: string
}

// ─── HTML Template ────────────────────────────────────────────────────────────

export function buildReportHtml(loc: SavedLocation, generatedAt: string): string {
  const factorLabels: Record<string, string> = {
    population:  'Kepadatan Penduduk',
    traffic:     'Traffic',
    income:      'Daya Beli',
    competition: 'Kompetitor',
    parking:     'Parkir',
    rent:        'Harga Sewa',
  }

  const scoreColor = (loc.score ?? 0) >= 70 ? '#16a34a' : (loc.score ?? 0) >= 40 ? '#d97706' : '#dc2626'

  const factorRows = Object.entries(loc.weights)
    .sort((a, b) => b[1] - a[1])
    .map(([key, weight]) => {
      const estimated = ((weight / 100) * (loc.score ?? 50) * 2).toFixed(1)
      const bar = Math.round((Number(estimated) / 100) * 200)
      return `
        <tr>
          <td style="padding:8px 12px;font-size:13px;color:#374151">${factorLabels[key] ?? key}</td>
          <td style="padding:8px 12px;">
            <div style="background:#f3f4f6;border-radius:4px;height:8px;width:200px">
              <div style="background:#4f46e5;border-radius:4px;height:8px;width:${bar}px"></div>
            </div>
          </td>
          <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#4f46e5;text-align:right">${estimated}</td>
          <td style="padding:8px 12px;font-size:12px;color:#9ca3af;text-align:right">${weight}%</td>
        </tr>
      `
    }).join('')

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1f2937; }
    .page { max-width: 800px; margin: 0 auto; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #4f46e5; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-box { width: 36px; height: 36px; background: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 16px; }
    .logo-text { font-size: 20px; font-weight: 800; color: #1f2937; }
    .meta { font-size: 12px; color: #9ca3af; text-align: right; }
    .score-section { display: flex; gap: 24px; margin-bottom: 32px; }
    .score-box { background: #eef2ff; border-radius: 16px; padding: 24px 32px; text-align: center; min-width: 140px; }
    .score-number { font-size: 56px; font-weight: 800; color: ${scoreColor}; line-height: 1; }
    .score-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .location-info { flex: 1; }
    .location-name { font-size: 22px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
    .location-address { font-size: 13px; color: #6b7280; margin-bottom: 12px; line-height: 1.5; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag { background: #f3f4f6; border-radius: 20px; padding: 4px 12px; font-size: 12px; color: #374151; }
    .section-title { font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    tr:nth-child(even) { background: #f9fafb; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
    .disclaimer { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #92400e; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-box">R</div>
        <span class="logo-text">RestoMap</span>
      </div>
      <div class="meta">
        <div>Laporan Analisa Lokasi</div>
        <div>${generatedAt}</div>
      </div>
    </div>

    <div class="score-section">
      <div class="score-box">
        <div class="score-number">${loc.score ?? '-'}</div>
        <div class="score-label">Skor Potensi</div>
      </div>
      <div class="location-info">
        <div class="location-name">${loc.name}</div>
        <div class="location-address">${loc.pin?.address ?? `${loc.pin?.lat?.toFixed(5)}, ${loc.pin?.lng?.toFixed(5)}`}</div>
        <div class="tags">
          <span class="tag">📍 Radius: ${loc.radius >= 1000 ? `${loc.radius/1000}km` : `${loc.radius}m`}</span>
          ${loc.category ? `<span class="tag">🍽️ ${loc.category}</span>` : ''}
          <span class="tag">📅 ${new Date(loc.savedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </div>

    <div class="section-title">Breakdown Faktor Scoring</div>
    <table>
      <thead>
        <tr style="background:#f3f4f6">
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280">Faktor</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280">Distribusi</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280">Skor</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280">Bobot</th>
        </tr>
      </thead>
      <tbody>${factorRows}</tbody>
    </table>

    <div class="disclaimer">
      ⚠️ Skor ini adalah estimasi berdasarkan data area dan bobot yang dikonfigurasi. Bukan merupakan jaminan keberhasilan bisnis. Lakukan due diligence sebelum mengambil keputusan investasi.
    </div>

    <div class="footer">
      <span>RestoMap — Restaurant Location Intelligence Platform</span>
      <span>restomap.id · hello@restomap.id</span>
    </div>
  </div>
</body>
</html>`
}

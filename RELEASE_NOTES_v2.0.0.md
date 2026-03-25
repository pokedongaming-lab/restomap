# RestoSuite RestoMap/Builder — Release Notes v2.0.0

Tanggal: 2026-03-25 (Asia/Makassar)

## Highlights
- RestoMap dan RestoBuilder kini sinkron end-to-end.
- Bilingual hardening (ID/EN) untuk alur utama, runtime text, dan sidebar method flow.
- Method pipeline diperjelas: Bayes, HHI, Voronoi, Cannibal, MMM, MILP.
- Financial model di RestoMap dibuat lebih realistis (revenue, margin, break-even) + panel Asumsi Finansial.
- Edit Asumsi kini pakai modal interaktif (bukan prompt beruntun).
- Top-N Best Location (Top 1/3/5) per kota terpilih.
- Heatmap visual overlay + Voronoi proxy overlay on-map.
- Competitor intelligence report: Direct/Indirect/Replacement/Potential + SWOT ringkas.
- Theme system diperluas (grey/navy/blue + legacy themes), persistence lintas halaman.

## Functional Changes
### RestoMap
- City-specific best-location fixed.
- Daftar kota besar Indonesia diperluas.
- Kategori restoran diperluas (Google-aligned taxonomy).
- Marker hotspot default dihapus; hasil best-location menghasilkan titik kandidat bernomor.
- Top-N selector ditambahkan.
- Map style dikembalikan ke default light untuk readability.

### RestoBuilder
- Flow urutan final: Concept & Basic → Market Analysis → Menu Design → Space Design → Operations & Team → Launch Strategy → Financial Model → Results & Documents.
- Sidebar method narrative diperjelas sesuai referensi riset.
- Standard parameters ditampilkan.
- Method Trace panel ditambahkan pada Results.

## UX/Polish
- Readability panel kiri ditingkatkan.
- Responsiveness panel/tab ditingkatkan untuk layar 1366 ke bawah.
- CTA dan tata letak komponen disesuaikan dari feedback testing.

## Release Integrity
- Semua perubahan dicatat di `REVISION_LOG.md` (REV-20260325-01 s.d. REV-20260325-26).
- Final smoke check:
  - Web 3000: OK
  - API 3001: OK
  - Competitors endpoint: OK
  - Heatmap factors endpoint: OK

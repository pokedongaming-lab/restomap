# Post-Release Quick Runbook (v2.0.0)

Durasi target: 5-10 menit

## 1) Service Health (1 menit)
- Web: `http://localhost:3000/restomap.html` -> harus 200
- Builder: `http://localhost:3000/restobuilder.html` -> harus 200
- API root: `http://localhost:3001/` -> `{ ok: true }`

## 2) Core API Smoke (1-2 menit)
- `GET /competitors?lat=-6.9667&lng=110.4167&radius=1000&category=coffee_shop`
  - Ekspektasi: `ok=true`, list competitors terisi
- `GET /heatmap/factors?lat=-6.9667&lng=110.4167&radius=1000`
  - Ekspektasi: factors terisi

## 3) UI Flow Smoke (2-3 menit)
1. Buka RestoMap
2. Pilih kota Semarang
3. Set Top 3, klik Cari Lokasi Terbaik
4. Pastikan panel menampilkan `TOP 3 LOKASI` dan marker bernomor muncul
5. Aktifkan heatmap Pop/Traffic/Income + Voronoi
6. Buka tab Competitors, cek grup Direct/Indirect/Replacement/Potential + SWOT
7. Klik Edit Asumsi, ubah 1 nilai, Apply
8. Pastikan revenue/margin/break-even berubah
9. Klik Create Business Plan -> masuk ke RestoBuilder
10. Cek category tersinkron ke concept/cuisine default

## 4) Theme Persistence Check (1 menit)
- Ubah tema di RestoMap
- Buka RestoBuilder
- Ekspektasi: tema ikut tersimpan (`localStorage: restosuite_theme`)

## 5) Fast Rollback (jika ada isu)
- Cek commit terbaru:
  - `git -C restomap log --oneline -10`
- Rollback ke tag stabil:
  - `git -C restomap checkout v2.0.0`
- Atau rollback 1 commit:
  - `git -C restomap reset --hard HEAD~1`

## 6) Escalation Notes
Jika issue ditemukan, catat minimal:
- Timestamp (GMT+8)
- URL/halaman
- langkah reproduksi
- screenshot
- commit hash saat issue terjadi

Simpan issue hotfix ke `REVISION_LOG.md` dengan format `REV-YYYYMMDD-XX`.

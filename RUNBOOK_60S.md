# 60-Second Ops Checklist

Target: verifikasi cepat dalam 60 detik.

## Quick Checks
1. Buka `http://localhost:3000/restomap.html` -> harus tampil
2. Buka `http://localhost:3000/restobuilder.html` -> harus tampil
3. Cek API root `http://localhost:3001/` -> `{ ok: true }`
4. Pilih kota + klik `Cari Lokasi Terbaik` -> marker Top-N muncul
5. Aktifkan 1 layer heatmap -> overlay warna muncul

## Pass Criteria
- Semua URL terbuka
- Tidak ada error blocker di UI
- Top-N dan heatmap berfungsi

## If Failed (Fast Action)
- Restart API: `cd restomap/apps/api && npm run dev`
- Restart Web: `cd restomap/apps/web && npm run dev`
- Recheck langkah 1-5

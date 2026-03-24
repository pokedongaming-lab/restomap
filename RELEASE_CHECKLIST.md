# RestoMap Release Checklist

## 1) Scope & Versioning
- [ ] Tentukan release version (mis. `v2.0.x`)
- [ ] Update changelog/release notes
- [ ] Pastikan seluruh commit Loop #1–#7 sudah masuk branch release

## 2) Environment & Config
- [ ] `GOOGLE_MAPS_API_KEY` terisi di environment production
- [ ] `SERP_API_KEY` terisi (jika dipakai route terkait)
- [ ] API base URL frontend sesuai env (`localhost` hanya untuk dev)
- [ ] CORS policy sesuai domain production
- [ ] Secrets tidak hardcoded di HTML/JS

## 3) Backend Readiness (Port 3001)
- [ ] API server up (`GET /` = ok)
- [ ] `GET /heatmap/factors` berjalan (source `bps_api` / fallback valid)
- [ ] `GET /competitors` berjalan (source `google_places` / fallback valid)
- [ ] `GET /gap-category` berjalan
- [ ] Logging tidak ada error blocker di startup/runtime
- [ ] Retry/timeout behavior valid untuk request lambat

## 4) Frontend Readiness (Port 3000)
- [ ] `restomap.html` status 200
- [ ] Google Maps load sukses (map tampil, marker klikable)
- [ ] Klik map => panel analisis update
- [ ] Revenue/Break-even/Margin tampil masuk akal (bukan `0.0JT`)
- [ ] Brand search chip + Enter keyword memicu refresh data
- [ ] Empty state brand tanpa hasil tampil dengan guidance
- [ ] Tab behavior stabil (active tab tidak reset saat renderAnalysis)
- [ ] Loading placeholders muncul saat fetch berlangsung
- [ ] Saved locations create/load/delete berjalan
- [ ] Cannibalization add existing + analyze berjalan

## 5) Localization / UX
- [ ] Toggle bahasa ID/EN konsisten untuk static + runtime text
- [ ] Label penting tidak garbled/corrupt (encoding aman)
- [ ] Theme toggle (Bloomberg/Matrix/Arctic/Ember) berjalan
- [ ] Tier toggle (FREE/BASIC/PRO) berjalan tanpa JS error

## 6) Regression Test Matrix
- [ ] Scenario A: klik lokasi preset (Sudirman/SCBD)
- [ ] Scenario B: klik bebas di map
- [ ] Scenario C: category filter + brand filter
- [ ] Scenario D: heatmap toggles (pop/traffic/income)
- [ ] Scenario E: switch tab cepat (overview/competitor/heatmap/cannibal/ai)
- [ ] Scenario F: jaringan lambat (validasi timeout/retry + loading state)

## 7) Security & Compliance
- [ ] Tidak ada API key di-commit ke repo public
- [ ] Tidak ada endpoint debug yang terbuka ke publik
- [ ] Validasi input query params (lat/lng/radius/category)
- [ ] Error message aman (tidak bocor secret/internal stack detail)

## 8) Performance Sanity
- [ ] Debounce request aktif (tidak spam API saat klik cepat)
- [ ] API response time acceptable di radius default
- [ ] Browser console bebas error blocker (warning non-blocking boleh)

## 9) Git / Release Ops
- [ ] Branch release up-to-date dengan `master`
- [ ] Tag release dibuat
- [ ] PR sudah di-review dan approved
- [ ] CI/CD (jika ada) hijau
- [ ] Rollback plan disiapkan

## 10) Post-Release Verification
- [ ] Smoke test production URL
- [ ] Cek logs 15–30 menit pertama
- [ ] Verifikasi competitor + heatmap live data di production
- [ ] Konfirmasi user acceptance (Boss sign-off)

---

## Included Changes (Loop #1–#7)
- [x] Env loading fix API (tsx watch) sebelum route import
- [x] Integrasi API live untuk competitors/heatmap/gap-category
- [x] Fix revenue calculation
- [x] Brand filter refresh + Enter search
- [x] Bersih duplikasi blok analysis lama
- [x] Stabilisasi tab + clickableIcons false
- [x] Debounce render analysis
- [x] Timeout + retry fetch
- [x] Runtime i18n + localized loading/empty states
- [x] QA final pass

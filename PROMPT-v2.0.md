# RestoSuite v2.0 — AutoSaaS Prompt FINAL
**Versi:** 2.0 | **Tanggal:** Maret 2026  
**Status:** Production-Ready + v2.0 Roadmap

---

## 🚀 ROADMAP v2.0 FEATURES

### Module 1: RestoMap++ (Location Intelligence)
| Fitur | Tier | Kompleksitas |
|---|---|---|
| **AI Site Scoring** — ML model scoring lokasi berdasarkan 20+ faktor | Pro | ⭐⭐⭐ |
| **Foot Traffic Heatmap** — integrasi data pergerakan dari Google Popular Times | Pro | ⭐⭐⭐ |
| **Competitor Trend Tracker** — pantau rating/review kompetitor dari waktu ke waktu | Pro | ⭐⭐ |
| **Trade Area Analysis** — isochrone map (berapa menit jangkauan) | Pro | ⭐⭐ |
| **Demographic Drill-down** — piramida usia, daya beli, profil BPS per kecamatan | Pro | ⭐⭐ |
| **Void Analysis** — deteksi "area kosong" tanpa restoran sejenis dalam radius | Enterprise | ⭐⭐⭐ |
| **Multi-Location Compare** — bandingkan 2–5 kandidat lokasi side-by-side | Pro | ⭐⭐ |
| **Street View Preview** — embed Google Street View langsung di hasil analisis | Pro | ⭐ |
| **Real Estate Integration** — harga sewa per m² area dari properti listing | Enterprise | ⭐⭐⭐ |

### Module 2: REB++ (Restaurant Economics Builder)
| Fitur | Tier | Kompleksitas |
|---|---|---|
| **Monte Carlo Simulation** — simulasi 10.000 skenario keuangan | Pro | ⭐⭐⭐ |
| **Menu Engineering Matrix** — Stars/Plowhorses/Puzzles/Dogs analysis | Pro | ⭐⭐ |
| **Labor Scheduling Optimizer** — hitung shift optimal vs forecast traffic | Pro | ⭐⭐⭐ |
| **Loan/KUR Simulator** — simulasi cicilan bank / KUR Mikro | Free/Pro | ⭐ |
| **Investor Deck Generator** — auto-generate slide deck pitch 10 halaman | Enterprise | ⭐⭐⭐ |
| **P&L Tracker** — input aktual vs proyeksi bulan ke bulan | Pro | ⭐⭐ |
| **Cost of Goods Calculator** — recipe costing per menu item | Pro | ⭐⭐ |
| **Franchise Feasibility** — kalkulasi royalty, territory, breakeven franchise | Enterprise | ⭐⭐⭐ |

### Module 3: Dashboard++ (Analytics Hub)
| Fitur | Tier | Kompleksitas |
|---|---|---|
| **Portfolio View** — kelola multiple restoran dalam satu akun | Pro | ⭐⭐ |
| **Market Intelligence Feed** — berita F&B industry, tren kuliner, FnB index | Pro | ⭐⭐ |
| **Benchmarking** — bandingkan KPI dengan rata-rata industri | Pro | ⭐⭐⭐ |
| **Alert System** — notifikasi jika kompetitor baru muncul di radius | Pro | ⭐⭐ |
| **Custom Report Builder** — drag-drop metrics ke report template | Enterprise | ⭐⭐⭐ |
| **Export ke Google Sheets** — sync otomatis data ke spreadsheet | Pro | ⭐⭐ |

### Module 4: AI Suite (NEW Module)
| Fitur | Tier | Kompleksitas |
|---|---|---|
| **AI Market Analyst** — chat dengan AI tentang lokasi/pasar (RAG + OpenAI) | Pro | ⭐⭐⭐ |
| **Menu Name Generator** — AI generate nama menu, deskripsi, dan harga | Pro | ⭐⭐ |
| **Review Sentiment Analyzer** — analisis ulasan Google Maps kompetitor | Pro | ⭐⭐⭐ |
| **Social Media Content AI** — auto-generate caption IG/TikTok untuk launch | Pro | ⭐⭐ |
| **Demand Forecasting** — prediksi peak/off-peak berdasarkan kalender & cuaca | Enterprise | ⭐⭐⭐ |

### Module 5: Integrations (NEW)
| Integrasi | Tier | Keterangan |
|---|---|---|
| **GoFood/GrabFood API** — lihat rating & ranking di platform delivery | Pro | |
| **Tokopedia/Shopee Food** — pantau GMV kompetitor | Enterprise | |
| **WhatsApp Business API** — kirim laporan via WA | Pro | |
| **Jurnal.id / Accurate** — sync data keuangan ke akuntansi | Enterprise | |
| **Zapier Webhook** — connect ke 5000+ tools | Enterprise | |
| **Google Business Profile** — monitor & respond review langsung | Pro | |

---

## 🗺️ URUTAN BUILD YANG DISARANKAN

```
Sprint 1 (2 minggu): Deploy + DB + Auth proper
Sprint 2 (2 minggu): Payment (Midtrans) + Feature gating
Sprint 3 (2 minggu): Multi-Location Compare + Trade Area Analysis
Sprint 4 (2 minggu): Monte Carlo + Menu Engineering Matrix
Sprint 5 (2 minggu): AI Market Analyst (OpenAI RAG) + Review Sentiment
Sprint 6+: Integrations & Enterprise features
```

---

## 💡 QUICK WINS (1–2 hari)

1. **KUR Simulator** — form sederhana cicilan bank, sangat relevan UMKM
2. **Street View Preview** — embed 1 baris kode Google Maps Embed API
3. **Loan Calculator** — kalkulasi modal pinjaman vs equity
4. **Export ke Google Sheets** — Google Sheets API, 1 klik sync
5. **WhatsApp share laporan** — share link wa.me dengan ringkasan analisis

---

## 📋 TECH STACK

- **Frontend**: HTML/CSS/JS (vanilla), Chart.js 4.4.1
- **Backend**: Node.js + Express (REST, JSON)
- **Database**: PostgreSQL 15 + PostGIS
- **Cache**: Redis
- **Auth**: JWT + bcryptjs
- **Deployment**: Docker + Docker Compose
- **AI**: OpenAI API (for AI Suite)
- **Maps**: Google Maps API

---

## 🎯 PRIORITY RECOMMENDATION

**Phase 1: Foundation (Critical)**
- Deploy + Database + Auth proper
- Payment Gateway (Midtrans) + Feature Gating

**Phase 2: Quick Wins (1-2 minggu)**
1. Street View Preview ⭐ (1 hari)
2. KUR/Loan Simulator ⭐ (2 hari)
3. Multi-Location Compare ⭐⭐ (3-4 hari)
4. Export to Google Sheets ⭐ (2 hari)

**Phase 3: Differentiators (2-3 minggu)**
1. AI Market Analyst ⭐⭐⭐ (RAG + OpenAI)
2. Monte Carlo Simulation ⭐⭐⭐
3. Review Sentiment Analyzer ⭐⭐⭐

**Phase 4: Enterprise (bulan 2-3)**
- Integrations (GoFood, GrabFood, etc.)
- Custom Report Builder
- Franchise Feasibility

---

*Full technical specification tersedia di PRD lengkap. Gunakan dokumen ini sebagai roadmap prioritization.*

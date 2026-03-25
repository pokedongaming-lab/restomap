# RestoSuite Revision Log

Format versi yang dipakai:
- `REV-YYYYMMDD-XX`
- Contoh: `REV-20260325-01`

## REV-20260325-23
- Commit: `(pending)`
- Scope: Financial Assumptions panel
- Changes:
  - Tambah panel `Asumsi Finansial` di Overview
  - Tampilkan asumsi inti: seats, turnover, avg check, occupancy, monthly covers
  - Tampilkan struktur cost: COGS, labor ratio, marketing, rent factor, CAPEX
  - Tambah fallback message saat mode fallback
- Reason:
  - Permintaan user agar dasar hitung finansial transparan dan mudah dipahami

## REV-20260325-22
- Commit: `eed68c8`
- Scope: Realistic financial formulas (RestoMap)
- Changes:
  - Formula revenue/breakeven/margin diganti ke model operasional realistis
  - Hitung revenue dari seats × turnover × occupancy × avg check (per kategori)
  - Opex berbasis COGS + labor + rent + marketing (dengan city rent factor)
  - Break-even dihitung dari CAPEX / monthly profit (fallback `>36 bln` saat profit negatif/rendah)
  - Score akhir mempertimbangkan demand index vs competition pressure
- Reason:
  - Permintaan user agar metrik finansial lebih realistis sesuai riset & konsep restoran

## REV-20260325-21
- Commit: `6442a27`
- Scope: Competitor intelligence report
- Changes:
  - Struktur report kompetitor menjadi 4 grup: Direct / Indirect / Replacement / Potential
  - Tambah snapshot summary (total, direct count, avg direct rating)
  - Tambah potential competitor/gap cards dari hasil category-gap
  - Tambah SWOT analysis ringkas (S/W/O/T) berbasis metrik lokasi (Bayes/HHI/Cannibal)
- Reason:
  - Menjawab kebutuhan analisa kompetitor yang lebih lengkap untuk keputusan bisnis

## REV-20260325-20
- Commit: `cdfa892`
- Scope: Heatmap + Voronoi visual overlays
- Changes:
  - Tambah layer visual heatmap langsung di map (Populasi, Traffic, Income)
  - Tambah checkbox `Voronoi` untuk analisa geospasial overlay (proxy)
  - Overlay mengikuti brand/kategori terpilih melalui data kompetitor terbaru
  - Tambah clear/re-render logic agar layer sinkron saat analisis berubah
- Reason:
  - Permintaan user agar heatmap dan analisa Voronoi benar-benar muncul secara visual di map

## REV-20260325-19
- Commit: `e1c496e`
- Scope: Category expansion + Builder sync
- Changes:
  - Perluas daftar kategori restoran di RestoMap (Google-aligned categories)
  - Mapping kategori -> concept default di RestoBuilder
  - Mapping kategori -> cuisine default di RestoBuilder
  - Cuisine selector di Step 1 sekarang sinkron dengan nilai default dari category
- Reason:
  - Permintaan user agar kategori lebih lengkap dan terhubung langsung ke RestoBuilder

## REV-20260325-18
- Commit: `92b86bd`
- Scope: Top-N visualization behavior
- Changes:
  - Untuk Top 3/Top 5, nonaktifkan auto-select titik #1
  - Pertahankan mode multi-point (semua titik hasil tetap jadi fokus)
  - Header panel menampilkan konteks `TOP N LOKASI`
  - Marker merah detail hanya muncul saat mode Top 1 atau saat user klik salah satu titik bernomor
- Reason:
  - User melihat hasil seperti hanya 1 titik karena auto-select marker #1

## REV-20260325-17
- Commit: `3f8564e`
- Scope: Map readability (RestoMap)
- Changes:
  - Hapus custom dark map style pada Google Maps
  - Kembalikan ke style default Google (terang/lebih jelas)
- Reason:
  - User minta map tidak gelap agar detail jalan/lokasi lebih mudah terbaca

## REV-20260325-16
- Commit: `ff372e4`
- Scope: Top-N best-location selector (RestoMap)
- Changes:
  - Tambah selector hasil `Top 1 / Top 3 / Top 5`
  - `Cari Lokasi Terbaik` mengikuti nilai selector Top-N
  - Marker, fit-bounds, ringkasan panel, dan alert disesuaikan dengan Top-N terpilih
- Reason:
  - Permintaan user untuk fleksibilitas jumlah kandidat lokasi terbaik

## REV-20260325-15
- Commit: `1ec52ff`
- Scope: Best-location UX overhaul (RestoMap)
- Changes:
  - Hapus marker hotspot default hitam-oranye (predefined markers)
  - Tombol `Cari Lokasi Terbaik` sekarang menghasilkan 5 titik terbaik pada kota terpilih
  - Top-5 ditampilkan sebagai marker bernomor (1–5) di map
  - Auto-fit bounds ke area top-5 dan auto-select titik #1
  - Ringkasan top-5 ditampilkan di panel (tab competitor list)
- Reason:
  - Permintaan user agar map lebih clean dan hasil best-location berupa 5 kandidat, bukan 1 titik

## REV-20260325-14
- Commit: `623b598`
- Scope: CTA position refinement (RestoMap)
- Changes:
  - Pindahkan tombol `Cari Lokasi Terbaik` ke bawah tombol `Simpan Lokasi`
  - Hapus posisi lama di bagian atas sidebar
- Reason:
  - Permintaan user agar urutan CTA lebih natural (save lalu find best)

## REV-20260325-13
- Commit: `1f6c969`
- Scope: Theme persistence + legacy color preservation
- Changes:
  - Tambah persistence tema via `localStorage` key `restosuite_theme`
  - Sinkronkan tema antar RestoMap ↔ RestoBuilder
  - Pertahankan warna lama (Matrix, Arctic, Ember) sebagai opsi legacy
  - Tetap sediakan tema baru (Dark Grey, Grey, Navy, Blue)
- Reason:
  - User minta tema tersimpan dan warna lama tetap tersedia

## REV-20260325-12
- Commit: `6cc0fc2`
- Scope: Theme expansion (RestoMap + RestoBuilder)
- Changes:
  - Tambah pilihan tema non-hitam: Dark Grey, Grey, Navy, Blue
  - Terapkan skema warna baru di RestoBuilder (sebelumnya dominan hitam)
  - Tambah theme swatches di topbar RestoBuilder
  - Sinkronkan default look & feel ke nuansa navy
- Reason:
  - Permintaan user agar tema tidak hanya hitam dan konsisten di kedua halaman

## REV-20260325-11
- Commit: `9763f8f`
- Scope: Readability + visual theme (RestoMap)
- Changes:
  - Naikkan kontras default theme (tidak dominan hitam murni)
  - Sidebar diubah ke gradasi navy agar teks lebih terbaca
  - Label sidebar diperbesar dan diperjelas
  - Label kriteria slider (Traffic/Daya Beli/Populasi/Jalan Utama/Jalan Alternatif) diperbesar dan dibuat lebih kontras
- Reason:
  - Teks pada panel kiri kurang jelas pada tampilan sebelumnya

## REV-20260325-01
- Commit: `987c53f`
- Scope: UI cleanup (RestoMap)
- Changes:
  - Hapus map search overlay (`Cari lokasi...`) dari atas map
  - Hapus CSS `.map-search`
  - Hapus JS listener `searchBox` agar tidak null error
- Reason:
  - Menghindari tumpang tindih dengan kontrol Google Maps dan membuat tampilan lebih clean

## REV-20260325-02
- Commit: `7d6af32`
- Scope: UX + city logic
- Changes:
  - Tombol `Cari Lokasi Terbaik` tetap di area atas
  - Posisi map controls tidak overlap
  - Best location dipaksa mengikuti kota terpilih

## REV-20260325-03
- Commit: `f3f1b6e`
- Scope: Prioritas 1
- Changes:
  - Perbaikan city-specific best location
  - Tambah kota besar Indonesia
  - Pindahkan CTA best-location ke atas
  - Hapus tombol builder duplikat di sidebar

## REV-20260325-04
- Commit: `4513742`
- Scope: Builder baseline
- Changes:
  - Tambah `STANDARD_PARAMS`
  - Tambah panel parameter standar di sidebar

## REV-20260325-05
- Commit: `df891f4`
- Scope: Traceability
- Changes:
  - Tambah panel `Method Trace` pada Results & Documents

## REV-20260325-06
- Commit: `612abd4`
- Scope: Sync methods
- Changes:
  - Sinkronisasi metrik metode dari RestoMap ke RestoBuilder
  - Mapping metode lintas modul

## REV-20260325-07
- Commit: `870a6d6`
- Scope: Builder sidebar clarity
- Changes:
  - Sidebar kiri diperjelas dengan metodologi riset (Bayes/HHI/MMM/MILP/Geo/Voronoi)

## REV-20260325-08
- Commit: `baab3d1`
- Scope: i18n hardening
- Changes:
  - Narasi bilingual step 2–8 diperkuat

## REV-20260325-09
- Commit: `c0c402b`
- Scope: i18n finalize
- Changes:
  - Label bilingual final untuk RestoMap + RestoBuilder

## REV-20260325-10
- Commit: `312f08d`
- Scope: major enhancement
- Changes:
  - Builder bilingual toggle
  - Kriteria map diperluas
  - Voronoi + cannibal insight block

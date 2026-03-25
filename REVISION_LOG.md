# RestoSuite Revision Log

Format versi yang dipakai:
- `REV-YYYYMMDD-XX`
- Contoh: `REV-20260325-01`

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

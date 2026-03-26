# RestoSuite Revision Log

Format versi yang dipakai:
- `REV-YYYYMMDD-XX`
- Contoh: `REV-20260325-01`

## REV-20260326-22
- Commit: `(pending)`
- Scope: Product Refactor 2 — phase 2
- Changes:
  - Integrasikan regional support dan competitor pressure langsung ke skor kandidat akhir
  - Rapikan formula ranking best-location agar lebih matematis dan locator-grade
  - Perkuat breakdown score untuk audit keputusan
- Reason:
  - Melanjutkan Product Refactor 2 agar best-location tidak hanya punya reason yang kaya, tetapi juga score akhir yang benar-benar mencerminkan intelligence layers utama

## REV-20260326-21
- Commit: `8df14a8`
- Scope: Product Refactor 2 — Best Location Intelligence Core (phase 1)
- Changes:
  - Satukan competitor engine, corridor, region, dan Voronoi ke best-location ranking core
  - Tambah scoring summary yang lebih eksplisit untuk tiap kandidat best-location
  - Siapkan fondasi ranking engine yang lebih locator-grade
- Reason:
  - Memulai Product Refactor 2 agar best-location tidak lagi bergantung pada patch terpisah, tetapi memakai intelligence core yang terpadu

## REV-20260326-20
- Commit: `3fe0ce3`
- Scope: Product Refactor 1 — phase 5
- Changes:
  - Final QA competitor engine dan rapikan rumus lintas tab
  - Kurangi fallback kasar dan perkuat stabilitas antar kategori utama
  - Tambah normalisasi summary output agar competitor intelligence lebih konsisten
- Reason:
  - Menutup Product Refactor 1 dengan stabilisasi sebelum lanjut ke fase produk berikutnya

## REV-20260326-19
- Commit: `6dbc69d`
- Scope: Product Refactor 1 — phase 4
- Changes:
  - Integrasikan competitor intelligence ke best-location / SWOT / cannibalization severity
  - Tambah pressure-aware adjustments ke recommendation reasoning
  - Satukan competitor engine sebagai input keputusan, bukan hanya tab terpisah
- Reason:
  - Melanjutkan Product Refactor 1 agar competitor intelligence benar-benar menjadi engine keputusan lintas modul

## REV-20260326-18
- Commit: `bfb69e4`
- Scope: Product Refactor 1 — phase 3
- Changes:
  - Tambah brand family handling dan intent matching yang lebih matang
  - Perhalus direct / indirect / replacement classification berbasis intent kategori/brand
  - Upgrade competitor tab ke output analysis-grade
- Reason:
  - Melanjutkan Product Refactor 1 agar competitor intelligence lebih dekat ke engine market analysis profesional

## REV-20260326-17
- Commit: `4f8d864`
- Scope: Product Refactor 1 — phase 2
- Changes:
  - Perkuat competitor retrieval dan klasifikasi direct/indirect agar lebih realistis
  - Hubungkan hasil klasifikasi ke SWOT/cannibalization/score breakdown
  - Tambah output decision-grade summary untuk competitor intelligence
- Reason:
  - Melanjutkan Product Refactor 1 agar competitor intelligence menjadi engine inti yang konsisten lintas tab

## REV-20260326-16
- Commit: `dbdbab2`
- Scope: Product Refactor 1 — Competitor Intelligence Core (phase 1)
- Changes:
  - Bangun fondasi unified competitor classification (direct / indirect / replacement) berbasis category alias + distance + brand intent
  - Siapkan recovery logic agar retrieval dan rendering memakai basis data yang sama
  - Rapikan output snapshot competitor agar lebih decision-grade
- Reason:
  - Memulai Product Refactor 1 untuk mengatasi akar masalah competitor engine, bukan sekadar patch symptom UI

## REV-20260326-15
- Commit: `bd44be4`
- Scope: Batch Infra D — competitor classification safety net
- Changes:
  - `renderCompetitors()` kini memakai fallback nearest competitors jika filter direct/indirect terlalu ketat
  - Mencegah kondisi tab Competitor terlihat kosong padahal data mentah kompetitor sebenarnya ada
- Reason:
  - User masih melihat tab Competitor kosong setelah normalisasi category, berarti bottleneck berikutnya ada di layer klasifikasi/render UI

## REV-20260326-14
- Commit: `af25dab`
- Scope: Batch Infra D kickoff — competitor recovery
- Changes:
  - Tambah `normalizeCompetitorCategory()` agar kategori UI seperti `cafe` dipetakan ke kandidat API yang lebih realistis (`cafe`, `coffee_shop`, `restaurant`)
  - `fetchCompetitors()` kini mencoba beberapa category alias sebelum fallback ke pencarian luas
- Reason:
  - Screenshot menunjukkan tab Competitor kosong untuk `cafe`, sehingga perlu normalisasi kategori agar data lintas tab kembali konsisten

## REV-20260326-13
- Commit: `331c72f`
- Scope: Precision/realism pass before Batch Infra D
- Changes:
  - `fetchCompetitors()` kini fallback ke pencarian lebih luas saat category/brand terlalu sempit agar tab competitor tidak kosong
  - `renderAnalysis()` mengganti cannibalization random ke kalkulasi deterministik berbasis jumlah kompetitor, jarak rata-rata, dan rating rata-rata
  - Logic lintas tab dibuat lebih konsisten: competitor count, cannibalization, dan model scoring membaca basis data yang sama
- Reason:
  - Menindak laporan bahwa informasi kompetitor hilang dan memperbaiki presisi/realism hitungan sebelum lanjut ke Batch Infra D

## REV-20260326-12
- Commit: `3b7de2a`
- Scope: Batch Map Infra C.3
- Changes:
  - Satukan best-location scoring, regional heatmap, dan Voronoi ke satu explanation pipeline
  - Tambah penjelasan titik rekomendasi berbasis corridor + region + Voronoi opportunity
  - Sidebar Top-N diperluas agar alasan kandidat mencerminkan tiga lapisan itu sekaligus
- Reason:
  - Melanjutkan Batch Map Infra C.3 agar hasil best-location lebih explainable dan semua layer map berbicara bahasa yang sama

## REV-20260326-11
- Commit: `9a4adb2`
- Scope: Batch Map Infra C.2 — Voronoi emphasis from criteria
- Changes:
  - Sinkronkan render Voronoi dengan bobot kriteria aktif
  - Voronoi highlight akan berubah mengikuti dominance traffic/population/buying/road criteria
  - Panel insight akan menjelaskan emphasis Voronoi aktif
- Reason:
  - Melanjutkan Batch Map Infra C.2 agar Voronoi bukan layer statis, tapi ikut membaca input kriteria user

## REV-20260326-10
- Commit: `5b22e29`
- Scope: Batch Map Infra C — unify criteria and heatmap controls
- Changes:
  - Gabungkan konsep heatmap driver ke blok kriteria (hapus dependensi checkbox layer terpisah)
  - `toggleHeatmap()` kini membaca langsung slider kriteria sebagai single source of truth
  - Tambah listener slider agar heatmap update real-time saat kriteria berubah
- Reason:
  - Menghilangkan double info di sidebar kiri dan membuat kriteria langsung mengendalikan heatmap/Voronoi

## REV-20260326-09
- Commit: `acceab4`
- Scope: Batch Map Infra B.4
- Changes:
  - Sinkronkan regional heatmap dengan best-location scoring
  - Tambah ranking wilayah pendukung rekomendasi (strongest/secondary/caution)
  - Tampilkan hubungan antara region score dan titik rekomendasi
- Reason:
  - Melanjutkan Batch Map Infra B.4 agar heatmap bukan hanya visual, tapi ikut menjelaskan kenapa best-location dipilih

## REV-20260326-08
- Commit: `83a71ff`
- Scope: Batch Map Infra B.3
- Changes:
  - Tambah color scaling yang lebih sinkron dengan skor regional
  - Tambah legend / scale heatmap
  - Tambah visual balancing agar region dengan skor mirip tidak saling tabrakan secara visual
- Reason:
  - Melanjutkan Batch Map Infra B.3 agar heatmap regional lebih terbaca dan informatif

## REV-20260326-07
- Commit: `e445843`
- Scope: Batch Map Infra B.2
- Changes:
  - Upgrade render regional heatmap ke polygon-like blocks / choropleth-lite
  - Tambah pemisahan visual area agar warna regional tidak saling rapat
  - Tambah label/alasan per area heat region
- Reason:
  - Melanjutkan Batch Map Infra B.2 agar heatmap wilayah lebih terbaca sebagai area administratif, bukan lingkaran bertumpuk

## REV-20260326-06
- Commit: `e7031f9`
- Scope: Batch Map Infra B — BPS-style regional heatmap foundation
- Changes:
  - Tambah `getRegionalHeatmapCells()` di API untuk mengembalikan cell heatmap regional bergaya kecamatan/kab-kota
  - Tambah endpoint `GET /heatmap/regional`
  - Frontend kini fetch regional heatmap dan render circle cells regional sebagai dasar heatmap berbasis wilayah
- Reason:
  - Menjalankan fondasi Batch Map Infra B agar heatmap tidak lagi murni radial sintetis, tetapi mulai mengikuti model area administratif/BPS

## REV-20260326-05
- Commit: `c6ff49f`
- Scope: Batch Map Infra A — hard road-class routing
- Changes:
  - Pisahkan routing koridor utama vs secondary connector secara eksplisit
  - Seed/candidate generation akan diarahkan menurut kelas jalan yang dipilih user
  - Alasan hasil akan menyebut class corridor yang dipakai
- Reason:
  - Menjalankan Batch Map Infra A agar rekomendasi best-location benar-benar mengikuti kelas jalan, bukan hanya bias score ringan

## REV-20260326-04
- Commit: `e22ea10`
- Scope: Main road weight fix for best-location ranking
- Changes:
  - Perkuat pengaruh slider `Jalan Utama` pada scoring final kandidat
  - Tambah preferensi koridor utama vs secondary road di ranking frontage komersial
  - Alasan pemilihan diperjelas agar mencerminkan dominasi jalan utama / jalan alternatif
- Reason:
  - Input `Jalan Utama` sebelumnya belum terasa memengaruhi titik rekomendasi karena ketimpa pipeline komersial lain

## REV-20260326-03
- Commit: `a1b30d1`
- Scope: Refactor best-location phase 2c
- Changes:
  - Tambah commercial corridor filtering dan Voronoi spacing bias
  - Tambah alasan pemilihan yang lebih spesifik (frontage, commercial activity, zoning fit, overlap rendah)
- Reason:
  - Melanjutkan phase 2c agar visual kandidat dan alasan pemilihannya lebih realistis dan tidak saling rapat

## REV-20260326-02
- Commit: `00fb8cd`
- Scope: Refactor best-location phase 2b
- Changes:
  - Tambah alternate seed offsets per zone untuk fallback komersial yang lebih variatif
  - Tambah filter frontage/strip komersial yang lebih tegas dan hindari cluster bentrok
  - Tambah Voronoi/zone spacing bias supaya kandidat visual tidak saling rapat
- Reason:
  - Melanjutkan phase 2b agar kandidat best-location lebih realistis sebagai frontage komersial dan lebih tersebar di peta

## REV-20260326-01
- Commit: `7e0b606`
- Scope: Refactor best-location phase 2
- Changes:
  - Tambah commercial frontage candidate harvesting dari seed zone menggunakan Places API
  - Tambah fallback alternate seeds per zone untuk hindari cluster/road yang sama
  - Tambah alasan pemilihan berbasis frontage + komersial + zoning fit yang lebih spesifik
- Reason:
  - Melanjutkan phase 2 refactor agar source kandidat lebih dekat ke ruko/lahan komersial realistis, bukan sekadar hasil snapping marker

## REV-20260325-58
- Commit: `1195612`
- Scope: Refactor best-location pipeline (phase 1)
- Changes:
  - Ganti source kandidat dari marker sintetis cluster-heavy menjadi zone-seeded commercial-lot candidates
  - Tambah scoring baru berbasis frontage road, commercial POI density, zoning fit, dan spread penalty
  - Tambah alasan pemilihan yang lebih proper untuk kandidat properti/jalan komersial
- Reason:
  - Menjalankan refactor best-location agar hasil tidak lagi sekadar marker snap, tetapi mendekati kandidat ruko/lahan komersial yang realistis

## REV-20260325-57
- Commit: `48205f1`
- Scope: Pin 1 hasil per zone tanpa resnap ke cluster yang sama
- Changes:
  - Tambah `getPinnedZoneTargets()` dengan target zona final yang lebih jauh terpisah
  - `enforceZoneSpread()` kini menandai hasil sebagai `noResnap` / `Pinned zone`
  - Tahap final tidak lagi memanggil road/POI resnap ulang; hanya reverse geocode label agar hasil tetap satu titik per zone dan tidak collapse ke cluster yang sama
- Reason:
  - Menjalankan arahan user secara eksplisit: pin 1 hasil per zone + tanpa resnap ke cluster yang sama

## REV-20260325-56
- Commit: `2bdc28f`
- Scope: Final minimum-distance lock after all snapping
- Changes:
  - Tambah `finalDistanceLock()` yang menghitung minimum jarak akhir berdasarkan radius aktif
  - Setelah zone spread, marker yang masih terlalu dekat dipaksa pindah lagi ke target zona masing-masing
  - Status UI baru: `Final distance lock`
- Reason:
  - Screenshot terbaru menunjukkan titik akhir masih berdekatan setelah semua proses, jadi perlu hard lock di koordinat final, bukan hanya di source generation atau road uniqueness

## REV-20260325-55
- Commit: `55120a7`
- Scope: Make Top-N spread respond to radius
- Changes:
  - `findBestLocation()` kini membaca `radiusSlider/currentRadius` untuk membentuk `radiusScale`
  - Seed zona primer/sekunder kini dikalikan `radiusScale`, sehingga saat radius diperluas, jarak antarkandidat ikut melebar
  - Menghilangkan perilaku lama di mana marker terlihat tidak berubah meski radius sudah dibesarkan
- Reason:
  - Screenshot terbaru menunjukkan titik tetap berdekatan dan hampir tidak berubah saat radius diluaskan, berarti spread logic belum terhubung ke radius

## REV-20260325-54
- Commit: `5877819`
- Scope: Road uniqueness lock
- Changes:
  - Tambah `getRoadKey()` untuk identitas unik road/POI snapping reference
  - `validatePoiRoadCandidate()` kini menerima `usedRoadKeys` dan menghindari referensi jalan yang sudah dipakai marker sebelumnya
  - Validasi Top-N diubah menjadi berurutan (bukan `Promise.all`) supaya lock per-road bisa diterapkan deterministik
- Reason:
  - Menangani bukti terbaru bahwa marker #2/#3/#5 tetap bertumpuk karena beberapa zona tersnap ke ruas jalan/cluster POI yang sama

## REV-20260325-53
- Commit: `85e24d0`
- Scope: Hard uniqueness by primary zone for Top 5
- Changes:
  - Untuk `Top 5`, source kandidat kini dibatasi hanya ke 5 seed utama: C/N/E/S/W
  - Seed diagonal (NE/SE/SW/NW) hanya dipakai saat user minta hasil lebih dari 5
  - Mencegah dua hasil Top 5 lahir dari cluster/zona yang masih terlalu mirip
- Reason:
  - Menangani bukti terbaru bahwa marker tetap menumpuk walau zone-seeded generation sudah diterapkan

## REV-20260325-52
- Commit: `7e45c45`
- Scope: Zone-seeded candidate generation
- Changes:
  - `findBestLocation()` tidak lagi membangkitkan kandidat dari cluster radial tunggal
  - Kandidat kini dibangkitkan dari seed zona eksplisit (C/N/E/S/W + diagonal) agar sebaran berbeda sejak awal
  - Tujuan: mengurangi kebutuhan deconflict besar di tahap akhir dan mencegah titik #2/#3 bertumpuk sejak source generation
- Reason:
  - Menangani bukti terbaru bahwa marker masih menumpuk meski sudah ada zone spread pasca-proses

## REV-20260325-51
- Commit: `b60575f`
- Scope: Zone bucket allocation untuk Top-N
- Changes:
  - Tambah `assignZoneBucket()` dan `enforceZoneSpread()` agar Top-N disebar ke zona berbeda (C/N/E/S/W)
  - Setelah deconflict, marker diposisikan ulang ke zone target lalu divalidasi ulang ke road/POI terdekat
  - Sidebar kini menampilkan status `Zone spread` untuk hasil yang dipaksa menyebar
- Reason:
  - Menangani kasus bukti visual terbaru saat beberapa titik masih berdekatan walau radius diperluas

## REV-20260325-50
- Commit: `5d84bbe`
- Scope: Stronger spatial separation for Top-N markers
- Changes:
  - `deconflictBestList()` diperketat dengan minimum separation 0.35 km
  - Marker yang konflik kini direlokasi secara radial dari inland anchor, bukan sekadar offset kecil dari titik lama
  - Conflict pada jalan yang sama tetap ditandai dan dipisahkan lebih agresif
- Reason:
  - Menangani bukti visual terbaru bahwa beberapa titik rekomendasi masih terlalu berdekatan di pusat Manado

## REV-20260325-49
- Commit: `b40be0c`
- Scope: Fix runtime error BL undefined pada best-location
- Changes:
  - Ganti pemakaian `BL(...)` yang tidak tersedia di `restomap.html` dengan conditional `lang === 'id' ? ... : ...`
  - Menutup error runtime `BL is not defined` yang memblokir tombol `Cari Lokasi Terbaik`
- Reason:
  - Debug hasil validasi user menunjukkan akar masalah spesifik pada string bilingual ranking reason

## REV-20260325-48
- Commit: `56a2a9f`
- Scope: Stabilize best-location button runtime
- Changes:
  - Bungkus `findBestLocation()` dengan `try/catch` penuh
  - Tambah error surfacing via `console.error` + alert supaya runtime issue tidak lagi terlihat seperti tombol mati
- Reason:
  - Menindak bug terbaru saat tombol `Cari Lokasi Terbaik` tidak merespons dan menegakkan pola kerja analyze => plan => build => validate => debug => improve

## REV-20260325-47
- Commit: `287f67f`
- Scope: Street-priority ranking + alasan pemilihan
- Changes:
  - Tambah normalisasi nama jalan dan `streetPriority` score berbasis fit score + kepadatan road/POI sekitar
  - Top-N kini diurutkan ulang berdasarkan street priority, bukan score mentah saja
  - Deduplikasi diperketat: marker pada jalan yang sama atau terlalu dekat dipisahkan
  - Tiap opsi kini menyimpan dan menampilkan alasan kenapa dipilih (`rankReason` / `selectionReason`)
- Reason:
  - Menangani kasus titik #1 dan #4 masih terlalu berdekatan dan memenuhi requirement user agar setiap rekomendasi punya alasan pemilihan yang jelas

## REV-20260325-46
- Commit: `62fe662`
- Scope: De-overlap marker + road-aligned snapping
- Changes:
  - `validatePoiRoadCandidate()` kini memilih referensi jalan/POI berdasarkan geometri terdekat, bukan sekadar presence di sekitar
  - Tambah `deconflictBestList()` untuk memisahkan marker Top-N yang terlalu berdekatan / saling numpuk
  - Setelah deconflict, alamat marker di-resolve ulang agar label tetap sinkron dengan titik baru
  - Sidebar kini menandai marker hasil pemisahan dengan status `Deconflicted`
- Reason:
  - Menangani kasus dua titik bertumpuk dan memastikan marker benar-benar menunjuk ke jalan/POI darat yang berbeda

## REV-20260325-45
- Commit: `4232114`
- Scope: Tighten Manado water exclusion + snap to nearby valid POI/road
- Changes:
  - Perketat `coastGuard` Manado dengan batas longitude/latitude yang lebih sempit untuk menolak marker di bibir air
  - `validatePoiRoadCandidate()` kini men-snap titik ke geometri road/POI terdekat yang valid, bukan hanya menganggap area sekitar valid
  - Setelah snap, titik tetap dilewatkan lagi ke `applyCoastGuard()` agar tidak memantul balik ke area air
- Reason:
  - Menangani bukti visual terbaru bahwa marker #3 dan #4 masih jatuh di air meski sudah ada coastal guard generik

## REV-20260325-44
- Commit: `e7491ce`
- Scope: City-specific coastal exclusion guard
- Changes:
  - Tambah `coastGuard` per kota pantai untuk membatasi marker agar tidak melewati sisi pesisir tertentu
  - Tambah `applyCoastGuard()` untuk clamp kandidat ke zona darat aman sebelum dan sesudah inland adjustment
  - Candidate generation, inland adjustment, dan fallback kini semuanya lewat coast guard
  - Manado diberi guard spesifik untuk mencegah marker jatuh ke sisi barat/pantai/pelabuhan
- Reason:
  - Menangani kasus nyata marker #3 yang masih jatuh ke pantai/laut meski sudah ada inland + POI validation

## REV-20260325-43
- Commit: `77cefb3`
- Scope: POI/Road-only candidate validation
- Changes:
  - Tambah `placesNearby()` wrapper untuk Google Places nearby search
  - Tambah `validatePoiRoadCandidate()` agar kandidat hanya lolos jika punya road/POI komersial terdekat
  - Jika kandidat tidak valid, titik digeser lagi ke inland anchor sampai valid atau fallback ke anchor
  - Sidebar Top-N kini menampilkan status validasi (`POI/Road OK` / `Inland fallback`)
- Reason:
  - Menambah lapisan validasi akhir supaya titik rekomendasi tidak muncul di area kosong, laut, atau pelabuhan tepi pesisir

## REV-20260325-42
- Commit: `ff6f69f`
- Scope: Anti-pelabuhan / anti-pesisir untuk best-location
- Changes:
  - Tambah inland anchor per kota (`inlandLat`, `inlandLng`) agar kandidat Top-N dibangkitkan dari area darat inti, bukan pusat geometri yang bisa dekat pesisir
  - Perluas deteksi area pesisir/pelabuhan (`port`, `dermaga`, `marina`, `waterfront`, dll)
  - `adjustInlandIfNeeded()` diubah agar mengunci titik ke inland anchor + batas maksimum jarak dari anchor
  - Hard fallback kini diarahkan ke inland anchor, bukan sekadar offset generik
- Reason:
  - Memastikan titik rekomendasi best location tidak lagi jatuh ke area pelabuhan/pesisir

## REV-20260325-41
- Commit: `f32b54b`
- Scope: Hard inland lock untuk titik rekomendasi
- Changes:
  - `adjustInlandIfNeeded` diubah menjadi iterative inland snap menuju city center (hingga 10 iterasi)
  - Tambah fallback darat paksa dekat city core jika tetap terdeteksi sea-like
  - Menjamin marker rekomendasi tidak menetap di area laut/pelabuhan
- Reason:
  - Menangani kasus lanjutan titik #3 yang masih jatuh di laut (evidence screenshot)

## REV-20260325-40
- Commit: `e077186`
- Scope: Fix titik laut + animasi marker Top-N
- Changes:
  - Tambah deteksi alamat laut (`isSeaLikeAddress`) dari hasil reverse geocode
  - Tambah penyesuaian koordinat ke daratan (`adjustInlandIfNeeded`) saat kandidat jatuh di area laut/pelabuhan
  - Tambah animasi marker Top-N (`startBestMarkerAnimation`) dengan pulse + spotlight bounce supaya nomor mudah ditemukan
  - Tambah cleanup timer animasi saat generate ulang titik rekomendasi
- Reason:
  - Menangani kasus titik rekomendasi jatuh di laut dan meningkatkan visibilitas nomor marker

## REV-20260325-39
- Commit: `46ba321`
- Scope: Fix akurasi label lokasi rekomendasi
- Changes:
  - Tambah `reverseGeocodeLabel(lat,lng)` untuk resolve alamat asli dari koordinat titik
  - `findBestLocation()` kini resolve alamat real untuk hasil Top-N sebelum render marker/list
  - Klik marker Top-N kini kirim nama alamat asli ke panel detail
  - `selectLocation()` kini refresh nama lokasi dengan reverse geocode agar header sesuai titik aktual
- Reason:
  - Menangani mismatch antara titik rekomendasi dan alamat yang ditampilkan

## REV-20260325-38
- Commit: `0ea8a40`
- Scope: Batch C Results & Documents professionalization
- Changes:
  - Step 8 disusun ulang sesuai struktur business plan profesional (8 bagian lengkap)
  - Tambah section ringkasan per bab: Executive Summary, Company, Product/Service, Market, Marketing/Sales, Management/Ops, Financial, Appendix
  - Export HTML diperluas agar mengikuti struktur dokumen profesional yang sama
- Reason:
  - Menjalankan Batch C sesuai arahan user (hasil dokumen lengkap dan siap presentasi)

## REV-20260325-37
- Commit: `6b8d4d2`
- Scope: Batch B.6 Financial Model detail + infographic
- Changes:
  - Step 7 ditingkatkan ke mode skenario (Conservative/Base/Aggressive)
  - Tambah KPI per skenario: revenue, profit, margin, BEP
  - Tambah breakdown infografis (bar composition untuk COGS/Labor/Rent/Marketing)
  - Tambah rekomendasi finansial otomatis berdasarkan base margin vs target
  - Simpan hasil ke `builderModel.financial`
- Reason:
  - Menjalankan Batch B.6 sesuai arahan user (financial model lebih detail + infografis + recommendation)

## REV-20260325-36
- Commit: `6f55e8e`
- Scope: Batch B.5 Launch Strategy
- Changes:
  - Step 6 ditingkatkan dengan budget recommendation berbasis market score + concept
  - Tambah framework marketing (objective + channel mix)
  - Tambah digital marketing strategy block
  - Tambah 30-days launch win plan
  - Simpan hasil ke `builderModel.launch`
- Reason:
  - Menjalankan Batch B.5 sesuai arahan user (launch strategy detail + AI/manual support)

## REV-20260325-35
- Commit: `977959b`
- Scope: Batch B.4 Operations & Team
- Changes:
  - Step 5 diubah ke mode struktur divisi kustom (editable)
  - Tambah headcount + biaya per divisi dengan total payroll KPI
  - Tambah AI efficiency recommendation berbasis kapasitas kursi & struktur divisi
  - Tambah generated SOP + task list per department
  - Simpan hasil ke `builderModel.operations`
- Reason:
  - Menjalankan Batch B.4 sesuai arahan user (custom divisions + AI efficiency + SOP/task list)

## REV-20260325-34
- Commit: `b927f20`
- Scope: Batch B.3 Space Design interaktif
- Changes:
  - Step 4 diubah jadi space design interaktif berbasis konsep + area
  - Tambah zoning output (hall/kitchen/storage/service)
  - Tambah draft floorplan preview (look & feel visual)
  - Tambah partner selection (consultant, contractor, architect, vendor)
  - Simpan hasil ke `builderModel.spaceDesign`
- Reason:
  - Menjalankan Batch B.3 sesuai arahan user (space design + output visual + partner options)

## REV-20260325-33
- Commit: `f96a547`
- Scope: Batch B.2 Menu Design AI generator
- Changes:
  - Tambah blueprint generator menu berdasarkan concept + avg check
  - Auto-generate jumlah item per kategori dengan rentang harga realistis
  - Tabel menu sekarang editable (nama, kategori, harga, COGS)
  - Tambah KPI menu (category count, total items, price range)
  - Simpan hasil ke `builderModel.menuDesign`
- Reason:
  - Menjalankan Batch B.2 sesuai arahan user (AI recommendation + generated menu structure/pricing)

## REV-20260325-32
- Commit: `c8ea50e`
- Scope: Batch B.1 Market Analysis infografis interaktif
- Changes:
  - Step 2 diubah menjadi market infographic interaktif berbasis bar progress per metrik
  - Tambah perbandingan objektif vs standard parameter (delta + status)
  - Tambah Objective Market Score dengan verdict otomatis
  - Simpan hasil ke `builderModel.marketAnalysis` untuk dipakai step berikutnya
- Reason:
  - Menjalankan Batch B.1 sesuai arahan user (interactive market analysis + objective vs standard)

## REV-20260325-31
- Commit: `6c88a5d`
- Scope: Batch A foundation sync
- Changes:
  - Sinkronisasi asumsi RestoMap -> RestoBuilder via query params (asSeats, asAvgCheck, turnover, COGS, labor, marketing, rent factor, CAPEX)
  - Step 1 Concept & Basic diperkaya: kategori dari RestoMap, konsep lebih lengkap, cuisine adaptif by category
  - Tambah input minuman & produk tambahan (upsell/cross-sell)
  - Tambah AI context block yang menampilkan ringkasan metrik dari RestoMap (score, revenue, Bayes/HHI/Voronoi)
  - Tambah unified `builderModel` sebagai fondasi data lintas step
- Reason:
  - Menjalankan Batch A (A1 + A2) agar data flow dan fondasi Builder lebih solid

## REV-20260325-30
- Commit: `ad31012`
- Scope: Step 4 refactor cleanup
- Changes:
  - Hapus data hotspot `LOCS` yang sudah tidak digunakan lagi
  - Rapikan data section agar hanya menyisakan source yang aktif dipakai (TYPE_STATS, CITY_PRESETS)
- Reason:
  - Mengurangi dead code dan memudahkan maintenance

## REV-20260325-29
- Commit: `5b9becf`
- Scope: Prioritas 4 - Export business plan profesional
- Changes:
  - Tambah exporter dokumen business plan profesional (HTML report)
  - Tambah section Executive Summary, Method Trace, dan Financial Breakdown pada file export
  - Tombol export di Step 8 kini menghasilkan file `BusinessPlan_*.html`
  - Tombol share menyalin ringkasan plan untuk WhatsApp
- Reason:
  - Menjalankan Step 3 workflow bertahap sesuai prioritas user

## REV-20260325-28
- Commit: `f5e436c`
- Scope: Monitoring ringan
- Changes:
  - Tambah script `scripts/healthcheck-light.ps1`
  - Cek 3 endpoint inti: restomap web, restobuilder web, API root
  - Exit code standar (0 sehat, 2 gagal)
  - Tambah panduan penggunaan di `MONITORING_LIGHT.md`
- Reason:
  - Menjalankan Step 2 workflow bertahap (monitoring ringan)

## REV-20260325-27
- Commit: `10b6338`
- Scope: Ops quickstart documentation
- Changes:
  - Tambah `RUNBOOK_60S.md` untuk verifikasi operasional super cepat
  - Checklist ringkas: web, builder, API, Top-N, heatmap
  - Fast action jika fail (restart web/api)
- Reason:
  - Permintaan user untuk workflow bertahap, dimulai dari checklist 60 detik

## REV-20260325-26
- Commit: `9381feb`
- Scope: Finishing pass UX polish
- Changes:
  - Rapikan tampilan Competitor Snapshot + SWOT (visual hierarchy lebih jelas)
  - Perbaiki readability warna SWOT (S/W/O/T pakai warna berbeda)
  - Tambah responsive tweak untuk layar 1366 ke bawah (sidebar/panel/tab lebih proporsional)
- Reason:
  - Menutup tahap finishing pass agar tampilan lebih rapi untuk presentasi

## REV-20260325-25
- Commit: `a28ddcd`
- Scope: Interactive assumptions modal
- Changes:
  - Ganti flow prompt beruntun menjadi modal form interaktif `Edit Asumsi`
  - Form berisi field lengkap (seats, turnover, avg check, COGS, labor, marketing, rent factor, CAPEX)
  - Tombol `Apply` langsung simpan override dan trigger re-kalkulasi
  - Support klik backdrop untuk menutup modal
- Reason:
  - Permintaan user untuk UX edit asumsi yang lebih nyaman

## REV-20260325-24
- Commit: `91a755e`
- Scope: Editable financial assumptions
- Changes:
  - Tambah tombol `✏️ Edit Asumsi` pada panel Asumsi Finansial
  - User bisa ubah seats, turnover, avg check, COGS, labor %, marketing %, rent factor, CAPEX
  - Perubahan asumsi langsung memicu re-kalkulasi metrik (revenue/margin/break-even)
  - Formula finansial menggunakan override asumsi saat tersedia
- Reason:
  - Permintaan user agar asumsi dapat diedit dan hasilnya langsung terlihat

## REV-20260325-23
- Commit: `8b98e3f`
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

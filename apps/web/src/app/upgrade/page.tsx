'use client'

import Link from 'next/link'

const FREE_FEATURES = [
  '✅ Analisa lokasi dasar',
  '✅ Heatmap kepadatan penduduk',
  '✅ Max 3 lokasi tersimpan',
  '✅ Max 5 kompetitor per lokasi',
  '✅ Radius hingga 5km',
  '❌ Kustomisasi bobot lanjutan',
  '❌ Heatmap traffic & daya beli',
  '❌ Analisa sentimen kompetitor',
  '❌ Export PDF laporan',
  '❌ Lokasi tersimpan unlimited',
]

const PRO_FEATURES = [
  '✅ Semua fitur Free',
  '✅ Kustomisasi bobot lanjutan',
  '✅ Heatmap traffic & daya beli',
  '✅ Analisa sentimen kompetitor',
  '✅ Export PDF laporan profesional',
  '✅ Lokasi tersimpan unlimited',
  '✅ Bandingkan hingga 3 lokasi',
  '✅ Estimasi ROI & revenue',
  '✅ Gap analisa kategori kuliner',
  '✅ Support prioritas',
]

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/map" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Kembali ke peta
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="font-bold text-gray-800">RestoMap</span>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Upgrade ke <span className="text-indigo-600">RestoMap Pro</span>
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            Dapatkan analisa lokasi yang lebih mendalam untuk keputusan bisnis yang lebih baik
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Free */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Free</h2>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">Rp 0</span>
                <span className="text-gray-500 ml-1">/bulan</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Untuk memulai riset lokasi</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className={`text-sm ${f.startsWith('❌') ? 'text-gray-300' : 'text-gray-600'}`}>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/map"
              className="block w-full py-3 rounded-xl text-center text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              Pakai Free
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-indigo-600 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
              POPULER
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Pro</h2>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white">Rp 299.000</span>
                <span className="text-indigo-200 ml-1">/bulan</span>
              </div>
              <p className="text-indigo-200 text-sm mt-1">Untuk pengusaha & konsultan serius</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="text-sm text-indigo-100">
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => alert('Payment gateway belum tersedia — issue #16 (HITL)')}
              className="block w-full py-3 rounded-xl text-center text-sm font-bold bg-white text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              Upgrade ke Pro →
            </button>
          </div>

        </div>

        {/* FAQ */}
        <div className="mt-10 text-center text-sm text-gray-400">
          Ada pertanyaan? Hubungi{' '}
          <a href="mailto:hello@restomap.id" className="text-indigo-500 hover:underline">
            hello@restomap.id
          </a>
        </div>

      </div>
    </div>
  )
}

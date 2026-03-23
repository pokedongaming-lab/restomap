'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'id' | 'en'

type TranslationKey = 
  | 'app.title' | 'app.subtitle'
  | 'nav.restomap' | 'nav.restobuilder'
  | 'map.clickHint' | 'map.selectLocation'
  | 'overview.score' | 'overview.rating' | 'overview.revenue' | 'overview.breakeven' | 'overview.competitors'
  | 'overview.avgCheck' | 'overview.margin' | 'overview.growth'
  | 'heatmap.layers' | 'heatmap.population' | 'heatmap.traffic' | 'heatmap.income' | 'heatmap.competitors' | 'heatmap.opportunity'
  | 'competitor.title' | 'competitor.found' | 'competitor.quadrant'
  | 'cannibal.title' | 'cannibal.analysis' | 'cannibal.rate' | 'cannibal.safeDistance'
  | 'builder.step' | 'builder.next' | 'builder.back' | 'builder.finish'
  | 'form.name' | 'form.city' | 'form.concept' | 'form.cuisine' | 'form.seating'
  | 'form.marketDesc' | 'form.marketSize' | 'form.trend' | 'form.competitors' | 'form.pricePosition'
  | 'form.avgCheck' | 'form.cogs' | 'form.investment'
  | 'form.menuName' | 'form.menuCategory' | 'form.menuPrice' | 'form.menuCogs'
  | 'form.totalArea' | 'form.kitchenArea' | 'form.diningArea' | 'form.renovationBudget'
  | 'form.management' | 'form.kitchen' | 'form.foh' | 'form.gmSalary' | 'form.chefSalary' | 'form.serverSalary'
  | 'form.tagline' | 'form.marketingBudget' | 'form.grandOpening' | 'form.softDays' | 'form.socialTarget'
  | 'result.capital' | 'result.revenueY1' | 'result.ebitdaY1' | 'result.roi' | 'result.irr' | 'result.breakeven'
  | 'result.exportPdf' | 'result.exportGantt' | 'result.shareWA' | 'result.backToMap'
  | 'criteria.traffic' | 'criteria.buyingPower' | 'criteria.population' | 'criteria.mainRoad' | 'criteria.altRoad' | 'criteria.surrounding'
  | 'btn.findBest' | 'btn.search' | 'btn.apply' | 'btn.cancel' | 'btn.save' | 'btn.reset'

type Translations = {
  [key in Language]: {
    [k in TranslationKey]: string
  }
}

const translations: Translations = {
  id: {
    // App
    'app.title': 'RestoSuite',
    'app.subtitle': 'F&B Intelligence Platform',
    // Navigation
    'nav.restomap': 'RestoMap',
    'nav.restobuilder': 'RestoBuilder',
    // Map
    'map.clickHint': 'Klik pada peta untuk memilih lokasi',
    'map.selectLocation': 'Pilih lokasi untuk memulai analisis',
    // Overview
    'overview.score': 'SKOR KELayakan',
    'overview.rating': 'RATING',
    'overview.revenue': 'REV/BLN',
    'overview.breakeven': 'BREAK-EVEN',
    'overview.competitors': 'KOMPETITOR',
    'overview.avgCheck': 'AVG CHECK',
    'overview.margin': 'MARGIN EST',
    'overview.growth': 'GROWTH YOY',
    // Heatmap
    'heatmap.layers': 'PILIH LAYER',
    'heatmap.population': 'POPULASI',
    'heatmap.traffic': 'TRAFFIC',
    'heatmap.income': 'DAYA BELI',
    'heatmap.competitors': 'KOMPETITOR',
    'heatmap.opportunity': 'OPPORTUNITY',
    // Competitor
    'competitor.title': 'INTEL KOMPETITOR',
    'competitor.found': 'DITEMUKAN',
    'competitor.quadrant': 'KUADRAN',
    // Cannibalization
    'cannibal.title': 'ANALISIS KANIBALISASI',
    'cannibal.analysis': 'ANALISIS',
    'cannibal.rate': 'TINGKAT KANIBALISASI',
    'cannibal.safeDistance': 'JARAK AMAN MIN',
    // Builder Steps
    'builder.step': 'STEP',
    'builder.next': 'LANJUT →',
    'builder.back': '← KEMBALI',
    'builder.finish': 'SELESAI ✓',
    // Form - Basic
    'form.name': 'Nama Restoran',
    'form.city': 'Kota',
    'form.concept': 'Tipe Konsep',
    'form.cuisine': 'Jenis Masakan',
    'form.seating': 'Kapasitas Kursi',
    // Form - Market
    'form.marketDesc': 'Deskripsi Target Market',
    'form.marketSize': 'Ukuran Pasar',
    'form.trend': 'Tren Pasar',
    'form.competitors': 'Jumlah Kompetitor',
    'form.pricePosition': 'Posisi Harga',
    // Form - Financial
    'form.avgCheck': 'Harga Rata-rata Cover',
    'form.cogs': 'COGS %',
    'form.investment': 'Investasi Pribadi',
    // Form - Menu
    'form.menuName': 'Nama Item',
    'form.menuCategory': 'Kategori',
    'form.menuPrice': 'Harga',
    'form.menuCogs': 'COGS %',
    // Form - Space
    'form.totalArea': 'Total Area (m²)',
    'form.kitchenArea': 'Area Dapur (m²)',
    'form.diningArea': 'Area Dining (m²)',
    'form.renovationBudget': 'Biaya Renovasi',
    // Form - Team
    'form.management': 'Management',
    'form.kitchen': 'Kitchen Staff',
    'form.foh': 'Front of House',
    'form.gmSalary': 'Gaji GM / bulan',
    'form.chefSalary': 'Gaji Chef / bulan',
    'form.serverSalary': 'Gaji Server / bulan',
    // Form - Launch
    'form.tagline': 'Brand Tagline',
    'form.marketingBudget': 'Budget Marketing / bulan',
    'form.grandOpening': 'Budget Grand Opening',
    'form.softDays': 'Hari Soft Opening',
    'form.socialTarget': 'Target Social Media',
    // Results
    'result.capital': 'MODAL TOTAL',
    'result.revenueY1': 'REVENUE Y1',
    'result.ebitdaY1': 'EBITDA Y1',
    'result.roi': 'ROI Y1',
    'result.irr': 'IRR 5YR',
    'result.breakeven': 'BREAK-EVEN',
    'result.exportPdf': 'EXPORT BUSINESS PLAN PDF',
    'result.exportGantt': 'EXPORT GANTT TIMELINE',
    'result.shareWA': 'BAGIKAN VIA WHATSAPP',
    'result.backToMap': '← KEMBALI KE RESTOMAP',
    // Criteria
    'criteria.traffic': 'Traffic / Keramaian',
    'criteria.buyingPower': 'Daya Beli',
    'criteria.population': 'Kepadatan Penduduk',
    'criteria.mainRoad': 'Jalan Utama',
    'criteria.altRoad': 'Jalan Alternatif',
    'criteria.surrounding': 'Lingkungan Sekitar',
    // Buttons
    'btn.findBest': 'CARi LOKASI TERBAIK',
    'btn.search': 'CARI',
    'btn.apply': 'TERAPKAN',
    'btn.cancel': 'BATAL',
    'btn.save': 'SIMPAN',
    'btn.reset': 'RESET',
  },
  en: {
    // App
    'app.title': 'RestoSuite',
    'app.subtitle': 'F&B Intelligence Platform',
    // Navigation
    'nav.restomap': 'RestoMap',
    'nav.restobuilder': 'RestoBuilder',
    // Map
    'map.clickHint': 'Click on map to select location',
    'map.selectLocation': 'Select a location to start analysis',
    // Overview
    'overview.score': 'FEASIBILITY SCORE',
    'overview.rating': 'RATING',
    'overview.revenue': 'REV/MONTH',
    'overview.breakeven': 'BREAK-EVEN',
    'overview.competitors': 'COMPETITORS',
    'overview.avgCheck': 'AVG CHECK',
    'overview.margin': 'MARGIN EST',
    'overview.growth': 'GROWTH YOY',
    // Heatmap
    'heatmap.layers': 'LAYER SELECTOR',
    'heatmap.population': 'POPULATION',
    'heatmap.traffic': 'TRAFFIC',
    'heatmap.income': 'INCOME',
    'heatmap.competitors': 'COMPETITORS',
    'heatmap.opportunity': 'OPPORTUNITY',
    // Competitor
    'competitor.title': 'COMPETITOR INTEL',
    'competitor.found': 'FOUND',
    'competitor.quadrant': 'QUADRANT',
    // Cannibalization
    'cannibal.title': 'CANNIBALIZATION ANALYSIS',
    'cannibal.analysis': 'ANALYSIS',
    'cannibal.rate': 'CANNIBAL RATE',
    'cannibal.safeDistance': 'MIN SAFE DISTANCE',
    // Builder Steps
    'builder.step': 'STEP',
    'builder.next': 'NEXT →',
    'builder.back': '← BACK',
    'builder.finish': 'FINISH ✓',
    // Form - Basic
    'form.name': 'Restaurant Name',
    'form.city': 'City',
    'form.concept': 'Concept Type',
    'form.cuisine': 'Cuisine Type',
    'form.seating': 'Seating Capacity',
    // Form - Market
    'form.marketDesc': 'Target Market Description',
    'form.marketSize': 'Market Size',
    'form.trend': 'Market Trend',
    'form.competitors': 'Competitor Count',
    'form.pricePosition': 'Price Position',
    // Form - Financial
    'form.avgCheck': 'Average Cover Price',
    'form.cogs': 'COGS %',
    'form.investment': 'Personal Investment',
    // Form - Menu
    'form.menuName': 'Item Name',
    'form.menuCategory': 'Category',
    'form.menuPrice': 'Price',
    'form.menuCogs': 'COGS %',
    // Form - Space
    'form.totalArea': 'Total Area (m²)',
    'form.kitchenArea': 'Kitchen Area (m²)',
    'form.diningArea': 'Dining Area (m²)',
    'form.renovationBudget': 'Renovation Budget',
    // Form - Team
    'form.management': 'Management',
    'form.kitchen': 'Kitchen Staff',
    'form.foh': 'Front of House',
    'form.gmSalary': 'GM Salary / month',
    'form.chefSalary': 'Chef Salary / month',
    'form.serverSalary': 'Server Salary / month',
    // Form - Launch
    'form.tagline': 'Brand Tagline',
    'form.marketingBudget': 'Marketing Budget / month',
    'form.grandOpening': 'Grand Opening Budget',
    'form.softDays': 'Soft Opening Days',
    'form.socialTarget': 'Social Media Target',
    // Results
    'result.capital': 'TOTAL CAPITAL',
    'result.revenueY1': 'REVENUE Y1',
    'result.ebitdaY1': 'EBITDA Y1',
    'result.roi': 'ROI Y1',
    'result.irr': 'IRR 5YR',
    'result.breakeven': 'BREAK-EVEN',
    'result.exportPdf': 'EXPORT BUSINESS PLAN PDF',
    'result.exportGantt': 'EXPORT GANTT TIMELINE',
    'result.shareWA': 'SHARE VIA WHATSAPP',
    'result.backToMap': '← BACK TO RESTOMAP',
    // Criteria
    'criteria.traffic': 'Traffic / Footfall',
    'criteria.buyingPower': 'Buying Power',
    'criteria.population': 'Population Density',
    'criteria.mainRoad': 'Main Road',
    'criteria.altRoad': 'Alternative Roads',
    'criteria.surrounding': 'Surrounding Area',
    // Buttons
    'btn.findBest': 'FIND BEST LOCATION',
    'btn.search': 'SEARCH',
    'btn.apply': 'APPLY',
    'btn.cancel': 'CANCEL',
    'btn.save': 'SAVE',
    'btn.reset': 'RESET',
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('id')

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

// Language toggle component
export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('id')}
        className={`px-2 py-1 text-xs rounded ${
          language === 'id' 
            ? 'bg-lime-400 text-black font-bold' 
            : 'bg-gray-700 text-gray-400'
        }`}
      >
        ID
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-xs rounded ${
          language === 'en' 
            ? 'bg-lime-400 text-black font-bold' 
            : 'bg-gray-700 text-gray-400'
        }`}
      >
        EN
      </button>
    </div>
  )
}

export type { TranslationKey, Language }
'use client'

import { useState, useMemo } from 'react'

/**
 * KUR / Loan Simulator Component
 * Simulasi cicilan bank dan KUR Mikro untuk pembiayaan usaha
 * 
 * Quick Win #2 - RestoSuite v2.0
 * Freelium: Free/Pro
 */

type LoanType = 'kur_mikro' | 'kUR_kecil' | 'bank_umum' | 'modal_kerja'

interface LoanParams {
  loanType: LoanType
  amount: number
  tenor: number // bulan
  interestRate: number // % per tahun
}

interface SimulationResult {
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  effectiveRate: number
}

// Rate KUR resmi 2024 (per pemerintah)
const KUR_RATES = {
  'kur_mikro': { rate: 6, maxAmount: 50000000, maxTenor: 48, name: 'KUR Mikro' },
  'kUR_kecil': { rate: 6, maxAmount: 200000000, maxTenor: 60, name: 'KUR Kecil' },
}

export default function LoanSimulator() {
  // State
  const [loanType, setLoanType] = useState<LoanType>('kur_mikro')
  const [amount, setAmount] = useState<number>(10000000) // 10 juta
  const [tenor, setTenor] = useState<number>(24) // 24 bulan
  const [customRate, setCustomRate] = useState<number | null>(null)

  // Hitung simulasi
  const result = useMemo((): SimulationResult | null => {
    const rate = customRate ?? KUR_RATES[loanType]?.rate ?? 6
    const principal = amount
    const monthlyRate = rate / 100 / 12
    
    // Formula anuitas: PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, tenor)
    const monthlyPayment = principal * (monthlyRate * factor) / (factor - 1)
    
    const totalPayment = monthlyPayment * tenor
    const totalInterest = totalPayment - principal
    
    // Effective rate (annual)
    const effectiveRate = (totalInterest / principal) / (tenor / 12) * 100
    
    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      effectiveRate: Math.round(effectiveRate * 100) / 100,
    }
  }, [loanType, amount, tenor, customRate])

  // Format currency
  const fmtRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  // Update tenor max ketika loan type berubah
  const maxTenor = KUR_RATES[loanType]?.maxTenor ?? 60
  const maxAmount = KUR_RATES[loanType]?.maxAmount ?? 500000000
  const loanName = KUR_RATES[loanType]?.name ?? 'Pinjaman Bank'

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-lime-400">
          💰 KUR / Simulasi Pinjaman
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Loan Type Selector */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Jenis Pinjaman
          </label>
          <select
            value={loanType}
            onChange={(e) => setLoanType(e.target.value as LoanType)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-lime-400"
          >
            <option value="kur_mikro">KUR Mikro (max Rp 50JT, 6%/th)</option>
            <option value="kUR_kecil">KUR Kecil (max Rp 200JT, 6%/th)</option>
            <option value="bank_umum">Bank Umum (bunga bebas)</option>
            <option value="modal_kerja">Modal Kerja</option>
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Jumlah Pinjaman
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            max={maxAmount}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-lime-400"
          />
          <p className="text-xs text-gray-500 mt-1">
            Max: {fmtRp(maxAmount)}
          </p>
        </div>

        {/* Tenor Slider */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Jangka Waktu: {tenor} bulan
          </label>
          <input
            type="range"
            min={6}
            max={maxTenor}
            step={6}
            value={tenor}
            onChange={(e) => setTenor(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-400"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>6 bln</span>
            <span>{maxTenor} bln</span>
          </div>
        </div>

        {/* Custom Rate (untuk bank umum) */}
        {(loanType === 'bank_umum' || loanType === 'modal_kerja') && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Suku Bunga (% per tahun)
            </label>
            <input
              type="number"
              value={customRate ?? ''}
              onChange={(e) => setCustomRate(e.target.value ? Number(e.target.value) : null)}
              placeholder="6"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-lime-400"
            />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Cicilan per bulan</span>
              <span className="text-lg font-bold text-lime-400">
                {fmtRp(result.monthlyPayment)}
              </span>
            </div>
            
            <div className="border-t border-gray-700 pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Total Pinjaman</span>
                <span className="text-gray-200">{fmtRp(amount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Total Bunga</span>
                <span className="text-amber-400">{fmtRp(result.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Total Pembayaran</span>
                <span className="text-gray-200">{fmtRp(result.totalPayment)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Eff. Rate</span>
                <span className="text-gray-200">{result.effectiveRate}%/th</span>
              </div>
            </div>

            {/* Info */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                💡 <span className="text-gray-400">Simulasi anuitas</span> — Biaya aktual dapat berbeda. 
                Konsultasi dengan bank untuk quote pasti.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
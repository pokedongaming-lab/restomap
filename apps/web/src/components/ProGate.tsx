'use client'

import Link from 'next/link'

type Props = {
  children: React.ReactNode
  feature: string
  locked?: boolean
}

export default function ProGate({ children, feature, locked = true }: Props) {
  if (!locked) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl">
        <span className="text-2xl mb-2">🔒</span>
        <p className="text-xs font-semibold text-gray-700 text-center px-4">
          {feature}
        </p>
        <p className="text-xs text-gray-400 mb-3 text-center px-4">
          Tersedia di Pro
        </p>
        <Link
          href="/upgrade"
          className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-all"
        >
          Upgrade →
        </Link>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, daysUntil } from '@/lib/utils'

type Props = {
  offering: {
    id: string
    minimumInvestmentCents: number
    maximumRaiseCents: number
    totalRaisedCents: number
    totalInvestors: number
    closeDate?: string | null
    status: string
  }
}

export default function OfferingInvestCard({ offering }: Props) {
  const router = useRouter()
  const pct = Math.min(100, (offering.totalRaisedCents / offering.maximumRaiseCents) * 100)
  const days = daysUntil(offering.closeDate ?? null)

  function handleInvest() {
    router.push(`/app/invest/${offering.id}`)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e5e7f0] p-6 sticky top-20" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-bold text-gray-900">{formatCurrency(offering.totalRaisedCents)}</span>
          <span className="text-gray-500">of {formatCurrency(offering.maximumRaiseCents)}</span>
        </div>
        <div className="h-2 bg-[#f0f1f5] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#5271ff' }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{pct.toFixed(1)}% funded</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#f8f9fc] rounded-xl p-3">
          <p className="text-xs text-gray-500">Investors</p>
          <p className="font-bold text-gray-900">{offering.totalInvestors}</p>
        </div>
        {days !== null && (
          <div className="bg-[#f8f9fc] rounded-xl p-3">
            <p className="text-xs text-gray-500">Days left</p>
            <p className="font-bold text-gray-900">{days}</p>
          </div>
        )}
      </div>

      <div className="mb-4 p-3 bg-[#f8f9fc] rounded-xl">
        <p className="text-xs text-gray-500">Minimum Investment</p>
        <p className="font-bold text-gray-900">{formatCurrency(offering.minimumInvestmentCents)}</p>
      </div>

      {offering.status === 'LIVE' ? (
        <button onClick={handleInvest} className="w-full py-3 rounded-xl text-white font-bold text-sm" style={{ background: '#5271ff' }}>
          Invest Now
        </button>
      ) : (
        <button disabled className="w-full py-3 rounded-xl text-gray-400 font-bold text-sm bg-[#f0f1f5] cursor-not-allowed">
          Not Currently Accepting Investments
        </button>
      )}
    </div>
  )
}

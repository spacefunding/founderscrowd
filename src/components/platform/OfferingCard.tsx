import Link from 'next/link'
import { formatCurrency, getOfferingTypeLabel, getOfferingTypeColor, daysUntil } from '@/lib/utils'

type Props = {
  offering: {
    id: string
    slug: string
    title: string
    type: string
    status: string
    shortDescription?: string | null
    heroImageUrl?: string | null
    minimumInvestmentCents: bigint | number
    maximumRaiseCents: bigint | number
    totalRaisedCents: bigint | number
    totalInvestors: number
    closeDate?: Date | string | null
    issuer?: { companyName: string }
  }
}

export default function OfferingCard({ offering }: Props) {
  const pct = Math.min(100, (Number(offering.totalRaisedCents) / Number(offering.maximumRaiseCents)) * 100)
  const days = daysUntil(offering.closeDate ?? null)
  const typeColor = getOfferingTypeColor(offering.type)

  return (
    <Link href={`/app/offerings/${offering.slug}`} className="block bg-white rounded-2xl border border-[#e5e7f0] overflow-hidden hover:shadow-md transition-shadow" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="h-40 bg-gradient-to-br from-[#eef0ff] to-[#e0e4ff] flex items-center justify-center">
        {offering.heroImageUrl ? (
          <img src={offering.heroImageUrl} alt={offering.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl font-bold" style={{ color: typeColor, opacity: 0.3 }}>{offering.title[0]}</div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-bold text-gray-900 leading-tight">{offering.title}</p>
            {offering.issuer && <p className="text-xs text-gray-500 mt-0.5">{offering.issuer.companyName}</p>}
          </div>
          <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: typeColor }}>
            {getOfferingTypeLabel(offering.type)}
          </span>
        </div>
        {offering.shortDescription && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{offering.shortDescription}</p>
        )}
        <div className="h-1.5 bg-[#f0f1f5] rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: typeColor }} />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatCurrency(Number(offering.totalRaisedCents))} raised</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0f1f5]">
          <div>
            <p className="text-xs text-gray-400">Min. investment</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(Number(offering.minimumInvestmentCents))}</p>
          </div>
          {days !== null && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Days left</p>
              <p className="text-sm font-bold text-gray-900">{days}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

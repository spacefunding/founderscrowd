import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency, getOfferingTypeLabel, getSecurityTypeLabel, daysUntil } from '@/lib/utils'
import OfferingInvestCard from '@/components/platform/OfferingInvestCard'

export default async function OfferingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const offering = await prisma.offering.findUnique({
    where: { slug },
    include: { issuer: { select: { companyName: true, website: true, industry: true } } },
  })
  if (!offering || offering.type === 'REG_D_506B') notFound()

  const pct = Math.min(100, (Number(offering.totalRaisedCents) / Number(offering.maximumRaiseCents)) * 100)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-64 rounded-2xl bg-gradient-to-br from-[#eef0ff] to-[#e0e4ff] mb-6 overflow-hidden flex items-center justify-center">
            {offering.heroImageUrl ? (
              <img src={offering.heroImageUrl} alt={offering.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl font-bold text-[#5271ff] opacity-20">{offering.title[0]}</span>
            )}
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{offering.title}</h1>
              <p className="text-gray-500 mt-1">{offering.issuer.companyName}</p>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-full text-white" style={{ background: '#5271ff' }}>
              {getOfferingTypeLabel(offering.type)}
            </span>
          </div>

          <p className="text-gray-600 mb-6">{offering.shortDescription}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Security', value: getSecurityTypeLabel(offering.securityType) },
              { label: 'Min. Investment', value: formatCurrency(Number(offering.minimumInvestmentCents)) },
              { label: 'Goal', value: formatCurrency(Number(offering.maximumRaiseCents)) },
              { label: 'Days Left', value: daysUntil(offering.closeDate)?.toString() ?? 'Ongoing' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#f8f9fc] rounded-xl p-3 border border-[#e5e7f0]">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="font-bold text-gray-900 text-sm">{value}</p>
              </div>
            ))}
          </div>

          {offering.longDescription && (
            <div className="bg-white rounded-2xl border border-[#e5e7f0] p-6 mb-4">
              <h2 className="font-bold text-gray-900 mb-3">About this offering</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{offering.longDescription}</p>
            </div>
          )}
        </div>

        <div>
          <OfferingInvestCard offering={{
            id: offering.id,
            minimumInvestmentCents: Number(offering.minimumInvestmentCents),
            maximumRaiseCents: Number(offering.maximumRaiseCents),
            totalRaisedCents: Number(offering.totalRaisedCents),
            totalInvestors: offering.totalInvestors,
            closeDate: offering.closeDate?.toISOString() ?? null,
            status: offering.status,
          }} />
        </div>
      </div>
    </div>
  )
}

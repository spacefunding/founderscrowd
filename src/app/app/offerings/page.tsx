import { prisma } from '@/lib/prisma'
import OfferingCard from '@/components/platform/OfferingCard'

export default async function OfferingsPage() {
  const offerings = await prisma.offering.findMany({
    where: { status: 'LIVE', type: { not: 'REG_D_506B' } },
    select: {
      id: true, slug: true, title: true, type: true, status: true,
      shortDescription: true, heroImageUrl: true,
      minimumInvestmentCents: true, maximumRaiseCents: true,
      totalRaisedCents: true, totalInvestors: true, closeDate: true,
      issuer: { select: { companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Investment Opportunities</h1>
        <p className="text-gray-500 mt-1">Curated offerings across Reg CF, Reg A+, and Reg D</p>
      </div>

      {offerings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e7f0] p-12 text-center">
          <p className="text-gray-500">No live offerings at this time. Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map(o => (
            <OfferingCard key={o.id} offering={{
              ...o,
              minimumInvestmentCents: Number(o.minimumInvestmentCents),
              maximumRaiseCents: Number(o.maximumRaiseCents),
              totalRaisedCents: Number(o.totalRaisedCents),
              closeDate: o.closeDate?.toISOString() ?? null,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

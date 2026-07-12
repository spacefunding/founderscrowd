import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency, getOfferingTypeLabel } from '@/lib/utils'
import Link from 'next/link'

export default async function BDReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== 'BD_PARTNER') redirect('/app/login')

  const { id } = await params
  const offering = await prisma.offering.findUnique({
    where: { id },
    include: {
      issuer: { include: { user: { select: { email: true, firstName: true, lastName: true } } } },
      documents: true,
    },
  })
  if (!offering) notFound()

  const checks = [
    'Issuer identity verified',
    'EIN / entity documentation on file',
    'Offering disclosure documents reviewed',
    'Financial statements reviewed',
    'Use of proceeds reviewed',
    'Risk factors adequate and complete',
    `Raise limit compliant with ${getOfferingTypeLabel(offering.type)} regulations`,
    'No bad actor disqualifications',
    'EDGAR filing confirmed (if applicable)',
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/bd/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{offering.title}</h1>
          <p className="text-gray-500 text-sm">{offering.issuer.companyName} · {getOfferingTypeLabel(offering.type)}</p>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="bg-white rounded-2xl border border-[#e5e7f0] p-6">
          <h2 className="font-bold text-gray-900 mb-4">Offering Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Type', getOfferingTypeLabel(offering.type)],
              ['Status', offering.status],
              ['Min Investment', formatCurrency(Number(offering.minimumInvestmentCents))],
              ['Raise Goal', formatCurrency(Number(offering.maximumRaiseCents))],
              ['Security', offering.securityType],
              ['Issuer Email', offering.issuer.user.email],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#f8f9fc] rounded-xl p-3">
                <p className="text-xs text-gray-500">{k}</p>
                <p className="font-semibold text-gray-900">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e7f0] p-6">
          <h2 className="font-bold text-gray-900 mb-4">FINRA Compliance Checklist</h2>
          <div className="space-y-2">
            {checks.map(c => (
              <label key={c} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f9fc] cursor-pointer">
                <input type="checkbox" className="rounded" style={{ accentColor: '#5271ff' }} />
                <span className="text-sm text-gray-700">{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e7f0] p-6">
          <h2 className="font-bold text-gray-900 mb-4">Decision</h2>
          <div className="flex gap-3">
            <form action={`/api/bd/offerings/${id}/approve`} method="POST">
              <button type="submit" className="px-4 py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: '#10b981' }}>
                Approve
              </button>
            </form>
            <form action={`/api/bd/offerings/${id}/changes`} method="POST">
              <button type="submit" className="px-4 py-2.5 rounded-xl font-semibold text-sm border border-[#e5e7f0] text-gray-700">
                Request Changes
              </button>
            </form>
            <form action={`/api/bd/offerings/${id}/reject`} method="POST">
              <button type="submit" className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-red-50 text-red-600">
                Reject
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

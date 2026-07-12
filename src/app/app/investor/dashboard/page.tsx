import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { TrendingUp, Briefcase, Clock, AlertCircle } from 'lucide-react'

export default async function InvestorDashboardPage() {
  const session = await auth()
  if (!session || session.user.role !== 'INVESTOR') redirect('/app/login')

  const [investor, investments] = await Promise.all([
    prisma.investorProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.investment.findMany({
      where: { investorId: session.user.id },
      include: { offering: { select: { title: true, type: true, status: true, totalRaisedCents: true, maximumRaiseCents: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const totalInvested = investments.reduce((sum, i) => sum + Number(i.amountCents), 0)
  const activeCount = investments.filter(i => !['CANCELLED', 'REFUNDED', 'FAILED'].includes(i.status)).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {session.user.firstName || 'Investor'}</h1>
        <p className="text-gray-500 mt-1">Your investment portfolio at a glance</p>
      </div>

      {investor && investor.kycStatus !== 'APPROVED' && (
        <div className="mb-6 p-4 rounded-2xl border flex items-start gap-3" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Complete identity verification to start investing</p>
            <p className="text-xs text-amber-700 mt-0.5">KYC verification is required before you can invest in any offering.</p>
          </div>
          <Link href="/app/investor/kyc" className="ml-auto shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: '#f59e0b' }}>
            Start KYC
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: TrendingUp, label: 'Total Invested', value: formatCurrency(totalInvested), color: '#5271ff' },
          { icon: Briefcase, label: 'Active Investments', value: activeCount.toString(), color: '#10b981' },
          { icon: Clock, label: 'Pending', value: investments.filter(i => i.status === 'COMMITTED').length.toString(), color: '#f59e0b' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e5e7f0] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-xs font-medium text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e7f0]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between p-5 border-b border-[#e5e7f0]">
          <h2 className="font-bold text-gray-900">Recent Investments</h2>
          <Link href="/app/investor/portfolio" className="text-xs font-semibold" style={{ color: '#5271ff' }}>View all</Link>
        </div>
        <div className="divide-y divide-[#e5e7f0]">
          {investments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm mb-3">No investments yet</p>
              <Link href="/app/offerings" className="text-sm font-semibold" style={{ color: '#5271ff' }}>Browse offerings →</Link>
            </div>
          ) : investments.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">{inv.offering.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{inv.status} · {inv.offering.type.replace('_', ' ')}</p>
              </div>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(Number(inv.amountCents))}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

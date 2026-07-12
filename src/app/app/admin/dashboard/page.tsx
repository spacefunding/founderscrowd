import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/app/login')

  const [userCount, offeringCount, investmentAgg, kycPending] = await Promise.all([
    prisma.user.count(),
    prisma.offering.count({ where: { status: 'LIVE' } }),
    prisma.investment.aggregate({ _sum: { amountCents: true }, where: { status: { in: ['FUNDED', 'COMPLETED'] } } }),
    prisma.investorProfile.count({ where: { kycStatus: 'PENDING_REVIEW' } }),
  ])

  const stats = [
    { label: 'Total Users', value: userCount.toString() },
    { label: 'Live Offerings', value: offeringCount.toString() },
    { label: 'Total Volume', value: formatCurrency(Number(investmentAgg._sum.amountCents || 0)) },
    { label: 'KYC Pending', value: kycPending.toString() },
  ]

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform administration</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e5e7f0] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e7f0]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="p-5 border-b border-[#e5e7f0]">
          <h2 className="font-bold text-gray-900">Recent Users</h2>
        </div>
        <div className="divide-y divide-[#e5e7f0]">
          {recentUsers.map(u => (
            <div key={u.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#eef0ff] text-[#5271ff]">{u.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

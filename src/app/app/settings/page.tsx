import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { User, Shield, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect('/app/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      investorProfile: {
        select: { kycStatus: true, accreditationStatus: true, onboardingCompleted: true },
      },
    },
  })
  if (!user) redirect('/app/login')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile, security, and preferences</p>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-[#e5e7f0]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 p-5 border-b border-[#e5e7f0]">
            <User size={16} style={{ color: '#5271ff' }} />
            <h2 className="font-bold text-gray-900">Profile Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[{ label: 'First Name', value: user.firstName || '' }, { label: 'Last Name', value: user.lastName || '' }].map(({ label, value }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                  <input type="text" defaultValue={value} className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm text-gray-900 outline-none focus:border-[#5271ff]" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
              <input type="email" defaultValue={user.email} disabled className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm text-gray-400 bg-[#f8f9fc] cursor-not-allowed" />
            </div>
            <button className="px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: '#5271ff' }}>Save Changes</button>
          </div>
        </div>

        {user.investorProfile && (
          <div className="bg-white rounded-2xl border border-[#e5e7f0]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-3 p-5 border-b border-[#e5e7f0]">
              <Shield size={16} style={{ color: '#5271ff' }} />
              <h2 className="font-bold text-gray-900">Verification Status</h2>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Identity (KYC)', ok: user.investorProfile.kycStatus === 'APPROVED', detail: user.investorProfile.kycStatus === 'APPROVED' ? 'Identity confirmed' : 'Complete verification', href: '/app/investor/kyc' },
                { label: 'Accreditation', ok: user.investorProfile.accreditationStatus !== 'NOT_VERIFIED', detail: user.investorProfile.accreditationStatus === 'VERIFIED' ? 'Verified accredited investor' : 'Self-certified (Reg CF only)', href: null },
              ].map(({ label, ok, detail, href }) => (
                <div key={label} className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fc] border border-[#e5e7f0]">
                  <div className="flex items-center gap-3">
                    {ok ? <CheckCircle size={16} className="text-green-500" /> : <Clock size={16} className="text-amber-500" />}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{detail}</p>
                    </div>
                  </div>
                  {!ok && href && (
                    <Link href={href} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#eef0ff', color: '#5271ff' }}>Complete</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#e5e7f0]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 p-5 border-b border-[#e5e7f0]">
            <Shield size={16} style={{ color: '#5271ff' }} />
            <h2 className="font-bold text-gray-900">Security</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fc] border border-[#e5e7f0]">
              <div>
                <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">{user.twoFactorEnabled ? 'Enabled' : 'Add extra security to your account'}</p>
              </div>
              <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${user.twoFactorEnabled ? 'bg-red-50 text-red-600' : 'text-white'}`} style={!user.twoFactorEnabled ? { background: '#5271ff' } : {}}>
                {user.twoFactorEnabled ? 'Disable' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

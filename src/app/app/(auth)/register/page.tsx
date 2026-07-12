'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<'INVESTOR' | 'ISSUER'>('INVESTOR')
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', companyName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error?.message || 'Registration failed')
      setLoading(false)
    } else {
      router.push('/app/login?registered=true')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-4">
      <div className="bg-white rounded-2xl border border-[#e5e7f0] p-8 w-full max-w-md shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: '#5271ff' }}>S</div>
          <span className="font-bold text-gray-900">SpaceFunding</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-6">Join the future of capital markets</p>

        <div className="flex gap-2 mb-6">
          {(['INVESTOR', 'ISSUER'] as const).map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${role === r ? 'text-white border-transparent' : 'text-gray-600 border-[#e5e7f0] bg-[#f8f9fc]'}`}
              style={role === r ? { background: '#5271ff' } : {}}>
              {r === 'INVESTOR' ? 'Investor' : 'Company / Issuer'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">First Name</label>
              <input type="text" required value={form.firstName} onChange={e => set('firstName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Last Name</label>
              <input type="text" required value={form.lastName} onChange={e => set('lastName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" />
            </div>
          </div>
          {role === 'ISSUER' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Company Name</label>
              <input type="text" required value={form.companyName} onChange={e => set('companyName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
            <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
            <input type="password" required minLength={8} value={form.password} onChange={e => set('password', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl text-white font-semibold text-sm mt-2 disabled:opacity-60"
            style={{ background: '#5271ff' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/app/login" className="font-semibold" style={{ color: '#5271ff' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

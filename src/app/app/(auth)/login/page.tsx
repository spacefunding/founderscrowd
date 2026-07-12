'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/app/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white" style={{ background: 'linear-gradient(135deg, #5271ff 0%, #3a55e8 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">S</div>
          <span className="font-bold text-xl">SpaceFunding</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">The future of capital markets is here</h1>
          <p className="text-white/70 text-lg">Reg CF, Reg A+, and Reg D — all on one compliant platform built for the next generation of investors and issuers.</p>
        </div>
        <p className="text-white/50 text-sm">FINRA-registered broker-dealer partner</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm text-gray-900 outline-none focus:border-[#5271ff]"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm text-gray-900 outline-none focus:border-[#5271ff]"
                placeholder="••••••••" />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
              style={{ background: '#5271ff' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/app/register" className="font-semibold" style={{ color: '#5271ff' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

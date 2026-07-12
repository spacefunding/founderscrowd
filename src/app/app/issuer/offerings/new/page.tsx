'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = ['Offering Type', 'Details', 'Terms', 'Review']

export default function NewOfferingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    title: '', type: 'REG_CF', securityType: 'EQUITY',
    shortDescription: '', minimumInvestmentCents: 50000,
    maximumRaiseCents: 500000000, minimumRaiseCents: 100000000,
    pricePerUnitCents: 100,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/offerings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error?.message || 'Failed to create offering')
      setLoading(false)
    } else {
      router.push('/app/issuer/dashboard')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Offering</h1>
        <p className="text-gray-500 mt-1">Submit your raise for broker-dealer review</p>
      </div>

      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'text-white' : 'text-gray-400 bg-[#f0f1f5]'}`} style={i <= step ? { background: '#5271ff' } : {}}>
              {i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? 'bg-[#5271ff]' : 'bg-[#e5e7f0]'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e7f0] p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-4">Select Offering Type</h2>
            {[
              { value: 'REG_CF', label: 'Regulation CF', desc: 'Raise up to $5M from the general public' },
              { value: 'REG_A_PLUS', label: 'Regulation A+', desc: 'Raise up to $75M from anyone' },
              { value: 'REG_D_506C', label: 'Reg D 506(c)', desc: 'Unlimited raise from verified accredited investors' },
            ].map(opt => (
              <button key={opt.value} onClick={() => set('type', opt.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${form.type === opt.value ? 'border-[#5271ff] bg-[#eef0ff]' : 'border-[#e5e7f0] hover:border-[#c7cdf0]'}`}>
                <p className="font-semibold text-gray-900">{opt.label}</p>
                <p className="text-sm text-gray-500">{opt.desc}</p>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-4">Offering Details</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Offering Title</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]"
                placeholder="e.g. Series A Round — Acme Corp" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Security Type</label>
              <select value={form.securityType} onChange={e => set('securityType', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff] bg-white">
                {['EQUITY', 'DEBT', 'REVENUE_SHARE', 'SAFE', 'CONVERTIBLE_NOTE'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Short Description</label>
              <textarea value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)}
                rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff] resize-none"
                placeholder="Brief pitch (shown in listing cards)" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-4">Terms</h2>
            {[
              { label: 'Minimum Investment ($)', field: 'minimumInvestmentCents', multiplier: 100 },
              { label: 'Raise Goal ($)', field: 'maximumRaiseCents', multiplier: 100 },
              { label: 'Minimum Raise ($)', field: 'minimumRaiseCents', multiplier: 100 },
              { label: 'Price Per Unit ($)', field: 'pricePerUnitCents', multiplier: 100 },
            ].map(({ label, field, multiplier }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                <input type="number" value={(form[field as keyof typeof form] as number) / multiplier}
                  onChange={e => set(field, Math.round(parseFloat(e.target.value) * multiplier))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" />
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Review & Submit</h2>
            <div className="space-y-2 text-sm">
              {[
                ['Title', form.title],
                ['Type', form.type],
                ['Security', form.securityType],
                ['Min Investment', `$${form.minimumInvestmentCents / 100}`],
                ['Raise Goal', `$${form.maximumRaiseCents / 100}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[#f0f1f5]">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">Your offering will be submitted for broker-dealer review before going live.</p>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="px-4 py-2.5 rounded-xl border border-[#e5e7f0] text-sm font-semibold text-gray-600 disabled:opacity-40">
          Back
        </button>
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: '#5271ff' }}>
            Continue
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60" style={{ background: '#5271ff' }}>
            {loading ? 'Submitting…' : 'Submit for Review'}
          </button>
        )}
      </div>
    </div>
  )
}

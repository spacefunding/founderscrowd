'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

const STEPS = [
  'Personal Info',
  'Identity',
  'Financial Profile',
  'Investment Experience',
  'Suitability',
  'KYC Verification',
  'AML Screening',
  'Complete',
]

export default function KYCPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    addressLine1: '', city: '', state: '', zipCode: '',
    dob: '', ssn: '',
    employmentStatus: 'EMPLOYED', annualIncomeCents: 10000000, netWorthCents: 50000000,
    investmentExperience: 'SOME', riskTolerance: 'MODERATE',
  })

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function next() {
    setLoading(true)
    try {
      await fetch(`/api/kyc/onboarding/step/${step + 1}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (step === STEPS.length - 1) {
        router.push('/app/investor/dashboard')
      } else {
        setStep(s => s + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  if (step === STEPS.length - 1) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h1>
        <p className="text-gray-500 mb-6">Your identity has been verified. You can now invest on the platform.</p>
        <button onClick={() => router.push('/app/offerings')} className="px-6 py-3 rounded-xl text-white font-semibold" style={{ background: '#5271ff' }}>
          Browse Offerings
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
        <p className="text-gray-500 mt-1">Required to invest on the platform</p>
      </div>

      <div className="flex gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 h-1 rounded-full" style={{ background: i <= step ? '#5271ff' : '#e5e7f0' }} />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e7f0] p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">{STEPS[step]}</h2>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Street Address</label>
              <input type="text" value={form.addressLine1} onChange={e => set('addressLine1', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]"
                placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
                <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">State</label>
                <input type="text" value={form.state} onChange={e => set('state', e.target.value)} maxLength={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" placeholder="CA" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">ZIP</label>
                <input type="text" value={form.zipCode} onChange={e => set('zipCode', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Social Security Number</label>
              <input type="password" value={form.ssn} onChange={e => set('ssn', e.target.value)}
                placeholder="XXX-XX-XXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff]" />
              <p className="text-xs text-gray-400 mt-1">Encrypted and stored securely. Used for identity verification only.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Employment Status</label>
              <select value={form.employmentStatus} onChange={e => set('employmentStatus', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff] bg-white">
                {['EMPLOYED', 'SELF_EMPLOYED', 'RETIRED', 'STUDENT', 'UNEMPLOYED'].map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Annual Income</label>
              <select value={form.annualIncomeCents} onChange={e => set('annualIncomeCents', parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff] bg-white">
                <option value={3000000}>Under $30,000</option>
                <option value={6000000}>$30,000 – $60,000</option>
                <option value={10000000}>$60,000 – $100,000</option>
                <option value={15000000}>$100,000 – $150,000</option>
                <option value={25000000}>$150,000 – $250,000</option>
                <option value={50000000}>$250,000+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Net Worth (excluding primary residence)</label>
              <select value={form.netWorthCents} onChange={e => set('netWorthCents', parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff] bg-white">
                <option value={5000000}>Under $50,000</option>
                <option value={15000000}>$50,000 – $150,000</option>
                <option value={50000000}>$150,000 – $500,000</option>
                <option value={100000000}>$500,000 – $1M</option>
                <option value={200000000}>$1M – $5M</option>
                <option value={1000000000}>$5M+</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Investment Experience</label>
              <div className="space-y-2">
                {[
                  { value: 'NONE', label: 'None — first time investing' },
                  { value: 'SOME', label: 'Some — stocks and mutual funds' },
                  { value: 'EXPERIENCED', label: 'Experienced — private markets & alternatives' },
                  { value: 'PROFESSIONAL', label: 'Professional — institutional or angel investor' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${form.investmentExperience === opt.value ? 'border-[#5271ff] bg-[#eef0ff]' : 'border-[#e5e7f0]'}`}>
                    <input type="radio" name="experience" value={opt.value} checked={form.investmentExperience === opt.value}
                      onChange={e => set('investmentExperience', e.target.value)} />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Risk Tolerance</label>
              <div className="space-y-2">
                {[
                  { value: 'CONSERVATIVE', label: 'Conservative — capital preservation priority' },
                  { value: 'MODERATE', label: 'Moderate — balanced growth and income' },
                  { value: 'AGGRESSIVE', label: 'Aggressive — maximum growth, comfortable with loss' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${form.riskTolerance === opt.value ? 'border-[#5271ff] bg-[#eef0ff]' : 'border-[#e5e7f0]'}`}>
                    <input type="radio" name="risk" value={opt.value} checked={form.riskTolerance === opt.value}
                      onChange={e => set('riskTolerance', e.target.value)} />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-800 font-semibold mb-1">Important Risk Disclosure</p>
              <p className="text-xs text-amber-700">Investments in private companies are illiquid, speculative, and involve significant risk of loss. You may lose your entire investment. Only invest amounts you can afford to lose.</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-xl bg-[#eef0ff] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="font-semibold text-gray-900 mb-2">Running Identity Check</p>
            <p className="text-sm text-gray-500">We verify your identity using Persona. This takes about 30 seconds in demo mode.</p>
          </div>
        )}

        {step === 6 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-xl bg-[#eef0ff] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <p className="font-semibold text-gray-900 mb-2">AML Screening</p>
            <p className="text-sm text-gray-500">Checking against global watchlists and sanctions databases via Sardine.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="px-4 py-2.5 rounded-xl border border-[#e5e7f0] text-sm font-semibold text-gray-600 disabled:opacity-40">
          Back
        </button>
        <button onClick={next} disabled={loading}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60" style={{ background: '#5271ff' }}>
          {loading ? 'Processing…' : step === STEPS.length - 2 ? 'Complete Verification' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

const STEPS = ['Amount', 'Suitability', 'Sign', 'Fund']

export default function InvestPage({ params }: { params: Promise<{ offeringId: string }> }) {
  const { offeringId } = use(params)
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [offering, setOffering] = useState<{
    id: string; title: string; type: string; minimumInvestmentCents: number;
    maximumRaiseCents: number; totalRaisedCents: number; pricePerUnitCents: number;
    totalInvestors: number; closeDate?: string | null; status: string;
  } | null>(null)
  const [amount, setAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'ACH' | 'WIRE'>('ACH')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/offerings/${offeringId}/detail`)
      .then(r => r.json())
      .then(j => {
        if (j.data) {
          setOffering(j.data)
          setAmount(j.data.minimumInvestmentCents)
        }
      })
  }, [offeringId])

  async function handleInvest() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/investments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offeringId, amountCents: amount, paymentMethod }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error?.message || 'Investment failed')
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (!offering) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#5271ff] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Investment Committed!</h1>
        <p className="text-gray-500 mb-2">Your investment of <strong>{formatCurrency(amount)}</strong> in {offering.title} has been committed.</p>
        <p className="text-sm text-gray-400 mb-6">You&apos;ll receive wire instructions or ACH authorization within 24 hours.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push('/app/investor/portfolio')} className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: '#5271ff' }}>
            View Portfolio
          </button>
          <button onClick={() => router.push('/app/offerings')} className="px-5 py-2.5 rounded-xl border border-[#e5e7f0] font-semibold text-sm text-gray-600">
            Browse More
          </button>
        </div>
      </div>
    )
  }

  const units = Math.floor(amount / offering.pricePerUnitCents)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">Invest in {offering.title}</h1>
      </div>

      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'text-white' : 'text-gray-400 bg-[#f0f1f5]'}`} style={i <= step ? { background: '#5271ff' } : {}}>
              {i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? 'bg-[#5271ff]' : 'bg-[#e5e7f0]'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e7f0] p-6 mb-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-4">Investment Amount</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount (USD)</label>
              <input type="number" value={amount / 100} min={offering.minimumInvestmentCents / 100}
                onChange={e => setAmount(Math.round(parseFloat(e.target.value) * 100))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7f0] text-sm outline-none focus:border-[#5271ff] text-2xl font-bold" />
              <p className="text-xs text-gray-400 mt-1">Minimum: {formatCurrency(offering.minimumInvestmentCents)}</p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 5, 10].map(mult => {
                const val = offering.minimumInvestmentCents * mult
                return (
                  <button key={mult} onClick={() => setAmount(val)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${amount === val ? 'border-[#5271ff] bg-[#eef0ff] text-[#5271ff]' : 'border-[#e5e7f0] text-gray-600'}`}>
                    {formatCurrency(val)}
                  </button>
                )
              })}
            </div>
            <div className="bg-[#f8f9fc] rounded-xl p-4 border border-[#e5e7f0]">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Units</span>
                <span className="font-bold text-gray-900">{units.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Price per unit</span>
                <span className="font-bold text-gray-900">{formatCurrency(offering.pricePerUnitCents)}</span>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-4">Suitability Confirmation</h2>
            <div className="space-y-3">
              {[
                'I understand that investing in private companies is illiquid and highly risky',
                'I can afford to lose my entire investment amount',
                'I have read the offering materials and understand the terms',
                `I understand this is a ${offering.type.replace('_', ' ')} offering with specific regulatory limits`,
              ].map(text => (
                <label key={text} className="flex items-start gap-3 p-3 rounded-xl border border-[#e5e7f0] cursor-pointer">
                  <input type="checkbox" className="mt-0.5" style={{ accentColor: '#5271ff' }} />
                  <span className="text-sm text-gray-700">{text}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-4">Sign Subscription Agreement</h2>
            <div className="bg-[#f8f9fc] rounded-xl p-4 border border-[#e5e7f0] max-h-48 overflow-y-auto text-xs text-gray-600 leading-relaxed">
              <p className="font-semibold mb-2">SUBSCRIPTION AGREEMENT — SUMMARY</p>
              <p className="mb-2">Investor agrees to subscribe for {units.toLocaleString()} units of {offering.title} at {formatCurrency(offering.pricePerUnitCents)} per unit, for a total of {formatCurrency(amount)}.</p>
              <p className="mb-2">This investment is made pursuant to Regulation {offering.type.replace('REG_', '').replace('_', ' ')} of the Securities Act of 1933, as amended.</p>
              <p>Investor acknowledges the high risk nature of this investment, the potential for total loss of invested capital, and the illiquid nature of private securities. Investor represents they meet all applicable suitability standards.</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: '#5271ff' }} />
              <span className="text-sm text-gray-700">I have read and agree to the subscription agreement above</span>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-4">Fund Your Investment</h2>
            <div className="flex gap-3">
              {(['ACH', 'WIRE'] as const).map(method => (
                <button key={method} onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm ${paymentMethod === method ? 'border-[#5271ff] bg-[#eef0ff] text-[#5271ff]' : 'border-[#e5e7f0] text-gray-600'}`}>
                  {method === 'ACH' ? 'ACH Bank Transfer' : 'Wire Transfer'}
                </button>
              ))}
            </div>
            <div className="bg-[#f8f9fc] rounded-xl p-4 border border-[#e5e7f0]">
              {paymentMethod === 'ACH' ? (
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-gray-900 mb-2">ACH Instructions</p>
                  <p>You&apos;ll receive a DocuSign link to authorize the ACH debit from your bank account. Funds typically settle in 3–5 business days.</p>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-gray-900 mb-2">Wire Instructions</p>
                  <p>Wire instructions will be emailed to you within 1 business day. Funds must be received within 5 business days of commitment.</p>
                </div>
              )}
            </div>
            <div className="flex justify-between p-4 bg-[#f8f9fc] rounded-xl border border-[#e5e7f0] font-bold">
              <span className="text-gray-700">Total to fund:</span>
              <span className="text-gray-900">{formatCurrency(amount)}</span>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="px-4 py-2.5 rounded-xl border border-[#e5e7f0] text-sm font-semibold text-gray-600 disabled:opacity-40">
          Back
        </button>
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={step === 2 && !agreed}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40" style={{ background: '#5271ff' }}>
            Continue
          </button>
        ) : (
          <button onClick={handleInvest} disabled={loading}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60" style={{ background: '#5271ff' }}>
            {loading ? 'Processing…' : `Commit ${formatCurrency(amount)}`}
          </button>
        )}
      </div>
    </div>
  )
}

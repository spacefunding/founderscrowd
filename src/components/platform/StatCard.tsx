import { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  label: string
  value: string
  change?: string
  color?: string
}

export default function StatCard({ icon: Icon, label, value, change, color = '#5271ff' }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e7f0] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {change && <p className="text-xs text-gray-400 mt-1">{change}</p>}
    </div>
  )
}

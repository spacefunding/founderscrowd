type Status = 'COMMITTED' | 'SIGNED' | 'FUNDED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'FAILED'

const configs: Record<Status, { label: string; bg: string; color: string }> = {
  COMMITTED: { label: 'Committed', bg: '#fffbeb', color: '#d97706' },
  SIGNED: { label: 'Signed', bg: '#eff6ff', color: '#2563eb' },
  FUNDED: { label: 'Funded', bg: '#f0fdf4', color: '#16a34a' },
  COMPLETED: { label: 'Completed', bg: '#f9fafb', color: '#4b5563' },
  CANCELLED: { label: 'Cancelled', bg: '#fef2f2', color: '#dc2626' },
  REFUNDED: { label: 'Refunded', bg: '#f9fafb', color: '#4b5563' },
  FAILED: { label: 'Failed', bg: '#fef2f2', color: '#dc2626' },
}

export default function InvestmentStatusBadge({ status }: { status: Status }) {
  const cfg = configs[status] || { label: status, bg: '#f9fafb', color: '#4b5563' }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

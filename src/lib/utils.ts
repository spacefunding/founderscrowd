import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateRegCFLimit(annualIncomeCents: number, netWorthCents: number): number {
  const income = annualIncomeCents / 100
  const netWorth = netWorthCents / 100
  if (income < 124_000 || netWorth < 124_000) {
    const base = Math.min(income, netWorth)
    const limit = Math.max(2_500, base * 0.05)
    return Math.min(limit, 124_000) * 100
  }
  const limit = Math.min(income, netWorth) * 0.10
  return Math.min(limit, 124_000) * 100
}

export function formatCurrency(cents: number | bigint): string {
  const amount = typeof cents === 'bigint' ? Number(cents) : cents
  if (amount >= 100_000_000) return `$${(amount / 100_000_000).toFixed(1)}M`
  if (amount >= 100_000) return `$${(amount / 100_000).toFixed(0)}K`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`
}

export function daysUntil(date: Date | string | null): number | null {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = d.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function getOfferingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    REG_CF: 'Reg CF',
    REG_A_PLUS: 'Reg A+',
    REG_D_506B: 'Reg D 506(b)',
    REG_D_506C: 'Reg D 506(c)',
  }
  return labels[type] || type
}

export function getOfferingTypeColor(type: string): string {
  const colors: Record<string, string> = {
    REG_CF: '#5271ff',
    REG_A_PLUS: '#10b981',
    REG_D_506B: '#f59e0b',
    REG_D_506C: '#8b5cf6',
  }
  return colors[type] || '#6b7280'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    LIVE: '#10b981',
    DRAFT: '#6b7280',
    PENDING_REVIEW: '#f59e0b',
    APPROVED: '#3b82f6',
    CLOSED: '#6b7280',
    CANCELLED: '#ef4444',
    CHANGES_REQUESTED: '#f59e0b',
  }
  return colors[status] || '#6b7280'
}

export function getSecurityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    EQUITY: 'Equity',
    DEBT: 'Debt',
    REVENUE_SHARE: 'Revenue Share',
    SAFE: 'SAFE',
    CONVERTIBLE_NOTE: 'Convertible Note',
  }
  return labels[type] || type
}

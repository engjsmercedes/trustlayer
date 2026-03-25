import type { ProfileStatus, PlanType } from '@/types/database'

export type BadgeVariant = 'free' | 'verified' | 'trial' | 'protected' | 'suspended'

export interface BadgeInfo {
  variant: BadgeVariant
  label: string
  sublabel: string | null
  color: string
  textColor: string
  borderColor: string
  dotColor: string
}

export function getBadgeInfo(state: { status: ProfileStatus; plan_type: PlanType; coverage_amount: number; trial_ends_at?: string | null }): BadgeInfo {
  if (state.status === 'suspended') return { variant: 'suspended', label: 'Protection Suspended', sublabel: null, color: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200', dotColor: 'bg-red-500' }
  if (state.plan_type === 'trial') return { variant: 'trial', label: 'Protection Active', sublabel: 'Trial — limited coverage', color: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200', dotColor: 'bg-amber-500' }
  if (state.plan_type === 'starter' || state.plan_type === 'growth') return { variant: 'protected', label: 'Protected Purchase', sublabel: `Coverage up to $${state.coverage_amount}`, color: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', dotColor: 'bg-blue-500' }
  if (state.status === 'verified' || state.plan_type === 'verified') return { variant: 'verified', label: 'Verified Builder', sublabel: null, color: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200', dotColor: 'bg-green-500' }
  return { variant: 'free', label: 'Profile Registered', sublabel: 'Not Verified', color: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-200', dotColor: 'bg-gray-400' }
}

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

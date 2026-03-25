import { getBadgeInfo } from '@/lib/badge'
import type { ProfileStatus, PlanType } from '@/types/database'

interface BadgeProps { status: ProfileStatus; plan_type: PlanType; coverage_amount: number; size?: 'sm' | 'md' | 'lg' }

export function Badge({ status, plan_type, coverage_amount, size = 'md' }: BadgeProps) {
  const info = getBadgeInfo({ status, plan_type, coverage_amount })
  const sizeClasses = { sm: 'px-2.5 py-1 text-xs gap-1.5', md: 'px-3 py-1.5 text-sm gap-2', lg: 'px-4 py-2 text-sm gap-2.5' }
  const dotSizes = { sm: 'w-1.5 h-1.5', md: 'w-2 h-2', lg: 'w-2.5 h-2.5' }
  return (
    <div className={`inline-flex flex-col rounded-lg border ${info.color} ${info.borderColor}`}>
      <div className={`inline-flex items-center ${sizeClasses[size]}`}>
        <span className={`rounded-full flex-shrink-0 ${dotSizes[size]} ${info.dotColor}`} />
        <span className={`font-medium ${info.textColor}`}>{info.label}</span>
      </div>
      {info.sublabel && (
        <div className="px-3 pb-1.5 -mt-0.5">
          <span className={`text-xs ${info.textColor} opacity-70`}>{info.sublabel}</span>
        </div>
      )}
    </div>
  )
}

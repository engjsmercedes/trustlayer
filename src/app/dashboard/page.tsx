import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/badge/Badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*, plans(*)').eq('user_id', user.id).single()
  if (!profile) redirect('/onboarding')
  const plan = Array.isArray(profile.plans) ? profile.plans[0] : profile.plans
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trustlayer.io'
  const embedSnippet = `<script src="${appUrl}/trustlayer.js" data-slug="${profile.slug}"></script>`
  const { count: totalClaims } = await supabase.from('claims').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id)
  const { count: openClaims } = await supabase.from('claims').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id).in('status', ['pending', 'awaiting_seller', 'under_review'])

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hey, {profile.full_name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">trustlayer.io/builder/<span className="font-medium text-gray-700">{profile.slug}</span></p>
        </div>
        <Badge status={profile.status} plan_type={plan?.plan_type ?? 'free'} coverage_amount={plan?.coverage_amount ?? 0} size="md" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Plan', value: plan?.plan_type ?? 'free', cap: true }, { label: 'Total claims', value: String(totalClaims ?? 0) }, { label: 'Open claims', value: String(openClaims ?? 0) }].map(s => (
          <div key={s.label} className="card">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold text-gray-900 ${s.cap ? 'capitalize' : ''}`}>{s.value}</p>
          </div>
        ))}
      </div>
      {(plan?.plan_type === 'free' || !plan) && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-900">Upgrade to Verified</p>
            <p className="text-xs text-blue-700 mt-0.5">Add a verified badge and domain verification for $9/month</p>
          </div>
          <button className="btn-primary text-sm whitespace-nowrap opacity-60 cursor-not-allowed" disabled>Coming soon</button>
        </div>
      )}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Add badge to your site</h2>
        <p className="text-sm text-gray-500 mb-4">Paste this snippet before the closing &lt;/body&gt; tag.</p>
        <div className="relative">
          <pre className="bg-gray-950 text-green-400 text-xs rounded-lg p-4 overflow-x-auto font-mono leading-relaxed">{embedSnippet}</pre>
        </div>
      </div>
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Recent claims</h2>
        {(totalClaims ?? 0) === 0 ? (
          <div className="text-center py-8"><p className="text-sm text-gray-500">No claims yet — that's a good sign!</p></div>
        ) : (
          <p className="text-sm text-gray-500">{totalClaims} total claims</p>
        )}
      </div>
    </div>
  )
}

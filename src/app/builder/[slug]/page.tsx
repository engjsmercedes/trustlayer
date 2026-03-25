import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/badge/Badge'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: p } = await supabase.from('profiles').select('full_name').eq('slug', slug).single()
  if (!p) return { title: 'Profile not found — TrustLayer' }
  return { title: `${p.full_name} — TrustLayer`, description: `Verified builder profile for ${p.full_name}. Powered by TrustLayer.` }
}

export default async function BuilderProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: badge } = await supabase.from('badge_states').select('*').eq('slug', slug).single()
  if (!badge) notFound()
  const { count: resolvedClaims } = await supabase.from('claims').select('*', { count: 'exact', head: true }).eq('profile_id', badge.profile_id).eq('status', 'approved')
  const { count: totalClaims } = await supabase.from('claims').select('*', { count: 'exact', head: true }).eq('profile_id', badge.profile_id)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center"><span className="text-white text-xs font-semibold">T</span></div>
            <span className="text-sm font-medium text-gray-700">TrustLayer</span>
          </Link>
          <span className="text-xs text-gray-400">Verified builder registry</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="card">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-4"><span className="text-white text-xl font-semibold">{badge.full_name.charAt(0).toUpperCase()}</span></div>
              <h1 className="text-xl font-semibold text-gray-900">{badge.full_name}</h1>
              {badge.website_url && <a href={badge.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 inline-block">{badge.website_url.replace(/^https?:\/\//, '')}</a>}
            </div>
            <Badge status={badge.status} plan_type={badge.plan_type} coverage_amount={badge.coverage_amount} size="lg" />
          </div>
          <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-100">
            <div className="text-center"><p className="text-xl font-semibold text-gray-900">{totalClaims ?? 0}</p><p className="text-xs text-gray-400 mt-0.5">Total claims</p></div>
            <div className="text-center border-x border-gray-100"><p className="text-xl font-semibold text-gray-900">{resolvedClaims ?? 0}</p><p className="text-xs text-gray-400 mt-0.5">Resolved</p></div>
            <div className="text-center"><p className="text-xl font-semibold text-gray-900">{badge.plan_type === 'starter' || badge.plan_type === 'growth' ? `$${badge.coverage_amount}` : '—'}</p><p className="text-xs text-gray-400 mt-0.5">Max coverage</p></div>
          </div>
        </div>
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">How protection works</h2>
          <div className="space-y-4">
            {[{ icon: '🛡️', title: 'Builder is accountable', desc: 'This builder has registered with TrustLayer. Their activity is monitored.' }, { icon: '📋', title: 'File a claim if something goes wrong', desc: 'If you don\'t receive what was promised, file a claim. The builder has 48 hours to respond.' }, { icon: '⚖️', title: 'Fair review process', desc: 'Our team reviews all claims and contacts the seller first.' }].map(item => (
              <div key={item.title} className="flex gap-3"><span className="text-xl flex-shrink-0">{item.icon}</span><div><p className="text-sm font-medium text-gray-900">{item.title}</p><p className="text-sm text-gray-500 mt-0.5">{item.desc}</p></div></div>
            ))}
          </div>
        </div>
        {badge.status !== 'suspended' && (
          <div className="card border-dashed text-center">
            <p className="text-sm text-gray-500 mb-3">Had an issue with a purchase from this builder?</p>
            <Link href={`/claim/${slug}`} className="btn-secondary text-sm">File a claim</Link>
          </div>
        )}
        <p className="text-center text-xs text-gray-400">Powered by <Link href="/" className="hover:text-gray-600 underline">TrustLayer</Link></p>
      </main>
    </div>
  )
}

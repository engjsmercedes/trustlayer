import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('full_name, slug, status').eq('user_id', user.id).single()
  if (!profile) redirect('/onboarding')
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center"><span className="text-white text-xs font-semibold">T</span></div>
            <span className="text-sm font-semibold text-gray-900">TrustLayer</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors">Dashboard</Link>
            <Link href={`/builder/${profile.slug}`} target="_blank" className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1">
              Public profile
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">{profile.full_name.charAt(0).toUpperCase()}</div>
            <form action="/api/auth/signout" method="POST"><button type="submit" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Sign out</button></form>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

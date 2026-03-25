import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBadgeInfo } from '@/lib/badge'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: badge, error } = await supabase.from('badge_states').select('*').eq('slug', slug).single()
  if (error || !badge) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const info = getBadgeInfo({ status: badge.status, plan_type: badge.plan_type, coverage_amount: badge.coverage_amount })
  return NextResponse.json(
    { slug: badge.slug, name: badge.full_name, variant: info.variant, label: info.label, sublabel: info.sublabel, coverage_amount: badge.coverage_amount, profile_url: `${process.env.NEXT_PUBLIC_APP_URL}/builder/${badge.slug}` },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' } })
}

'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ClaimPage() {
  const { slug } = useParams<{ slug: string }>()
  const supabase = createClient()
  const [step, setStep] = useState<'form'|'success'|'not_found'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ buyer_name: '', buyer_email: '', order_reference: '', issue_description: '', proof: '' })
  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const { data: profile } = await supabase.from('profiles').select('id, status').eq('slug', slug).single()
    if (!profile) { setStep('not_found'); setLoading(false); return }
    if (profile.status === 'suspended') { setError('Protection suspended. Claims cannot be filed.'); setLoading(false); return }
    const { error: insertError } = await supabase.from('claims').insert({ profile_id: profile.id, buyer_name: form.buyer_name, buyer_email: form.buyer_email, order_reference: form.order_reference || null, issue_description: form.issue_description, proof: form.proof || null, status: 'pending' })
    if (insertError) { setError(insertError.message); setLoading(false); return }
    setStep('success'); setLoading(false)
  }

  if (step === 'success') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md card text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Claim submitted</h2>
        <p className="text-sm text-gray-500 mb-6">We notified the builder. They have 48 hours to respond. We\'ll email <strong>{form.buyer_email}</strong> with updates.</p>
        <Link href={`/builder/${slug}`} className="btn-secondary w-full">Back to profile</Link>
      </div>
    </div>
  )

  if (step === 'not_found') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md card text-center"><p className="text-gray-500 text-sm mb-4">Builder not found.</p><Link href="/" className="btn-secondary">Back to home</Link></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link href={`/builder/${slug}`} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to profile
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">File a claim</h1>
          <p className="text-sm text-gray-500 mt-1">Please provide as much detail as possible.</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3.5">
            <p className="text-xs font-medium text-blue-800 mb-1">Requirements</p>
            <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside"><li>Purchase within last 14 days</li><li>You attempted to contact the builder first</li><li>You have proof of the issue</li></ul>
          </div>
          <div><label className="label">Your name</label><input type="text" value={form.buyer_name} onChange={e => update('buyer_name', e.target.value)} className="input" placeholder="Jane Smith" required /></div>
          <div><label className="label">Your email</label><input type="email" value={form.buyer_email} onChange={e => update('buyer_email', e.target.value)} className="input" placeholder="jane@example.com" required /></div>
          <div><label className="label">Order reference <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={form.order_reference} onChange={e => update('order_reference', e.target.value)} className="input" placeholder="Order #12345" /></div>
          <div><label className="label">Describe the issue</label><textarea value={form.issue_description} onChange={e => update('issue_description', e.target.value)} className="input min-h-[100px] resize-none" placeholder="What went wrong? When did you contact the seller?" required /></div>
          <div><label className="label">Proof <span className="text-gray-400 font-normal">(optional)</span></label><textarea value={form.proof} onChange={e => update('proof', e.target.value)} className="input min-h-[80px] resize-none" placeholder="Link to screenshot, email thread, etc." /></div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Submitting…' : 'Submit claim'}</button>
          <p className="text-xs text-gray-400 text-center">Claims reviewed within 2–3 business days.</p>
        </form>
      </div>
    </div>
  )
}

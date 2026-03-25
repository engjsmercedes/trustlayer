'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/badge'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [form, setForm] = useState({ full_name: '', website_url: '', slug: '' })
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { if (user?.email) setUserEmail(user.email) })
  }, [])

  function handleNameChange(name: string) { setForm(f => ({ ...f, full_name: name, slug: slugify(name) })); setSlugAvailable(null) }
  function handleSlugChange(slug: string) { setForm(f => ({ ...f, slug: slugify(slug) })); setSlugAvailable(null) }

  async function checkSlug() {
    if (!form.slug) return
    setCheckingSlug(true)
    const { data } = await supabase.from('profiles').select('id').eq('slug', form.slug).maybeSingle()
    setSlugAvailable(!data)
    setCheckingSlug(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (slugAvailable === false) return
    setLoading(true); setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile, error: profileError } = await supabase.from('profiles').insert({ user_id: user.id, full_name: form.full_name, email: userEmail, website_url: form.website_url || null, slug: form.slug, status: 'free' }).select().single()
    if (profileError) { setError(profileError.message); setLoading(false); return }
    await supabase.from('plans').insert({ profile_id: profile.id, plan_type: 'free', coverage_amount: 0, pool_limit: 0, pool_used: 0 })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center"><span className="text-white text-sm font-semibold">T</span></div>
            <span className="text-lg font-semibold text-gray-900">TrustLayer</span>
          </div>
        </div>
        <div className="card">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                {[1, 2].map(s => <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? 'w-8 bg-gray-900' : 'w-4 bg-gray-200'}`} />)}
              </div>
              <span className="text-xs text-gray-400 ml-1">Step {step} of 2</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{step === 1 ? 'Create your builder profile' : 'Claim your public URL'}</h1>
            <p className="text-sm text-gray-500 mt-1">{step === 1 ? 'This is how buyers will know you.' : 'Your profile will be live at this address.'}</p>
          </div>
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div><label className="label">Your name or brand</label><input type="text" value={form.full_name} onChange={e => handleNameChange(e.target.value)} placeholder="Acme Inc. or Jane Smith" className="input" required autoFocus /></div>
                <div><label className="label">Website <span className="text-gray-400 font-normal">(optional)</span></label><input type="url" value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://yourapp.com" className="input" /></div>
                <button type="submit" className="btn-primary w-full" disabled={!form.full_name}>Continue</button>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="label">Your profile slug</label>
                  <div className="flex gap-2">
                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 whitespace-nowrap">trustlayer.io/builder/</div>
                    <input type="text" value={form.slug} onChange={e => handleSlugChange(e.target.value)} onBlur={checkSlug} placeholder="your-name" className="input" required />
                  </div>
                  <div className="mt-2 h-5">
                    {checkingSlug && <p className="text-xs text-gray-400">Checking…</p>}
                    {!checkingSlug && slugAvailable === true && <p className="text-xs text-green-600">Available</p>}
                    {!checkingSlug && slugAvailable === false && <p className="text-xs text-red-600">Already taken — try another</p>}
                  </div>
                </div>
                {error && <p className="error-text">{error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" className="btn-primary flex-1" disabled={loading || !form.slug || slugAvailable === false}>{loading ? 'Creating…' : 'Create profile'}</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

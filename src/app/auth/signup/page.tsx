'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/api/auth/callback`, shouldCreateUser: true } })
    if (error) { setError(error.message); setLoading(false) } else { setSent(true); setLoading(false) }
  }

  if (sent) return (
    <div className="card text-center">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
      <p className="text-sm text-gray-500 mb-6">We sent a magic link to <strong>{email}</strong>. Click it to create your account.</p>
      <button onClick={() => setSent(false)} className="btn-secondary w-full">Use a different email</button>
    </div>
  )

  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Create your account</h1>
      <p className="text-sm text-gray-500 mb-6">Start building trust with your users — free forever</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" required autoFocus />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Sending…' : 'Create account'}</button>
      </form>
      <p className="text-sm text-center text-gray-500 mt-5">Already have an account?{' '}<Link href="/auth/login" className="text-gray-900 font-medium hover:underline">Sign in</Link></p>
    </div>
  )
}

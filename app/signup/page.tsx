'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, fullName }) });
      const j = await r.json();
      if (!r.ok) { setError(j.error || 'Sign up failed'); return; }
      router.push('/dashboard');
      router.refresh();
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-sm fade-up">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-8 justify-center">
          <span className="w-7 h-7 rounded-lg bg-emerald-500 grid place-items-center text-black text-sm font-black">V</span>
          VCroom<span className="accent">.app</span>
        </Link>
        <div className="card p-7">
          <h1 className="text-xl font-bold mb-1">Create your account</h1>
          <p className="text-sm muted mb-6">Start your first simulated investor meeting — free.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="6+ characters" />
            </div>
            {error && <div className="text-rose-400 text-sm">{error}</div>}
            <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
          </form>
          <p className="text-sm muted mt-5 text-center">Already have an account? <Link href="/login" className="text-emerald-400 hover:underline">Log in</Link></p>
          <p className="text-xs muted mt-4 text-center">Simulated assessment only — not an investment offer.</p>
        </div>
      </div>
    </div>
  );
}

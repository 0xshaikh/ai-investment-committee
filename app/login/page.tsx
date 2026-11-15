'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const j = await r.json();
      if (!r.ok) { setError(j.error || 'Login failed'); return; }
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
          <h1 className="text-xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm muted mb-6">Log in to continue your investor meeting.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-rose-400 text-sm">{error}</div>}
            <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</button>
          </form>
          <p className="text-sm muted mt-5 text-center">New here? <Link href="/signup" className="text-emerald-400 hover:underline">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}

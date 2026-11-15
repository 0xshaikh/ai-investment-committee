'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Startup { id: string; name: string; stage?: string; sector?: string; created_at: string; }
interface Session { id: string; startup_id: string; startup_name: string; status: string; created_at: string; }

const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B+'];
const SECTORS = ['AI/ML', 'Fintech', 'Healthtech', 'SaaS', 'Marketplace', 'Consumer', 'DevTools', 'Agritech', 'Edtech', 'Other'];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name?: string; email: string } | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', tagline: '', stage: 'Pre-seed', sector: 'AI/ML', business_model: '', description: '', funding_ask_usd: '', equity_offered_pct: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const me = await fetch('/api/auth/me').then((r) => r.json());
    if (!me.user) { router.push('/login'); return; }
    setUser(me.user);
    const s = await fetch('/api/startups').then((r) => r.json());
    setStartups(s.startups ?? []);
    const se = await fetch('/api/sessions').then((r) => r.json());
    setSessions(se.sessions ?? []);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    setError(''); setBusy(true);
    try {
      const r = await fetch('/api/startups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        ...form,
        funding_ask_usd: form.funding_ask_usd ? Number(form.funding_ask_usd) : undefined,
        equity_offered_pct: form.equity_offered_pct ? Number(form.equity_offered_pct) : undefined,
      }) });
      const j = await r.json();
      if (!r.ok) { setError(j.error || 'Failed to create'); return; }
      setShowCreate(false);
      setForm({ name: '', tagline: '', stage: 'Pre-seed', sector: 'AI/ML', business_model: '', description: '', funding_ask_usd: '', equity_offered_pct: '' });
      await load();
    } catch { setError('Network error'); } finally { setBusy(false); }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  return (
    <div className="min-h-screen">
      <header className="border-b subtle-border sticky top-0 bg-[#0a0a0b]/80 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold"><span className="w-7 h-7 rounded-lg bg-emerald-500 grid place-items-center text-black text-sm font-black">V</span>VCroom</Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="muted hidden sm:block">{user?.email}</span>
            <button onClick={logout} className="btn btn-ghost text-sm">Log out</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="muted text-sm mt-1">Your startups, meetings and evaluations.</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">{showCreate ? 'Cancel' : '+ New startup'}</button>
        </div>

        {showCreate && (
          <div className="card p-6 mb-8 fade-up">
            <h2 className="font-semibold mb-4">Create a startup</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Tagline</label><input className="input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
              <div><label className="label">Stage</label><select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></div>
              <div><label className="label">Sector</label><select className="input" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></div>
              <div><label className="label">Business model</label><input className="input" value={form.business_model} onChange={(e) => setForm({ ...form, business_model: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Funding ask (USD)</label><input className="input" type="number" value={form.funding_ask_usd} onChange={(e) => setForm({ ...form, funding_ask_usd: e.target.value })} /></div>
                <div><label className="label">Equity offered %</label><input className="input" type="number" value={form.equity_offered_pct} onChange={(e) => setForm({ ...form, equity_offered_pct: e.target.value })} /></div>
              </div>
              <div className="md:col-span-2"><label className="label">Description</label><textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            {error && <div className="text-rose-400 text-sm mt-3">{error}</div>}
            <button onClick={create} disabled={busy || !form.name} className="btn btn-primary mt-4">{busy ? 'Creating…' : 'Create startup'}</button>
          </div>
        )}

        <h2 className="font-semibold mb-3">Your startups</h2>
        {startups.length === 0 ? (
          <div className="card p-10 text-center muted fade-up">No startups yet. Create one to run your first committee meeting.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {startups.map((s) => (
              <Link key={s.id} href={`/dashboard/startup/${s.id}`} className="card card-hover p-5 block">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs muted mt-1">{s.stage} · {s.sector}</div>
                  </div>
                  <span className="text-emerald-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <h2 className="font-semibold mb-3">Investor meetings</h2>
        {sessions.length === 0 ? (
          <div className="card p-8 text-center muted">No meetings yet.</div>
        ) : (
          <div className="space-y-2">
            {sessions.map((se) => (
              <Link key={se.id} href={`/dashboard/meeting/${se.id}`} className="card card-hover p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{se.startup_name}</div>
                  <div className="text-xs muted">{new Date(se.created_at).toLocaleString()}</div>
                </div>
                <span className={`badge ${se.status === 'completed' ? 'text-emerald-400 border-emerald-500/30' : 'text-amber-400 border-amber-500/30'}`}>{se.status}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

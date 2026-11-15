'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Startup { id: string; name: string; tagline?: string; stage?: string; sector?: string; business_model?: string; description?: string; funding_ask_usd?: number; equity_offered_pct?: number; created_at: string; }
interface Doc { id: string; name: string; type: string; created_at: string; }
interface Session { id: string; status: string; created_at: string; }

export default function StartupWorkspace({ id }: { id: string }) {
  const router = useRouter();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Startup>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extract, setExtract] = useState<{ slides: number; claims: number } | null>(null);
  const docInput = useRef<HTMLInputElement>(null);
  const deckInput = useRef<HTMLInputElement>(null);

  async function load() {
    const j = await fetch(`/api/startups/${id}`).then((r) => r.json());
    if (!j.startup) { router.push('/dashboard'); return; }
    setStartup(j.startup); setForm(j.startup);
    const d = await fetch(`/api/startups/${id}/documents`).then((r) => r.json());
    setDocs(d.documents ?? []);
    const s = await fetch(`/api/startups/${id}/sessions`).then((r) => r.json());
    setSessions(s.sessions ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/startups/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await r.json();
      if (!r.ok) { setError(j.error || 'Save failed'); return; }
      setEditing(false); setStartup(j.startup);
    } catch { setError('Network error'); } finally { setBusy(false); }
  }

  async function uploadDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append('file', f);
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/startups/${id}/documents`, { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) { setError(j.error || 'Upload failed'); }
      else setMessage('Document uploaded.');
      await load();
    } catch { setError('Network error'); } finally { setBusy(false); e.target.value = ''; }
  }

  async function uploadDeck(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append('file', f);
    setExtracting(true); setError(''); setExtract(null);
    try {
      const r = await fetch(`/api/startups/${id}/deck/extract`, { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) { setError(j.error || 'Extraction failed'); }
      else { setExtract({ slides: j.slides ?? 0, claims: j.claims ?? 0 }); setMessage(`Deck processed: ${j.slides} slides, ${j.claims} claims extracted.`); }
    } catch { setError('Network error'); } finally { setExtracting(false); e.target.value = ''; }
  }

  async function startMeeting() {
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/startups/${id}/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const j = await r.json();
      if (!r.ok) { setError(j.error || 'Could not start meeting'); return; }
      router.push(`/dashboard/meeting/${j.sessionId || j.session?.id}`);
    } catch { setError('Network error'); } finally { setBusy(false); }
  }

  if (!startup) return <div className="min-h-screen grid place-items-center muted">Loading…</div>;

  return (
    <div className="min-h-screen">
      <header className="border-b subtle-border sticky top-0 bg-[#0a0a0b]/80 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold"><span className="text-emerald-400">←</span> Dashboard</Link>
          <div className="flex items-center gap-3">
            <span className="badge">{startup.stage}</span>
            <button onClick={() => setEditing(!editing)} className="btn btn-ghost text-sm">{editing ? 'Close' : 'Edit'}</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10">
        {message && <div className="badge text-emerald-400 border-emerald-500/30 mb-4">{message}</div>}
        {error && <div className="text-rose-400 text-sm mb-4">{error}</div>}

        <div className="card p-6 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{startup.name}</h1>
          {startup.tagline && <p className="muted mt-1">{startup.tagline}</p>}
          {!editing ? (
            <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
              <div><span className="muted">Sector:</span> {startup.sector}</div>
              <div><span className="muted">Business model:</span> {startup.business_model || '—'}</div>
              <div><span className="muted">Funding ask:</span> {startup.funding_ask_usd ? `$${startup.funding_ask_usd.toLocaleString()}` : '—'}</div>
              <div><span className="muted">Equity offered:</span> {startup.equity_offered_pct ? `${startup.equity_offered_pct}%` : '—'}</div>
              {startup.description && <div className="md:col-span-2 muted leading-relaxed">{startup.description}</div>}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div><label className="label">Name</label><input className="input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Tagline</label><input className="input" value={form.tagline || ''} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
              <div><label className="label">Stage</label><input className="input" value={form.stage || ''} onChange={(e) => setForm({ ...form, stage: e.target.value })} /></div>
              <div><label className="label">Sector</label><input className="input" value={form.sector || ''} onChange={(e) => setForm({ ...form, sector: e.target.value })} /></div>
              <div><label className="label">Business model</label><input className="input" value={form.business_model || ''} onChange={(e) => setForm({ ...form, business_model: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Funding ask (USD)</label><input className="input" type="number" value={form.funding_ask_usd || ''} onChange={(e) => setForm({ ...form, funding_ask_usd: e.target.value ? Number(e.target.value) : undefined })} /></div>
                <div><label className="label">Equity %</label><input className="input" type="number" value={form.equity_offered_pct || ''} onChange={(e) => setForm({ ...form, equity_offered_pct: e.target.value ? Number(e.target.value) : undefined })} /></div>
              </div>
              <div className="md:col-span-2"><label className="label">Description</label><textarea className="input min-h-[80px]" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <button onClick={save} disabled={busy} className="btn btn-primary">{busy ? 'Saving…' : 'Save'}</button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-1">Pitch deck</h2>
            <p className="text-xs muted mb-4">Upload a PDF. We extract each slide and identify claims.</p>
            <input ref={deckInput} type="file" accept="application/pdf" className="hidden" onChange={uploadDeck} />
            <button onClick={() => deckInput.current?.click()} disabled={extracting} className="btn btn-outline w-full">{extracting ? 'Processing…' : 'Upload deck (PDF)'}</button>
            {extract && <div className="text-sm text-emerald-400 mt-3">{extract.slides} slides · {extract.claims} claims extracted</div>}
          </div>
          <div className="card p-6">
            <h2 className="font-semibold mb-1">Documents & financials</h2>
            <p className="text-xs muted mb-4">Financial statements, term sheets, supporting materials.</p>
            <input ref={docInput} type="file" className="hidden" onChange={uploadDoc} />
            <button onClick={() => docInput.current?.click()} disabled={busy} className="btn btn-outline w-full">Upload document</button>
            {docs.length > 0 && (
              <ul className="text-xs muted mt-3 space-y-1">
                {docs.map((d) => <li key={d.id}>📄 {d.name} <span className="text-emerald-400">({d.type})</span></li>)}
              </ul>
            )}
          </div>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Investor committee meeting</h2>
              <p className="text-xs muted mt-1">Four investors will challenge your pitch, one question at a time.</p>
            </div>
            <button onClick={startMeeting} disabled={busy} className="btn btn-primary">{busy ? 'Starting…' : 'Start meeting'}</button>
          </div>
        </div>

        <h2 className="font-semibold mb-3">Previous meetings</h2>
        {sessions.length === 0 ? <div className="card p-6 text-center muted text-sm">No meetings yet for this startup.</div> : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <Link key={s.id} href={`/dashboard/meeting/${s.id}`} className="card card-hover p-4 flex items-center justify-between">
                <span className="text-sm">{new Date(s.created_at).toLocaleString()}</span>
                <span className="badge text-xs">{s.status}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

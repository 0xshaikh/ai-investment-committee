'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Report { id: string; report_markdown?: string; report_json?: Record<string, unknown>; status: string; created_at: string; }

export default function ReportPage({ id }: { id: string }) {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');

  async function load() {
    const j = await fetch(`/api/sessions/${id}/report`).then((r) => r.json());
    if (!r_ok(j)) { setError(j.error || 'No report yet.'); router.push('/dashboard'); return; }
    setReport(j.report);
  }
  function r_ok(j: { error?: string }) { return !j.error; }
  useEffect(() => { load(); }, []);

  if (!report) return <div className="min-h-screen grid place-items-center muted">{error || 'Loading report…'}</div>;

  return (
    <div className="min-h-screen">
      <header className="border-b subtle-border sticky top-0 bg-[#0a0a0b]/80 backdrop-blur z-40">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold"><span className="text-emerald-400">←</span> Dashboard</Link>
          <div className="flex items-center gap-3">
            <span className="badge">{report.status}</span>
            <button onClick={() => window.print()} className="btn btn-ghost text-sm">Download PDF</button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-10">
        <div className="card p-8">
          <div className="text-xs muted uppercase tracking-wider mb-2">Investment Evaluation Report</div>
          <pre className="text-sm muted whitespace-pre-wrap leading-relaxed font-sans">{report.report_markdown || '(no markdown — see JSON)'}</pre>
        </div>
        <p className="text-[11px] muted text-center mt-6">Simulated assessment — not an investment offer or prediction of real investor decisions.</p>
      </main>
    </div>
  );
}

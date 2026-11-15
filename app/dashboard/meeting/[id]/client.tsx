'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Persona { id: string; name: string; role: string; }
interface Q { id: string; persona_id?: string; question: string; category?: string; sequence: number; status: string; }
interface A { id: string; question_id: string; answer_text?: string; }
interface SessionState { id: string; status: string; current_persona_id?: string; }
interface CommitteeDecision { decision: string; summary: string; biggest_risks_json: string[]; strongest_evidence_json: string[]; weakest_evidence_json: string[]; unanswered_questions_json: string[]; reconsider_conditions_json: string[]; agreement_json: string[]; disagreement_json: string[]; }
interface Report { id: string; report_markdown?: string; }

const VERDICT_COLOR: Record<string, string> = {
  YES: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  NO: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
  CONDITIONAL_YES: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  MORE_DILIGENCE: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10',
};

export default function MeetingRoom({ id }: { id: string }) {
  const router = useRouter();
  const [state, setState] = useState<SessionState | null>(null);
  const [startup, setStartup] = useState<{ name: string } | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<A[]>([]);
  const [decision, setDecision] = useState<CommitteeDecision | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [finished, setFinished] = useState(false);
  const recogRef = useRef<unknown>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function load() {
    const j = await fetch(`/api/sessions/${id}`).then((r) => r.json());
    if (!j.session) { router.push('/dashboard'); return; }
    setState(j.session); setStartup(j.startup);
    setPersonas(j.personas ?? []);
    setQuestions(j.questions ?? []);
    setAnswers(j.answers ?? []);
    setDecision(j.decision ?? null);
    setReport(j.report ?? null);
    if (j.session.status === 'completed') setFinished(true);
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    setVoiceSupported(typeof SR === 'function');
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [questions, answers]);

  const answeredIds = new Set(answers.map((a) => a.question_id));
  const current = [...questions].sort((a, b) => b.sequence - a.sequence).find((q) => q.status === 'asked' && !answeredIds.has(q.id));
  const personaOf = (pid?: string) => personas.find((p) => p.id === pid);

  async function submitAnswer() {
    if (!current || !answer.trim() || busy) return;
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/sessions/${id}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: current.id, answer }) });
      const j = await r.json();
      if (!r.ok) { setError(j.error || 'Could not submit answer'); return; }
      setAnswer('');
      if (j.type === 'finalize') { setDecision({ decision: j.decision, summary: '', biggest_risks_json: [], strongest_evidence_json: [], weakest_evidence_json: [], unanswered_questions_json: [], reconsider_conditions_json: [], agreement_json: [], disagreement_json: [] }); setFinished(true); await load(); return; }
      await load();
    } catch { setError('Network error'); } finally { setBusy(false); }
  }

  function startVoice() {
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (typeof SR !== 'function') return;
    const rec = new (SR as new () => unknown)() as { lang: string; interimResults: boolean; start: () => void; stop: () => void; onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
    rec.lang = 'en-US'; rec.interimResults = false;
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setAnswer((prev) => (prev ? prev + ' ' + t : t));
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recogRef.current = rec;
    setListening(true);
    rec.start();
  }

  if (!state) return <div className="min-h-screen grid place-items-center muted">Loading meeting…</div>;

  return (
    <div className="min-h-screen">
      <header className="border-b subtle-border sticky top-0 bg-[#0a0a0b]/80 backdrop-blur z-40">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href={`/dashboard/startup/${state.id ? state.id : ''}`} className="flex items-center gap-2 font-bold" onClick={() => router.push('/dashboard')}><span className="text-emerald-400">←</span> Dashboard</Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="muted">{startup?.name}</span>
            <span className="badge">{state.status}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <div className="text-center mb-6">
          <div className="eyebrow mb-1">Investor committee meeting</div>
          <h1 className="text-2xl font-bold tracking-tight">Answer one difficult question at a time.</h1>
          <p className="muted text-sm mt-2">Four investors challenge your pitch. Vague answers get follow-ups — not praise.</p>
        </div>

        {error && <div className="text-rose-400 text-sm mb-4 text-center">{error}</div>}

        <div className="space-y-4 mb-6">
          {[...questions].sort((a, b) => a.sequence - b.sequence).map((q) => {
            const p = personaOf(q.persona_id);
            const a = answers.find((x) => x.question_id === q.id);
            const isCurrent = current?.id === q.id;
            return (
              <div key={q.id} className={`card p-5 ${isCurrent ? 'border-emerald-500/50' : 'opacity-80'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge text-xs">{p?.role || 'Investor'}</span>
                  {q.category && <span className="text-[11px] muted">{q.category}</span>}
                  {q.status === 'asked' && !a && <span className="text-[11px] text-emerald-400">● asking</span>}
                </div>
                <div className="font-medium leading-relaxed">{q.question}</div>
                {a && (
                  <div className="mt-3 pl-4 border-l-2 border-emerald-500/40">
                    <div className="text-[11px] muted mb-1">You</div>
                    <div className="text-sm muted">{a.answer_text}</div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {!finished && current && (
          <div className="card p-5 border-emerald-500/40 fade-up">
            <div className="text-sm font-semibold mb-3">Your answer</div>
            <textarea className="input min-h-[100px]" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer honestly. Unsupported claims will be challenged." />
            <div className="flex items-center gap-3 mt-3">
              <button onClick={submitAnswer} disabled={busy || !answer.trim()} className="btn btn-primary">{busy ? 'Submitting…' : 'Submit answer'}</button>
              {voiceSupported ? (
                <button onClick={startVoice} disabled={listening} className={`btn btn-outline ${listening ? 'text-rose-400' : ''}`}>{listening ? 'Listening…' : '🎤 Voice'}</button>
              ) : (
                <span className="text-xs muted">Voice unavailable — text-only fallback</span>
              )}
            </div>
          </div>
        )}

        {finished && decision && (
          <div className="card p-7 text-center fade-up">
            <div className="text-xs muted uppercase tracking-wider mb-2">Committee decision</div>
            <div className={`inline-block px-4 py-1.5 rounded-lg border font-bold text-lg ${VERDICT_COLOR[decision.decision] || 'text-zinc-300'}`}>{decision.decision}</div>
            {report?.report_markdown && <pre className="text-left text-xs muted mt-5 whitespace-pre-wrap max-h-96 overflow-auto bg-black/30 p-4 rounded-lg">{report.report_markdown}</pre>}
            <div className="flex items-center justify-center gap-3 mt-6">
              <Link href={`/dashboard/report/${id}`} className="btn btn-primary">View full report</Link>
              <button onClick={() => router.push('/dashboard')} className="btn btn-outline">Back to dashboard</button>
            </div>
            <p className="text-[11px] muted mt-4">Simulated assessment — not an investment offer or prediction of real investor decisions.</p>
          </div>
        )}
      </main>
    </div>
  );
}

import Link from 'next/link';
import { FaqAccordion } from '@/components/FaqAccordion';
import HeroStatement from '@/components/HeroStatement';

const FEATURES = [
  { icon: '🎯', title: 'Adversarial questioning', desc: 'One difficult question at a time. Every vague answer gets challenged with a specific follow-up. No automatic praise.' },
  { icon: '🧠', title: 'Four investor personas', desc: 'A VC Partner, a CFO, a CTO and an Industry Specialist — each with a different thesis, risk tolerance and rejection criteria.' },
  { icon: '📋', title: 'Evidence ledger', desc: 'Every claim is classified: externally verified, founder-reported, document-supported, modelled, unverified, unknown or contradicted.' },
  { icon: '🔍', title: 'Market intelligence', desc: 'Claims are checked against external sources with URLs and dates. Unverifiable claims are labeled, never assumed.' },
  { icon: '⚖️', title: 'Committee decision', desc: 'YES, NO / PASS, CONDITIONAL YES or MORE DILIGENCE — based on evidence, not a universal score. Personas are allowed to disagree.' },
  { icon: '📄', title: '16-section report', desc: 'A professional evaluation report with a risk register, evidence ledger, investor verdicts and conditions for reconsideration.' },
];

const PERSONAS = [
  { name: 'Venture Capital Partner', focus: 'Venture-scale opportunity, TAM/SAM/SOM, growth, moat, exit', icon: '📈' },
  { name: 'Financial Investor / CFO', focus: 'Revenue quality, margins, CAC/LTV, burn, runway, valuation', icon: '💼' },
  { name: 'Technical Investor / CTO', focus: 'Architecture, tech moat, scalability, security, dependencies', icon: '🛠️' },
  { name: 'Industry Specialist', focus: 'Real problem, alternatives, willingness to pay, regulation', icon: '🏭' },
];

const STEPS = [
  { n: '01', title: 'Create your startup', desc: 'Tell the committee what you are building, your stage, sector and funding ask.' },
  { n: '02', title: 'Upload your pitch deck', desc: 'A PDF deck. We extract each slide, find claims and spot evidence gaps.' },
  { n: '03', title: 'Face the committee', desc: 'Answer difficult questions from four investors, by text or voice, one at a time.' },
  { n: '04', title: 'Get your evaluation', desc: 'Individual verdicts, a committee decision, and a downloadable report.' },
];

const PLANS = [
  { name: 'Free Trial', price: '$0', period: '/mo', feats: ['1 startup', '1 investor session', '1 pitch deck', 'Text-only meeting'], cta: 'Start free' },
  { name: 'Founder', price: '$29', period: '/mo', feats: ['3 startups', '5 investor sessions', 'Pitch deck + financials', 'Voice input', 'PDF report download'], cta: 'Get Founder', popular: true },
  { name: 'Pro', price: '$79', period: '/mo', feats: ['Unlimited startups', 'Unlimited sessions', 'Full evidence ledger', 'Market intelligence', 'All 4 investor personas', 'PDF report download'], cta: 'Get Pro' },
  { name: 'Business', price: '$199', period: '/mo', feats: ['Everything in Pro', 'Admin panel', 'Team seats', 'API access', 'Priority support'], cta: 'Get Business' },
];

const FAQS = [
  { q: 'Is this a real investor or an AI?', a: 'Neither. The committee is four fictional investor archetypes powered by AI. They do not impersonate real investors and no real firm has evaluated your startup. The output is a simulated assessment.' },
  { q: 'Will the AI just tell me my idea is great?', a: 'No. The product is designed to challenge. It looks for the biggest unanswered risk and asks one difficult question at a time. Vague answers get follow-ups, not praise. Weak startups are rejected.' },
  { q: 'Does it invent valuations or funding offers?', a: 'No. Investment amounts, valuations, revenue and customer numbers are never invented. If information is insufficient, the report states that a valuation cannot be determined.' },
  { q: 'Can I use voice?', a: 'Yes — voice input and playback work in browsers that support the Web Speech API. A text-only fallback is always available. We never claim voice works when the browser does not support it.' },
  { q: 'How long does a meeting take?', a: 'A full committee meeting is typically 10–20 minutes: each investor asks a focused set of questions plus follow-ups based on your answers.' },
  { q: 'What do I get at the end?', a: 'A 16-section professional evaluation report: executive summary, market assessment, competitor analysis, financial and founder assessment, risk register, evidence ledger, investor-by-investor verdicts, committee decision and next steps.' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur border-b subtle-border bg-[#0a0a0b]/80">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="w-7 h-7 rounded-lg bg-emerald-500 grid place-items-center text-black text-sm font-black">V</span>
            VCroom<span className="accent">.app</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm muted">
            <Link href="#how" className="hover:text-white transition">How it works</Link>
            <Link href="#committee" className="hover:text-white transition">The committee</Link>
            <Link href="#features" className="hover:text-white transition">Features</Link>
            <Link href="#pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/disclaimer" className="hover:text-white transition">Disclaimer</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-ghost text-sm">Log in</Link>
            <Link href="/signup" className="btn btn-primary text-sm">Start free</Link>
          </div>
        </div>
      </header>

      <HeroStatement />

      <section id="how" className="border-b subtle-border">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="text-center mb-12">
            <div className="eyebrow mb-2">How it works</div>
            <h2 className="h-section">From pitch deck to committee verdict</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="card card-hover p-6">
                <div className="text-emerald-400 font-mono text-sm mb-3">{s.n}</div>
                <div className="font-semibold mb-1.5">{s.title}</div>
                <div className="text-sm muted">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="committee" className="border-b subtle-border">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="text-center mb-12">
            <div className="eyebrow mb-2">The committee</div>
            <h2 className="h-section">Four investors, four different theses</h2>
            <p className="mt-3 muted max-w-xl mx-auto">Each persona has its own priorities, risk tolerance, questioning strategy and rejection criteria — so they can legitimately disagree about your startup.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PERSONAS.map((p) => (
              <div key={p.name} className="card card-hover p-6">
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className="font-semibold mb-1">{p.name}</div>
                <div className="text-sm muted">{p.focus}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs muted text-center">The personas are fictional simulations. They do not impersonate real investors and do not imply that any actual firm has evaluated your company.</p>
        </div>
      </section>

      <section id="features" className="border-b subtle-border">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="text-center mb-12">
            <div className="eyebrow mb-2">Features</div>
            <h2 className="h-section">Evidence-driven, not motivational</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-hover p-6">
                <div className="text-2xl mb-3">{f.icon}</div>
                <div className="font-semibold mb-1.5">{f.title}</div>
                <div className="text-sm muted">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b subtle-border">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="eyebrow mb-2">Sample evaluation</div>
              <h2 className="h-section mb-4">What the committee returns</h2>
              <p className="muted mb-6">A 16-section professional report: executive summary, market and competitor assessment, customer validation, product and technology review, financial and founder assessment, a risk register, the evidence ledger, investor-by-investor verdicts, the committee decision and conditions for reconsideration.</p>
              <ul className="space-y-2 text-sm">
                {['Individual investor verdicts (they can disagree)', 'A single committee decision: YES / NO / CONDITIONAL YES / MORE DILIGENCE', 'Every claim classified by how it is supported', 'Critical unanswered questions and next steps', 'Downloadable as PDF'].map((x) => (
                  <li key={x} className="flex gap-2"><span className="text-emerald-400">✓</span><span>{x}</span></li>
                ))}
              </ul>
            </div>
            <div className="card p-6 font-mono text-xs leading-relaxed">
              <div className="text-emerald-400 mb-3">// evaluation_report.md</div>
              <div className="muted"># Investment Evaluation Report</div>
              <div className="muted">Committee decision: <span className="text-amber-400">CONDITIONAL YES</span></div>
              <div className="mt-3">## 11. Evidence ledger</div>
              <div className="muted">- "We have 100 customers" — <span className="text-rose-400">contradicted</span></div>
              <div className="muted">- "12 paying customers, MRR $4.2k" — <span className="text-emerald-400">founder-reported</span></div>
              <div className="muted">- "TAM $50B" — <span className="text-amber-400">unverified</span></div>
              <div className="mt-3">## 12. Investor verdicts</div>
              <div className="muted">- VC Partner: <span className="text-amber-400">CONDITIONAL YES</span></div>
              <div className="muted">- CFO: <span className="text-rose-400">PASS</span></div>
              <div className="muted">- CTO: <span className="text-indigo-400">MORE DILIGENCE</span></div>
              <div className="muted">- Industry Specialist: <span className="text-amber-400">CONDITIONAL YES</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b subtle-border">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="text-center mb-12">
            <div className="eyebrow mb-2">Pricing</div>
            <h2 className="h-section">Simple, configurable plans</h2>
            <p className="mt-3 muted">Plans are configurable by the admin panel and shown here as defaults. Payment processing activates only when real credentials are configured.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((p) => (
              <div key={p.name} className={`card p-6 relative ${p.popular ? 'border-emerald-500/50' : ''}`}>
                {p.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 badge bg-emerald-500 text-black border-0">Popular</div>}
                <div className="font-semibold mb-1">{p.name}</div>
                <div className="text-2xl font-bold mb-1">{p.price}<span className="text-sm muted font-normal">{p.period}</span></div>
                <ul className="text-sm muted space-y-1.5 my-4">
                  {p.feats.map((f) => <li key={f} className="flex gap-2"><span className="text-emerald-400">✓</span>{f}</li>)}
                </ul>
                <Link href="/signup" className={`btn w-full ${p.popular ? 'btn-primary' : 'btn-outline'}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
          <p className="text-xs muted text-center mt-6">Prices shown are configurable defaults, not verified market pricing. No simulated or real transaction is recorded without payment credentials.</p>
        </div>
      </section>

      <section id="faq" className="border-b subtle-border">
        <div className="max-w-3xl mx-auto px-5 py-20">
          <div className="text-center mb-10">
            <div className="eyebrow mb-2">FAQ</div>
            <h2 className="h-section">Common questions</h2>
          </div>
          <FaqAccordion items={FAQS} />
        </div>
      </section>

      <section>
        <div className="max-w-4xl mx-auto px-5 py-24 text-center">
          <h2 className="h-section mb-4">Face the hard questions now — not in the real room.</h2>
          <p className="muted mb-8 max-w-xl mx-auto">Founders who have been challenged here answer better in front of real investors. Start your first simulated meeting free.</p>
          <Link href="/signup" className="btn btn-primary text-base px-8 py-3">Start free</Link>
        </div>
      </section>

      <footer className="border-t subtle-border">
        <div className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="font-bold mb-2">VCroom.app</div>
            <p className="muted text-xs">AI Investment Committee — a simulated investor meeting for startup founders.</p>
          </div>
          <div>
            <div className="font-semibold mb-2 text-xs uppercase tracking-wider muted">Product</div>
            <ul className="space-y-1.5 muted">
              <li><Link href="/login" className="hover:text-white">Log in</Link></li>
              <li><Link href="/signup" className="hover:text-white">Sign up</Link></li>
              <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2 text-xs uppercase tracking-wider muted">Legal</div>
            <ul className="space-y-1.5 muted">
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white">Disclaimer</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2 text-xs uppercase tracking-wider muted">Company</div>
            <ul className="space-y-1.5 muted">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t subtle-border py-4 text-center text-xs muted">© 2026 VCroom.app · Simulated assessment — not an investment offer.</div>
      </footer>
    </div>
  );
}

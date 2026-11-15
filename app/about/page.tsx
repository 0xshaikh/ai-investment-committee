import Link from 'next/link';

const SHELL = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">
    <header className="border-b subtle-border">
      <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold"><span className="w-7 h-7 rounded-lg bg-emerald-500 grid place-items-center text-black text-sm font-black">V</span>VCroom</Link>
        <Link href="/" className="btn btn-ghost text-sm">← Home</Link>
      </div>
    </header>
    <main className="max-w-3xl mx-auto px-5 py-12 prose prose-invert">{children}</main>
  </div>
);

export default function AboutPage() {
  return SHELL({
    children: (
      <>
        <h1 className="text-2xl font-bold mb-4">About VCroom</h1>
        <div className="card p-6 space-y-4 muted leading-relaxed">
          <p>VCroom is an AI Investment Committee — a simulated investor meeting platform for startup founders. It runs a committee of four fictional investor archetypes (a Venture Capital Partner, a Financial Investor / CFO, a Technical Investor / CTO and an Industry Specialist) that pressure-tests a founder&apos;s pitch with difficult, evidence-driven questions before the founder approaches real investors.</p>
          <p>The committee is deliberately skeptical. It looks for the biggest unanswered risk, asks one hard question at a time, challenges vague answers with specific follow-ups, and classifies every claim by how well it is supported. Weak startups get rejected — the product never automatically praises a founder.</p>
          <p>Everything is a simulation. The personas are fictional archetypes, not real investors. No real firm has evaluated your startup, and the report you receive is a simulated assessment — not an investment offer or a prediction of what real investors will do.</p>
        </div>
      </>
    ),
  });
}

import Link from 'next/link';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b subtle-border">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold"><span className="w-7 h-7 rounded-lg bg-emerald-500 grid place-items-center text-black text-sm font-black">V</span>VCroom</Link>
          <Link href="/" className="btn btn-ghost text-sm">← Home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-2xl font-bold mb-2">Disclaimer</h1>
        <div className="card p-6 space-y-4 muted leading-relaxed text-sm">
          <p><strong className="text-white">VCroom is a simulated assessment, not real investment advice.</strong></p>
          <p>The investor committee is composed of four fictional AI archetypes — a Venture Capital Partner, a Financial Investor / CFO, a Technical Investor / CTO and an Industry Specialist. They are not real investors, do not represent any real firm, and no real investor has evaluated your startup.</p>
          <p>The evaluation report, individual verdicts and committee decision are generated for practice and preparation. They are not an investment offer, a term sheet, a funding commitment, financial advice, or a prediction of what any real investor will decide.</p>
          <p>The platform never fabricates investment amounts, valuations, revenue, customer counts or commitments. Where information is insufficient, the report explicitly states that a valuation or investment terms cannot be determined.</p>
          <p>Nothing on this platform constitutes legal, tax or financial advice. Consult a qualified professional before making financial decisions.</p>
        </div>
      </main>
    </div>
  );
}

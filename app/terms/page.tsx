import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b subtle-border">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold"><span className="w-7 h-7 rounded-lg bg-emerald-500 grid place-items-center text-black text-sm font-black">V</span>VCroom</Link>
          <Link href="/" className="btn btn-ghost text-sm">← Home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
        <p className="text-xs muted mb-6">Last updated: 2026</p>
        <div className="space-y-4 muted leading-relaxed text-sm">
          <section><h2 className="font-semibold text-white mb-1">1. Simulated assessment</h2><p>VCroom provides a simulated investor meeting and a simulated investment evaluation. The investor personas are fictional archetypes. Nothing on this platform is an investment offer, financial advice, or a prediction of what real investors will decide. Do not rely on it as such.</p></section>
          <section><h2 className="font-semibold text-white mb-1">2. Your content</h2><p>You retain ownership of the startup information, pitch decks and documents you upload. You grant us a limited license to process that content to provide the service (extraction, analysis, report generation). Do not upload content you do not have the right to share.</p></section>
          <section><h2 className="font-semibold text-white mb-1">3. No fabricated figures</h2><p>The platform never invents investment amounts, valuations, revenue or customer counts. Where information is insufficient, the report states that a value cannot be determined. You are responsible for the accuracy of what you tell the committee.</p></section>
          <section><h2 className="font-semibold text-white mb-1">4. Acceptable use</h2><p>Do not use the service to mislead investors, to launder money, or for any unlawful purpose. Do not attempt to access another user&apos;s private data.</p></section>
          <section><h2 className="font-semibold text-white mb-1">5. No warranty</h2><p>The service is provided &quot;as is&quot; without warranties of any kind. We are not liable for decisions you make based on a simulated evaluation.</p></section>
        </div>
      </main>
    </div>
  );
}

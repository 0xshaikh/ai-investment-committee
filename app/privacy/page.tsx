import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b subtle-border">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold"><span className="w-7 h-7 rounded-lg bg-emerald-500 grid place-items-center text-black text-sm font-black">V</span>VCroom</Link>
          <Link href="/" className="btn btn-ghost text-sm">← Home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-xs muted mb-6">Last updated: 2026</p>
        <div className="space-y-4 muted leading-relaxed text-sm">
          <section><h2 className="font-semibold text-white mb-1">1. What we collect</h2><p>Your account details (name, email), the startup information you enter, the pitch decks and documents you upload, and the meeting transcript (questions, answers, evidence, verdicts, reports) you generate.</p></section>
          <section><h2 className="font-semibold text-white mb-1">2. How we use it</h2><p>To provide the service: run your investor meeting, generate your evaluation report, enforce usage limits and entitlements, and keep audit logs. We never expose your private startup data to other users.</p></section>
          <section><h2 className="font-semibold text-white mb-1">3. AI providers</h2><p>When you run a meeting, relevant startup content is sent to the configured AI provider to generate questions, evidence classification and the report. API keys are held server-side and never exposed to the browser.</p></section>
          <section><h2 className="font-semibold text-white mb-1">4. Data isolation</h2><p>Row Level Security and server-side ownership checks ensure you can only ever access your own startups, sessions and reports. Other users cannot read your data.</p></section>
          <section><h2 className="font-semibold text-white mb-1">5. Your rights</h2><p>You may delete your account and your data at any time. Contact support@vcroom.app to request deletion.</p></section>
        </div>
      </main>
    </div>
  );
}

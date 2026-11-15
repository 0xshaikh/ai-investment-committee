import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b subtle-border">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold"><span className="w-7 h-7 rounded-lg bg-emerald-500 grid place-items-center text-black text-sm font-black">V</span>VCroom</Link>
          <Link href="/" className="btn btn-ghost text-sm">← Home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-2xl font-bold mb-4">Contact</h1>
        <div className="card p-6 muted leading-relaxed">
          <p>Questions, feedback or feature requests? We would love to hear from you.</p>
          <p className="mt-3">Email: <a href="mailto:support@vcroom.app" className="text-emerald-400 hover:underline">support@vcroom.app</a></p>
          <p className="mt-2 text-sm">We typically respond within 1–2 business days.</p>
        </div>
      </main>
    </div>
  );
}

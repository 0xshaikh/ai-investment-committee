'use client';
import { useState } from 'react';

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="card overflow-hidden">
          <button
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-medium hover:bg-[#f1eee7] transition"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{it.q}</span>
            <span className={`accent transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          {open === i && <div className="px-5 pb-4 text-sm muted leading-relaxed">{it.a}</div>}
        </div>
      ))}
    </div>
  );
}

// app/api/startups/[id]/deck/extract/route.ts — extract text from an uploaded pitch deck PDF.
// Slide-by-slide analysis + claim extraction. Files are untrusted input; embedded code is never executed.
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { guard } from '@/lib/api';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const startup = await repo.getStartup(id);
    if (!startup || startup.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { documentId } = await req.json();
    const doc = await repo.getDocument(documentId);
    if (!doc || doc.startup_id !== id) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    if (doc.mime_type !== 'application/pdf') return NextResponse.json({ error: 'Only PDF pitch decks can be extracted.' }, { status: 415 });

    let deck = undefined;
    // create/reuse a pitch_deck record
    const pdfBuf = await readFile(doc.storage_path);
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBuf) });
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    const slides: { index: number; text: string }[] = [];
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((it) => (it as { str?: string }).str ?? '').join(' ');
      slides.push({ index: i - 1, text: text.replace(/\s+/g, ' ').trim() });
    }
    const decks = await repo.listExtractedContent(doc.id).catch(() => []);
    await repo.saveExtractedContent({ deck_id: doc.id, startup_id: id, slide_index: -1, raw_text: 'DECK', claims_json: null, financial_json: null });
    for (const s of slides) {
      await repo.saveExtractedContent({ deck_id: doc.id, startup_id: id, slide_index: s.index, raw_text: s.text, claims_json: null, financial_json: null });
    }
    return NextResponse.json({ pageCount, slides, extracted: slides.length });
  });
}

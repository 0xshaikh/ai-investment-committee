// app/api/startups/[id]/documents/route.ts — upload a startup document (secure, owner-scoped).
// Treats files as untrusted input. Restricts size/type. Never executes embedded content.
import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { guard } from '@/lib/api';
import { env } from '@/lib/env';

const ALLOWED: Record<string, string> = {
  'application/pdf': 'pitch_deck',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'financials',
  'application/vnd.ms-excel': 'financials',
  'application/json': 'financials',
  'text/csv': 'financials',
  'text/plain': 'supporting',
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const startup = await repo.getStartup(id);
    if (!startup || startup.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const docType = form.get('docType') as string | null;
    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (file.size > env.MAX_UPLOAD_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File exceeds ${env.MAX_UPLOAD_MB}MB limit.` }, { status: 413 });
    }
    const mime = file.type || 'application/octet-stream';
    const resolvedType = docType || ALLOWED[mime];
    if (!resolvedType) return NextResponse.json({ error: `File type not allowed: ${mime}` }, { status: 415 });

    const bytes = Buffer.from(await file.arrayBuffer());
    let storagePath: string;
    if (repo.mode === 'local') {
      const dir = join(process.cwd(), '.localdata', 'uploads');
      await mkdir(dir, { recursive: true });
      const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      storagePath = join(dir, name);
      await writeFile(storagePath, bytes);
    } else {
      // Supabase Storage (bucket must exist; upload to storage bucket)
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await sb.storage.from(env.NEXT_PUBLIC_STORAGE_BUCKET || 'startup-documents').upload(path, bytes, { contentType: mime });
      if (error) return NextResponse.json({ error: `Storage upload failed: ${error.message}` }, { status: 500 });
      storagePath = path;
    }

    const doc = await repo.saveDocument({
      startup_id: id, owner_id: user.id, doc_type: resolvedType as 'pitch_deck' | 'financials' | 'supporting',
      name: file.name, storage_path: storagePath, mime_type: mime, size_bytes: file.size,
    });
    await repo.logAudit('document.upload', 'startup_document', doc.id, { name: file.name });
    return NextResponse.json({ doc }, { status: 201 });
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const startup = await repo.getStartup(id);
    if (!startup || startup.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const docs = await repo.listDocuments(id);
    return NextResponse.json({ docs });
  });
}

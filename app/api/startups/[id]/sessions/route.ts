// app/api/startups/[id]/sessions/route.ts — create + start an investor meeting
import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/api';
import { aiConfigured } from '@/lib/env';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const startup = await repo.getStartup(id);
    if (!startup || startup.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!aiConfigured()) {
      return NextResponse.json({ error: 'No AI provider configured. Set OPENROUTER_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY to run a meeting.' }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    void body;
    const session = await repo.createSession({ startup_id: id, owner_id: user.id, status: 'active', progress_json: {} });
    const personas = await repo.listPersonas();
    const { startMeeting } = await import('@/lib/engine/orchestrator');
    await startMeeting(repo, session, personas);
    await repo.logAudit('session.start', 'investor_session', session.id);
    return NextResponse.json({ sessionId: session.id }, { status: 201 });
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const startup = await repo.getStartup(id);
    if (!startup || startup.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const sessions = await repo.listSessionsByStartup(id);
    return NextResponse.json({ sessions });
  });
}

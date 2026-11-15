// app/api/sessions/[id]/finalize/route.ts — end the meeting early and generate the report
import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/api';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const session = await repo.getSession(id);
    if (!session || session.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const startup = await repo.getStartup(session.startup_id);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    const personas = await repo.listPersonas();
    const { finalizeSession } = await import('@/lib/engine/orchestrator');
    const { decision, report } = await finalizeSession(repo, session, personas, startup);
    return NextResponse.json({ decision: decision.decision, reportId: report.id });
  });
}

// app/api/sessions/[id]/answer/route.ts — submit a founder answer, get the next question/finalize
import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/api';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const session = await repo.getSession(id);
    if (!session || session.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (session.status !== 'active') return NextResponse.json({ error: 'Session is not active.' }, { status: 400 });

    const { questionId, answer } = await req.json();
    if (!questionId || !answer?.trim()) return NextResponse.json({ error: 'questionId and answer are required.' }, { status: 400 });

    const startup = await repo.getStartup(session.startup_id);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    const personas = await repo.listPersonas();
    const { answerQuestion } = await import('@/lib/engine/orchestrator');
    const result = await answerQuestion(repo, session, personas, startup, questionId, answer.trim());

    if (result.type === 'finalize') {
      const { finalizeSession } = await import('@/lib/engine/orchestrator');
      const { decision, report } = await finalizeSession(repo, session, personas, startup);
      return NextResponse.json({ type: 'finalize', decision: decision.decision, reportId: report.id });
    }
    return NextResponse.json({ type: result.type, text: result.text, contradiction: result.contradiction ?? false, persona: result.persona.role });
  });
}

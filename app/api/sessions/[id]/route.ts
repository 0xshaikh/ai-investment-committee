// app/api/sessions/[id]/route.ts — full meeting state (owner only)
import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const session = await repo.getSession(id);
    if (!session || session.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const [startup, personas, messages, questions, answers, followups, evidence, sources, verdicts, decision, report, findings] = await Promise.all([
      repo.getStartup(session.startup_id),
      repo.listPersonas(),
      repo.listMessages(id),
      repo.listQuestions(id),
      repo.listAnswers(id),
      repo.listFollowUps(id),
      repo.listEvidence(id),
      repo.listSources(id),
      repo.listVerdicts(id),
      repo.getDecision(id),
      repo.getReport(id),
      repo.listFindings(id),
    ]);
    return NextResponse.json({ session, startup, personas, messages, questions, answers, followups, evidence, sources, verdicts, decision, report, findings });
  });
}

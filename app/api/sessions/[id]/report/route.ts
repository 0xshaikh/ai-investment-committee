// app/api/sessions/[id]/report/route.ts — fetch the generated report (owner only)
import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const session = await repo.getSession(id);
    if (!session || session.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const report = await repo.getReport(id);
    if (!report) return NextResponse.json({ error: 'No report yet.' }, { status: 404 });
    return NextResponse.json({ report });
  });
}

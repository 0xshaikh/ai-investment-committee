// app/api/sessions/route.ts — list the user's investor sessions
import { NextResponse } from 'next/server';
import { guard } from '@/lib/api';

export async function GET() {
  return guard(async (user) => {
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const sessions = await repo.listSessions(user.id);
    // attach startup names
    const withStartup = await Promise.all(sessions.map(async (s) => {
      const st = await repo.getStartup(s.startup_id);
      return { ...s, startup_name: st?.name ?? '—' };
    }));
    return NextResponse.json({ sessions: withStartup });
  });
}

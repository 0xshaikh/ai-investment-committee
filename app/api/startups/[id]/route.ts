// app/api/startups/[id]/route.ts — get + update a startup (owner only)
import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const startup = await repo.getStartup(id);
    if (!startup || startup.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ startup });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return guard(async (user) => {
    const { id } = await params;
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const existing = await repo.getStartup(id);
    if (!existing || existing.owner_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const body = await req.json();
    const startup = await repo.updateStartup(id, {
      name: body.name, tagline: body.tagline, stage: body.stage, sector: body.sector,
      business_model: body.business_model, description: body.description, website: body.website,
      funding_ask_usd: body.funding_ask_usd != null ? Number(body.funding_ask_usd) : undefined,
      equity_offered_pct: body.equity_offered_pct != null ? Number(body.equity_offered_pct) : undefined,
    });
    await repo.logAudit('startup.update', 'startup', id);
    return NextResponse.json({ startup });
  });
}

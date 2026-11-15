// app/api/startups/route.ts — create + list startups
import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/api';

export async function GET() {
  return guard(async (user) => {
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const startups = await repo.listStartups(user.id);
    return NextResponse.json({ startups });
  });
}

export async function POST(req: NextRequest) {
  return guard(async (user) => {
    const { getRepo } = await import('@/lib/db');
    const repo = getRepo();
    const body = await req.json();
    const name = (body.name ?? '').trim();
    if (!name) return NextResponse.json({ error: 'Startup name is required.' }, { status: 400 });
    const startup = await repo.createStartup({
      owner_id: user.id,
      name,
      tagline: body.tagline,
      stage: body.stage,
      sector: body.sector,
      business_model: body.business_model,
      description: body.description,
      website: body.website,
      country: body.country,
      currency: body.currency || 'USD',
      funding_ask_usd: body.funding_ask_usd != null ? Number(body.funding_ask_usd) : undefined,
      equity_offered_pct: body.equity_offered_pct != null ? Number(body.equity_offered_pct) : undefined,
    });
    await repo.logAudit('startup.create', 'startup', startup.id);
    return NextResponse.json({ startup }, { status: 201 });
  });
}

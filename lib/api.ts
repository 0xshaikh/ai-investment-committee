// lib/api.ts — API route helpers (server only).
import { NextResponse } from 'next/server';
import { requireUser } from './auth';
import type { Profile } from './db';

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
export function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

/** Guard a route handler: resolves the authenticated user or returns 401. */
export async function guard(handler: (user: Profile, ...rest: unknown[]) => Promise<NextResponse>) {
  try {
    const { user } = await requireUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return await handler(user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

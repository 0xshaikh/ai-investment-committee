// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRepo } from '@/lib/db';
import { setLocalToken } from '@/lib/auth';
import { supabaseConfigured } from '@/lib/env';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  const repo = getRepo();
  const { user, error, token } = await repo.signIn(email, password);
  if (error || !user) return NextResponse.json({ error: error ?? 'Sign in failed' }, { status: 401 });
  await setLocalToken(token ?? null);
  return NextResponse.json({ user, mode: supabaseConfigured() ? 'supabase' : 'local' });
}

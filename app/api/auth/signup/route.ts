// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRepo } from '@/lib/db';
import { setLocalToken } from '@/lib/auth';
import { supabaseConfigured } from '@/lib/env';

export async function POST(req: NextRequest) {
  const { email, password, fullName } = await req.json();
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: 'Email and a password of at least 6 characters are required.' }, { status: 400 });
  }
  const repo = getRepo();
  const { user, error, token } = await repo.signUp(email, password, fullName);
  if (error || !user) return NextResponse.json({ error: error ?? 'Sign up failed' }, { status: 400 });
  await setLocalToken(token ?? null);
  return NextResponse.json({ user, mode: supabaseConfigured() ? 'supabase' : 'local' }, { status: 201 });
}

// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { getRepo } from '@/lib/db';
import { setLocalToken } from '@/lib/auth';

export async function POST() {
  await getRepo().signOut();
  await setLocalToken(null);
  return NextResponse.json({ ok: true });
}

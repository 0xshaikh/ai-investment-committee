// lib/auth.ts — server-side auth bridge. Works in both Supabase and local-dev modes.
// In local mode the token lives in an httpOnly cookie; in Supabase mode the SSR client handles it.
import { cookies } from 'next/headers';
import { getRepo, isLocalMode, type Profile } from './db';
import { supabaseConfigured } from './env';

export const TOKEN_COOKIE = 'vcroom_token';

export interface AuthContext {
  repo: ReturnType<typeof getRepo>;
  user: Profile | null;
  mode: 'supabase' | 'local';
}

/** Resolve the repo + current user for a request. Call at the top of route handlers / server components. */
export async function auth(): Promise<AuthContext> {
  const repo = getRepo();
  if (supabaseConfigured()) {
    const user = await repo.getSessionUser();
    return { repo, user, mode: 'supabase' };
  }
  // local mode: read token cookie, set it on the adapter
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value ?? null;
  repo.setToken?.(token);
  const user = await repo.getSessionUser();
  return { repo, user, mode: 'local' };
}

/** Require an authenticated user or throw (for protected routes). */
export async function requireUser(): Promise<AuthContext> {
  const ctx = await auth();
  if (!ctx.user) throw new Error('Unauthorized');
  return ctx;
}

/** Persist a local-mode token to the httpOnly cookie. No-op in Supabase mode. */
export async function setLocalToken(token: string | null): Promise<void> {
  if (supabaseConfigured()) return;
  const store = await cookies();
  if (token) store.set(TOKEN_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30, path: '/' });
  else store.delete(TOKEN_COOKIE);
}

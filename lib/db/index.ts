// lib/db/index.ts — picks the active data adapter. Supabase when configured, local dev otherwise.
import { supabaseConfigured } from '../env';
import { supabaseRepo } from './supabase';
import { localRepo } from './local';
import type { Repo } from './repo';

export function getRepo(): Repo {
  return supabaseConfigured() ? supabaseRepo : localRepo;
}

export function isLocalMode(): boolean {
  return !supabaseConfigured();
}

export { localRepo, supabaseRepo };
export type { Repo };
export * from './types';

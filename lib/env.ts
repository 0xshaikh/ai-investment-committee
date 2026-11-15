// lib/env.ts — validated environment access. Never expose server secrets to frontend.
export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() { return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''; },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''; },
  get SUPABASE_SERVICE_ROLE_KEY() { return process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''; },
  get OPENROUTER_API_KEY() { return process.env.OPENROUTER_API_KEY ?? ''; },
  get OPENROUTER_MODEL() { return process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet'; },
  get GEMINI_API_KEY() { return process.env.GEMINI_API_KEY ?? ''; },
  get GEMINI_MODEL() { return process.env.GEMINI_MODEL || 'gemini-2.0-flash'; },
  get GROQ_API_KEY() { return process.env.GROQ_API_KEY ?? ''; },
  get GROQ_MODEL() { return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'; },
  get TAVILY_API_KEY() { return process.env.TAVILY_API_KEY ?? ''; },
  get SERPER_API_KEY() { return process.env.SERPER_API_KEY ?? ''; },
  get NEXT_PUBLIC_STORAGE_BUCKET() { return process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'startup-documents'; },
  get MAX_UPLOAD_MB() { return Number(process.env.MAX_UPLOAD_MB || 20); },
};

export function supabaseConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function aiConfigured(): boolean {
  return Boolean(env.OPENROUTER_API_KEY || env.GEMINI_API_KEY || env.GROQ_API_KEY);
}

/** Which AI provider is active, for display/health. */
export function activeProvider(): { name: string; model: string; configured: boolean } {
  if (env.OPENROUTER_API_KEY) return { name: 'openrouter', model: env.OPENROUTER_MODEL, configured: true };
  if (env.GEMINI_API_KEY) return { name: 'gemini', model: env.GEMINI_MODEL, configured: true };
  if (env.GROQ_API_KEY) return { name: 'groq', model: env.GROQ_MODEL, configured: true };
  return { name: 'none', model: '', configured: false };
}

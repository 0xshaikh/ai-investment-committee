// lib/engine/market.ts — Market Intelligence Engine (spec §4.2).
// External web research ONLY when a search provider is configured. Every claim gets a source URL + date.
// If no provider or no evidence found, the claim is explicitly labeled unverified/unknown. Nothing is fabricated.
import type { Repo } from '../db';
import { claimToSearchQuery, classifyClaim, recordEvidence } from './evidence';
import { env } from '../env';

export interface ResearchResult {
  claim: string;
  found: boolean;
  url?: string;
  title?: string;
  snippet?: string;
  note: string;
}

async function searchWeb(query: string): Promise<{ url: string; title: string; snippet: string } | null> {
  if (env.TAVILY_API_KEY) {
    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: env.TAVILY_API_KEY, query, max_results: 3, search_depth: 'basic' }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const top = j.results?.[0];
    return top ? { url: top.url, title: top.title, snippet: top.content } : null;
  }
  if (env.SERPER_API_KEY) {
    const r = await fetch('https://google.serper.dev/search', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-KEY': env.SERPER_API_KEY },
      body: JSON.stringify({ q: query, num: 3 }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const top = j.organic?.[0];
    return top ? { url: top.link, title: top.title, snippet: top.snippet } : null;
  }
  return null; // no search provider configured
}

/**
 * Research a set of claims, record sources + evidence. Returns per-claim results.
 * Never fabricates: with no provider, every claim is recorded as unverified with an explicit note.
 */
export async function researchMarket(
  repo: Repo, sessionId: string, startupId: string | undefined, claims: string[],
): Promise<ResearchResult[]> {
  const results: ResearchResult[] = [];
  const hasProvider = Boolean(env.TAVILY_API_KEY || env.SERPER_API_KEY);
  const noteNoProvider = 'No search provider configured (set TAVILY_API_KEY or SERPER_API_KEY). Market claims marked unverified, not assumed true.';

  for (const claim of claims.slice(0, 10)) {
    const q = claimToSearchQuery(claim);
    let found: { url: string; title: string; snippet: string } | null = null;
    if (hasProvider) {
      try { found = await searchWeb(q); } catch { found = null; }
    }
    if (found) {
      await repo.addSource({ session_id: sessionId, startup_id: startupId, claim_id: claim.slice(0, 40), url: found.url, title: found.title, source_type: 'web', access_outcome: 'retrieved', evidence_tier: 'secondary' });
      const assessment = classifyClaim(claim, { hasExternalSource: true });
      await recordEvidence(repo, sessionId, startupId, claim, assessment);
      results.push({ claim, found: true, url: found.url, title: found.title, snippet: found.snippet, note: 'Verified via external source.' });
    } else {
      const assessment = hasProvider
        ? classifyClaim(claim, {})
        : classifyClaim(claim, { explicitlyUnknown: true });
      await recordEvidence(repo, sessionId, startupId, claim, assessment);
      results.push({ claim, found: false, note: hasProvider ? 'Search returned no verifiable source. Marked unverified.' : noteNoProvider });
    }
  }
  return results;
}

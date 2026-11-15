// lib/ai/provider.ts — SERVER ONLY. Unified AI call with retry, timeout, structured output, usage.
// Precedence: OpenRouter > Gemini > Groq. No keys are exposed to the client.
import { env, activeProvider } from '../env';

export interface AIResult {
  text: string;
  json: unknown | null;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
}

export interface AICallOptions {
  system?: string;
  /** force JSON output (structured). Parsed into `json`. */
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
  /** ms. Default 60_000. */
  timeoutMs?: number;
  /** extra retries after the first attempt. Default 1. */
  retries?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Robust JSON extraction: strips markdown fences, finds first {..} or [..]. */
export function extractJson(raw: string): unknown {
  const t = raw.trim();
  if (t.startsWith('{') || t.startsWith('[')) {
    try { return JSON.parse(t); } catch { /* fallthrough */ }
  }
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try { return JSON.parse(fence[1].trim()); } catch { /* fallthrough */ }
  }
  const obj = t.match(/\{[\s\S]*\}/);
  if (obj) { try { return JSON.parse(obj[0]); } catch { /* fallthrough */ } }
  const arr = t.match(/\[[\s\S]*\]/);
  if (arr) { try { return JSON.parse(arr[0]); } catch { /* fallthrough */ } }
  return null;
}

/** Rough USD cost per 1M tokens by provider family (used only for tracking, not billing). */
function costPerMio(provider: string): { in: number; out: number } {
  // generic blended estimates — overridden per provider below
  if (provider === 'gemini') return { in: 0.5, out: 1.5 };
  if (provider === 'groq') return { in: 0.3, out: 0.6 };
  return { in: 3.0, out: 15.0 }; // openrouter default (model-dependent)
}

export async function callAI(userPrompt: string, opts: AICallOptions = {}): Promise<AIResult> {
  const provider = activeProvider();
  if (!provider.configured) {
    throw new Error('No AI provider configured. Set OPENROUTER_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY.');
  }
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const retries = opts.retries ?? 1;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        let res: AIResult;
        if (provider.name === 'gemini') res = await callGemini(userPrompt, opts, provider.model, controller.signal);
        else if (provider.name === 'groq') res = await callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY, env.GROQ_MODEL, userPrompt, opts, controller.signal);
        else res = await callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL, userPrompt, opts, controller.signal);
        clearTimeout(timer);
        return res;
      } finally {
        clearTimeout(timer);
      }
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await sleep(1000 * (attempt + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function callGemini(prompt: string, opts: AICallOptions, model: string, signal: AbortSignal): Promise<AIResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
  const genConfig: Record<string, unknown> = { temperature: opts.temperature ?? 0.3, maxOutputTokens: opts.maxTokens ?? 4096 };
  if (opts.jsonMode) genConfig.responseMimeType = 'application/json';
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: genConfig,
  };
  if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  const usage = data?.usageMetadata ?? {};
  return {
    text, json: opts.jsonMode ? extractJson(text) : null,
    provider: 'gemini', model,
    promptTokens: usage.promptTokenCount ?? 0, completionTokens: usage.candidatesTokenCount ?? 0,
    costUsd: ((usage.promptTokenCount ?? 0) / 1e6) * costPerMio('gemini').in + ((usage.candidatesTokenCount ?? 0) / 1e6) * costPerMio('gemini').out,
  };
}

async function callOpenAICompatible(url: string, key: string, model: string, prompt: string, opts: AICallOptions, signal: AbortSignal): Promise<AIResult> {
  const messages: { role: string; content: string }[] = [];
  if (opts.system) messages.push({ role: 'system', content: opts.system });
  messages.push({ role: 'user', content: prompt });
  const body: Record<string, unknown> = {
    model, messages, temperature: opts.temperature ?? 0.3, max_tokens: opts.maxTokens ?? 4096,
  };
  if (opts.jsonMode) body.response_format = { type: 'json_object' };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body), signal,
  });
  if (!r.ok) throw new Error(`${model} ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  const u = data?.usage ?? {};
  const cost = costPerMio(model.includes('gemini') ? 'gemini' : 'openrouter');
  return {
    text, json: opts.jsonMode ? extractJson(text) : null,
    provider: 'openrouter', model,
    promptTokens: u.prompt_tokens ?? 0, completionTokens: u.completion_tokens ?? 0,
    costUsd: ((u.prompt_tokens ?? 0) / 1e6) * cost.in + ((u.completion_tokens ?? 0) / 1e6) * cost.out,
  };
}

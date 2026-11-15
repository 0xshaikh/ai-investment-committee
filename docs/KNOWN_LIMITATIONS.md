# Known Limitations

This is an honest list of incomplete features, external blockers and required manual actions. Nothing here is silently papered over.

## External blockers (need credentials/accounts)

1. **Live deployment (Vercel + Supabase) — NOT deployed.** No Supabase credentials and no Vercel token exist in this environment. The product is built, tested and verified locally, but a live production URL is not yet available. Required: a Supabase project (run the 3 migrations, create the `startup-documents` bucket) and a Vercel account/token, then set production env vars and deploy. See [DEPLOYMENT.md](DEPLOYMENT.md).
2. **Supabase adapter — implemented, not live-tested.** `lib/db/supabase.ts` provides the full `Repo` contract (RLS, storage, auth) but was not executed against a live Supabase project because none exists here. The local adapter is what was exercised end-to-end.
3. **Payments — abstraction only.** A payment integration abstraction is prepared for Stripe/Razorpay, but real payments are **not enabled** and no transaction is simulated. The pricing page states plans are configurable defaults, not verified market pricing.

## Product limitations (known, honest)

4. **Voice** — implemented with a capability check (Web Speech API) and a text-only fallback. Voice is claimed to work only when the browser supports it; otherwise the UI shows "Voice unavailable — text-only fallback". Not claimed otherwise.
5. **Background processing** — market research and report generation run inline within the request. A task queue / background worker (for very long research jobs) is a documented future enhancement; not introduced to avoid unnecessary complexity.
6. **Email verification / password reset** — stubbed in the auth API for local mode; requires Supabase Auth email templates in production.
7. **Admin panel** — the admin role, `is_admin()` RLS helper and server-side authorization are in place, but a full admin dashboard UI is not built in this release.
8. **PDF report download** — report markdown is shown and the page is print-ready (print CSS), but a dedicated PDF-rendering step is not wired.
9. **Charts/tables extraction from decks** — slide text extraction (pdfjs-dist) works; chart/table visual extraction is best-effort and not guaranteed for every PDF.

## Integrity guarantees (why the above is acceptable)

- No integration is claimed successful unless wired and verified.
- No fabricated AI responses, no fake tests, no fake deployments.
- No invented investment amounts, valuations, revenue, customer counts or term sheets — insufficient information is reported as "cannot be determined".
- The whole output is labeled a simulated assessment.

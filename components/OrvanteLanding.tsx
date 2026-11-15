'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const HERO_PHOTO = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/7dc8b8f3-4ccb-4599-8ce4-7f7c7881bad9.webp';
const CAP_PHOTO = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/a9d3641f-d629-46e5-8d2d-5f75386b803d.webp';
const Q_PHOTO = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/9340eb08-877d-4d08-91fb-b70754541d98.webp';
const PORTRAIT_PHOTO = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/addecc7d-666f-4342-8290-ed7f7cbbffd6.webp';

/* Fictional investor personas (clearly labeled — not real people). */
const PERSONAS = [
  { initials: 'VC', name: 'Venture Partner' },
  { initials: 'CF', name: 'Financial Investor' },
  { initials: 'CT', name: 'Technical Investor' },
  { initials: 'IS', name: 'Industry Specialist' },
];

/* Real, verifiable product facts — no invented numbers. */
const REAL_FACTS = {
  personas: 4,
  reportSections: 16,
  unitTests: 32,
  dbTables: 23,
};

const MANIFESTO =
  'A committee that challenges every claim, questions every assumption, and never invents what you did not show. Every verdict is evidence-backed. Every rejection is honest.';

function mix(a: [number, number, number], b: [number, number, number], t: number) {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
const GREY: [number, number, number] = [111, 111, 111];
const WHITE: [number, number, number] = [244, 244, 244];

function Hero() {
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (photoRef.current) {
          const y = Math.min(window.scrollY * 0.12, 220);
          photoRef.current.style.transform = `translateY(${y}px)`;
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="orv-hero relative overflow-hidden font-ui">
      <div className="max-w-[1440px] mx-auto px-5 md:px-[57px] pt-6 pb-0 relative">
        {/* Nav */}
        <nav className="orv-nav-enter flex items-center justify-between">
          <div className="orv-pill flex items-center rounded-full p-1 shadow-sm">
            <span className="rounded-full bg-black text-white px-4 py-2 text-[13px] font-medium">Home</span>
            <a href="#how" className="px-4 py-2 text-[13px] text-neutral-700 hover:text-black transition">Studio</a>
            <a href="#committee" className="px-4 py-2 text-[13px] text-neutral-700 hover:text-black transition">Committee</a>
            <a href="#pricing" className="px-4 py-2 text-[13px] text-neutral-700 hover:text-black transition">Pricing</a>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-[12px] text-neutral-600">Sunday / 15.11.26</span>
            <Link href="/signup" className="bg-black text-white text-[13px] font-medium px-5 py-2.5 rounded-full hover:opacity-85 transition">Start free ↗</Link>
          </div>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 pt-10 md:pt-16">
          {/* Left: title + copy */}
          <div className="relative z-10 pb-8">
            <h1 className="font-display text-[clamp(4rem,9vw,7.5rem)] leading-[0.86] tracking-[-0.06em] font-semibold text-black">
              <span className="orv-title-line block"><span className="orv-rise" style={{ animationDelay: '.05s' }}>DUE</span></span>
              <span className="orv-title-line block"><span className="orv-rise" style={{ animationDelay: '.12s' }}>DILIGENCE</span></span>
            </h1>
            <div className="orv-rise mt-10" style={{ animationDelay: '.25s' }}>
              <div className="text-[12px] tracking-[0.2em] uppercase text-neutral-500">● (COMMITTEE)</div>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-700 max-w-[360px]">
                A simulated investor meeting for startup founders.
                <br />
                Four AI investors. One difficult question at a time.
              </p>
              <Link href="/signup" className="orv-card-lift inline-flex items-center gap-2 bg-black text-white text-[14px] font-medium px-6 py-3 rounded-full mt-5 hover:opacity-85">
                Book a meeting ↗
              </Link>
            </div>
          </div>

          {/* Right: stats frame + true growth + out now */}
          <div className="relative">
            <div className="orv-rise grid grid-cols-2 gap-4" style={{ animationDelay: '.3s' }}>
              {/* Stats frame */}
              <div className="bg-[#cdcdcd] rounded-2xl p-6">
                <div className="text-4xl font-semibold font-display text-black">4</div>
                <div className="text-[12px] text-neutral-600 mt-1">Investor personas</div>
                <div className="flex gap-2 mt-5">
                  {PERSONAS.map((p) => (
                    <span key={p.initials} className="w-8 h-8 rounded-full bg-black text-white text-[10px] font-bold grid place-items-center">{p.initials}</span>
                  ))}
                </div>
                <Link href="/signup" className="inline-flex items-center gap-1.5 bg-white text-black text-[12px] font-medium px-4 py-2 rounded-full mt-5 hover:opacity-85">
                  Start a meeting <span aria-hidden>↗</span>
                </Link>
              </div>
              {/* Cap photo card */}
              <div className="rounded-2xl overflow-hidden relative bg-[#111] orv-card-lift">
                <div className="orv-img-zoom-wrap relative">
                  <div className="orv-zoom absolute inset-0" style={{ backgroundImage: `url(${CAP_PHOTO})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-3 left-4 text-[11px] text-white/90">Studio Feed · 01/06</div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-3xl font-semibold font-display">{REAL_FACTS.unitTests}</div>
                    <div className="text-[11px] text-white/80">Unit tests passing</div>
                  </div>
                </div>
              </div>
            </div>

            {/* True growth pill */}
            <div className="orv-rise inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium text-neutral-700 mt-6" style={{ animationDelay: '.38s' }}>
              <span className="w-4 h-4 rounded-full bg-black text-white grid place-items-center text-[9px]">✓</span>
              Simulated assessment — not an investment offer
            </div>

            <div className="orv-rise mt-8" style={{ animationDelay: '.45s' }}>
              <div className="text-right">
                <div className="text-[12px] text-neutral-600">We are ready</div>
                <div className="text-2xl font-display font-semibold text-black">● for your first meeting</div>
              </div>

              {/* Out now card */}
              <div className="orv-img-zoom-wrap mt-5 relative rounded-2xl overflow-hidden orv-card-lift">
                <div className="orv-zoom h-[196px]" style={{ backgroundImage: `url(${Q_PHOTO})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute top-4 left-4 text-white text-[12px]">
                  <div className="opacity-80">Out now</div>
                  <div className="font-semibold">v1.0 · [2026]</div>
                </div>
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 grid place-items-center">
                  <span className="orv-arrow text-black" aria-hidden>↗</span>
                </div>
                <div className="absolute bottom-4 left-4 right-16 h-[2px] bg-white/25 rounded">
                  <div className="h-full w-[35%] bg-white rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero photo with VCROOM plate (no fictional wordmarks, no real logos) */}
        <div ref={photoRef} className="orv-photo-enter relative mx-auto md:mx-0 md:absolute md:left-[30%] md:top-[-86px] md:w-[764px] max-w-full md:max-w-[764px] md:h-[1024px] overflow-hidden">
          <div className="orv-photo-mask absolute inset-0" style={{ backgroundImage: `url(${HERO_PHOTO})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          {/* Brand plate — VCROOM (our brand, not Orvante) */}
          <div className="orv-plate hidden md:flex items-center justify-between rounded-2xl px-6 py-4 text-white absolute" style={{ left: '25%', top: '51%', transform: 'translate(-50%,-50%)', width: '47%' }}>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-sm bg-white" />
              <span className="font-display text-[22px] tracking-[0.14em]">VCROOM</span>
            </div>
            <span className="text-[16px] leading-none opacity-80">≡</span>
          </div>
        </div>
      </div>

      {/* Black bar */}
      <div className="relative z-10 bg-black text-white mt-0">
        <div className="max-w-[1440px] mx-auto px-5 md:px-[57px] h-[64px] flex items-center justify-between font-display text-[14px] tracking-[0.08em]">
          <span className="text-neutral-500">EST 2026</span>
          <a href="#statement" className="flex items-center gap-3">
            <span>SCROLL DOWN</span>
            <span className="w-7 h-7 rounded-full border border-white/30 grid place-items-center text-[12px]">↓</span>
          </a>
          <a href="https://github.com/0xshaikh/ai-investment-committee" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-white transition">OPEN SOURCE ↗</a>
        </div>
      </div>
    </section>
  );
}

function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const words = MANIFESTO.split(' ');

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when section top at viewport bottom, 1 when section middle at viewport centre
      const start = vh;
      const end = vh * 0.35;
      const p = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      const n = words.length;
      const filled = p * n;
      wordRefs.current.forEach((w, i) => {
        if (!w) return;
        const t = Math.min(1, Math.max(0, (filled - i) / 3)); // 3-word soft edge
        w.style.color = mix(GREY, WHITE, t);
      });
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="statement" className="orv-ink font-ui">
      <div className="max-w-[1440px] mx-auto px-5 md:px-[57px] py-28 md:py-40">
        <p
          ref={ref}
          className="font-display text-[clamp(1.6rem,3.6vw,3.4rem)] leading-[1.33] tracking-[-0.028em] max-w-[830px] mx-auto text-center"
        >
          {words.map((w, i) => (
            <span key={i} ref={(el) => { wordRefs.current[i] = el; }} className="orv-word">{w}{' '}</span>
          ))}
        </p>
        <p className="text-[15px] leading-relaxed text-neutral-300 max-w-[560px] mx-auto text-center mt-10">
          From pitch deck to evidence-backed verdict.
          <br />
          <span className="text-neutral-500">Built for founders who want to be challenged before the real room.</span>
        </p>
      </div>
    </section>
  );
}

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}</span>;
}

function TrustPanel() {
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="orv-ink font-ui">
      <div className="max-w-[1440px] mx-auto px-5 md:px-[57px] pb-24">
        <div ref={ref} className="orv-panel relative p-6 md:p-10">
          {/* frosted tiles */}
          <div className="orv-frost absolute top-6 left-6 w-11 h-11 rounded-xl grid place-items-center text-black text-xl">✳</div>
          <div className="orv-frost hidden md:grid absolute top-16 left-32 w-11 h-11 rounded-xl grid-cols-2 gap-1 p-3">
            <span className="bg-black rounded-full" /><span className="bg-black rounded-full" /><span className="bg-black rounded-full" /><span className="bg-black rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.05] tracking-[-0.03em]">
                A committee that challenges
                <br />every assumption
              </h2>
              <p className="text-[14px] leading-relaxed text-neutral-400 max-w-[380px] mt-6">
                Four fictional investors run a simulated meeting that tests your claims, flags unsupported numbers and
                tells you what to fix — before you face real investors.
              </p>
            </div>

            <div className={`grid sm:grid-cols-2 gap-4 transition-opacity duration-500 ${shown ? 'opacity-100' : 'opacity-0'}`}>
              {/* Avatar card — real personas, not real faces */}
              <div className="orv-card orv-card-lift bg-[#d6d6d6] text-black p-6">
                <div className="grid grid-cols-2 gap-2">
                  {PERSONAS.map((p, i) => (
                    <span key={p.initials} className="orv-avatar-pop w-12 h-12 rounded-full bg-neutral-700 text-white text-[12px] font-bold grid place-items-center" style={{ animationDelay: `${i * 90}ms` }}>
                      {p.initials}
                    </span>
                  ))}
                </div>
                <div className="text-4xl font-display font-semibold mt-5"><CountUp target={REAL_FACTS.personas} /></div>
                <div className="text-[12px] text-neutral-600">Investor personas (fictional)</div>
              </div>
              {/* Award card — no fake awards */}
              <div className="orv-card orv-card-lift bg-[#262626] p-6">
                <div className="text-4xl font-display font-semibold text-white"><CountUp target={REAL_FACTS.reportSections} /></div>
                <div className="text-[12px] text-neutral-400 mt-1">Report sections per evaluation</div>
                <div className="mt-6 inline-flex items-center gap-2 border border-emerald-400/40 rounded-full px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase text-emerald-300">
                  <span aria-hidden>🏅</span> Evidence-driven committee
                </div>
                <p className="text-[11px] text-neutral-500 mt-3">Every verdict is explained and every number is sourced.</p>
              </div>
            </div>
          </div>

          {/* Portrait card */}
          <div className="orv-card orv-card-lift hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 w-[200px] h-[340px] overflow-hidden">
            <div className="orv-zoom h-full" style={{ backgroundImage: `url(${PORTRAIT_PHOTO})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OrvanteLanding() {
  return (
    <>
      <Hero />
      <Statement />
      <TrustPanel />
    </>
  );
}

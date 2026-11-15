'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/** A person seen from behind wearing a sign plate on their back. */
function PlateFigure() {
  return (
    <div className="hero-glow relative rounded-full">
      <svg viewBox="0 0 320 460" className="w-full max-w-[300px] mx-auto block" aria-hidden="true">
        {/* legs */}
        <rect x="128" y="368" width="24" height="72" rx="12" fill="#17171a" />
        <rect x="168" y="368" width="24" height="72" rx="12" fill="#17171a" />
        {/* arms */}
        <rect x="76" y="238" width="24" height="112" rx="12" fill="#17171a" />
        <rect x="220" y="238" width="24" height="112" rx="12" fill="#17171a" />
        {/* torso from behind */}
        <path d="M118 222 L202 222 L224 396 L96 396 Z" fill="#17171a" stroke="#26262b" strokeWidth="2" />
        {/* head */}
        <circle cx="160" cy="178" r="32" fill="#17171a" stroke="#26262b" strokeWidth="2" />
        {/* plate on the back */}
        <g transform="translate(160, 300)">
          <line x1="-92" y1="-60" x2="-64" y2="-92" stroke="#26262b" strokeWidth="7" />
          <line x1="92" y1="-60" x2="64" y2="-92" stroke="#26262b" strokeWidth="7" />
          <rect x="-96" y="-80" width="192" height="152" rx="18" fill="#0a0a0b" stroke="#10b981" strokeOpacity="0.45" strokeWidth="1.5" />
          <text y="-6" textAnchor="middle" fill="#fafafa" fontSize="30" fontWeight="800" letterSpacing="3">VCROOM</text>
          <text y="22" textAnchor="middle" fill="#a1a1aa" fontSize="10" letterSpacing="1.5">AI INVESTMENT COMMITTEE</text>
        </g>
        {/* ground shadow */}
        <ellipse cx="160" cy="446" rx="72" ry="8" fill="#ffffff" opacity="0.06" />
      </svg>
    </div>
  );
}

/** Big statement whose words fill to white as the user scrolls. */
function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const vh = window.innerHeight;
      const start = vh * 0.95; // top of section near viewport bottom -> 0
      const end = vh * 0.3;    // section scrolled to upper third -> 100
      const p = Math.min(1, Math.max(0, (start - top) / (start - end)));
      setFill(Math.round(p * 100));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return (
    <section className="border-b subtle-border">
      <div className="max-w-5xl mx-auto px-5 py-24 md:py-32 text-center">
        <div className="eyebrow mb-4">The committee</div>
        <p
          ref={ref}
          className="statement-fill text-[clamp(1.8rem,4.5vw,3.4rem)] font-bold leading-[1.15] tracking-tight"
          style={{ ['--fill' as string]: `${fill}%` }}
        >
          Prepare for the investor who will challenge every assumption.
        </p>
        <p className="mt-6 text-lg muted max-w-2xl mx-auto">
          Four fictional investors — a VC Partner, a CFO, a CTO and an Industry Specialist — pressure-test your pitch with
          difficult, evidence-driven questions before you face the real room.
        </p>
      </div>
    </section>
  );
}

/** Count-up that runs when the panel scrolls into view. */
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const dur = 1100;
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

const REAL_FACTS = [
  { target: 4, label: 'Investor personas' },
  { target: 16, label: 'Report sections' },
  { target: 32, label: 'Unit tests passing' },
  { target: 23, label: 'Database tables' },
];

const PERSONAS = [
  { initials: 'VC', name: 'Venture Partner' },
  { initials: 'CF', name: 'Financial Investor' },
  { initials: 'CT', name: 'Technical Investor' },
  { initials: 'IS', name: 'Industry Specialist' },
];

/** Trust panel: counters and avatars animate in when it appears. */
function TrustPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setShown(true); obs.disconnect(); }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-b subtle-border">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="text-center mb-8">
          <div className="eyebrow mb-2">What you are working with</div>
          <p className="muted text-sm">Real, verifiable facts about the product — not marketing numbers.</p>
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-opacity duration-500 ${shown ? 'opacity-100' : 'opacity-0'}`}>
          {REAL_FACTS.map((f, i) => (
            <div key={f.label} className={`trust-card p-6 text-center rise rise-${i + 1}`}>
              <div className="text-4xl font-bold tracking-tight">
                <CountUp target={f.target} />
              </div>
              <div className="mt-1 text-sm muted">{f.label}</div>
            </div>
          ))}
        </div>
        <div className={`mt-6 flex flex-wrap items-center justify-center gap-3 transition-opacity duration-500 delay-150 ${shown ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs muted mr-1">The committee, fictional and clearly labeled:</span>
          {PERSONAS.map((p, i) => (
            <div key={p.initials} className={`rise rise-${i + 1} flex items-center gap-2 trust-card pl-1 pr-3 py-1`}>
              <span className="avatar-ring w-8 h-8 rounded-full grid place-items-center text-[11px] font-bold bg-[#17171a] text-emerald-400">
                {p.initials}
              </span>
              <span className="text-xs muted">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HeroStatement() {
  return (
    <>
      <section className="grid-lines border-b subtle-border relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 pt-20 pb-12 md:pt-28 md:pb-16 text-center">
          <div className="inline-flex items-center gap-2 badge mb-8 accent border-emerald-500/30 bg-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" /> AI Investment Committee
          </div>
          <h1 className="h-display max-w-3xl mx-auto">
            Face the hardest questions <span className="text-emerald-400">before the real room.</span>
          </h1>
          <p className="mt-6 text-lg muted max-w-2xl mx-auto">
            Upload your pitch deck. Answer one difficult question at a time. Get a simulated committee verdict
            that tells you exactly what to fix before you approach real investors.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/signup" className="btn btn-primary text-base px-6 py-3">Start your first meeting</Link>
            <Link href="#how" className="btn btn-outline text-base px-6 py-3">See how it works</Link>
          </div>
          <p className="mt-4 text-xs muted">Free to start · No credit card · Simulated assessment, not an investment offer</p>
          <div className="mt-10">
            <PlateFigure />
          </div>
        </div>
      </section>
      <Statement />
      <TrustPanel />
    </>
  );
}

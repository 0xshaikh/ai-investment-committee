'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

// Luminance source: 2x2 sheet of four hands on pure white (from the reference spec).
const SHEET =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_025250_100df7b8-31fd-4614-aa4a-c1b7d5b6b273.png&w=1600&q=85';

// Slices of the sheet [fx, fy, fw, fh] (fractions of sheet width/height).
const LA: [number, number, number, number] = [0, 0.06, 0.47, 0.4];
const RA: [number, number, number, number] = [0.53, 0.06, 0.47, 0.4];
const LB: [number, number, number, number] = [0, 0.55, 0.47, 0.4];
const RB: [number, number, number, number] = [0.53, 0.55, 0.47, 0.4];

const LEVELS = [0, 0.26, 0.52, 0.78, 1];
const LOOP = 20; // seconds
const DOT_COLOR = '#14110e';

const hash = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const mixAt = (t: number, on: number, off: number, dur: number) =>
  smooth(on, on + dur, t) * (1 - smooth(off, off + dur, t));

const PERSONA_ROW = [
  { label: 'Venture Partner', glyph: 'vc' },
  { label: 'CFO', glyph: 'cf' },
  { label: 'CTO', glyph: 'ct' },
  { label: 'Industry Specialist', glyph: 'is' },
] as const;

function PersonaGlyph({ glyph }: { glyph: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (glyph === 'vc')
    return (
      <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true">
        <path d="M1.5 15.5 L6 10 L9 13 L15.5 4.5" {...p} />
        <path d="M11 4.5 H15.5 V9" {...p} />
      </svg>
    );
  if (glyph === 'cf')
    return (
      <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true">
        <path d="M2.5 15.5 V8 M8.5 15.5 V4.5 M14.5 15.5 V2" {...p} />
        <path d="M1 15.5 H16" {...p} />
      </svg>
    );
  if (glyph === 'ct')
    return (
      <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true">
        <rect x="4.5" y="4.5" width="8" height="8" rx="1" {...p} />
        <path d="M6.5 4.5 V1.5 M10.5 4.5 V1.5 M6.5 15.5 V12.5 M10.5 15.5 V12.5 M4.5 6.5 H1.5 M4.5 10.5 H1.5 M15.5 6.5 H12.5 M15.5 10.5 H12.5" {...p} />
      </svg>
    );
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="6.5" {...p} />
      <circle cx="8.5" cy="8.5" r="3" {...p} />
      <circle cx="8.5" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function KindredHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img: HTMLImageElement | null = null;
    let loaded = false;
    let raf = 0;
    let t0 = 0;
    let W = 0, H = 0, DPR = 1, step = 6, rowStep = 12, cols = 1, rows = 1, R = 3;
    let tiles: Record<string, HTMLCanvasElement> = {};
    let fA: HTMLCanvasElement, fB: HTMLCanvasElement;
    let fAx: CanvasRenderingContext2D, fBx: CanvasRenderingContext2D;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const SRC_W = 1600;
    const SRC_H = 905;

    const loadSheet = () =>
      new Promise<void>((resolve) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = () => {
          img = im;
          resolve();
        };
        im.onerror = () => resolve();
        im.src = SHEET;
      });

    const makeTile = ([fx, fy, fw, fh]: [number, number, number, number]) => {
      const c = document.createElement('canvas');
      const tw = 420;
      const th = Math.round((tw * (fh * SRC_H)) / (fw * SRC_W));
      c.width = tw;
      c.height = th;
      const cx = c.getContext('2d');
      if (cx && img) {
        cx.imageSmoothingEnabled = true;
        cx.imageSmoothingQuality = 'high';
        cx.drawImage(img, fx * SRC_W, fy * SRC_H, fw * SRC_W, fh * SRC_H, 0, 0, tw, th);
      }
      return c;
    };

    const resize = () => {
      const rect = section.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      step = Math.max(5, W / 205);
      rowStep = step * 2.05;
      cols = Math.ceil(W / step);
      rows = Math.ceil(H / rowStep);
      R = step * 0.46;
      fA = document.createElement('canvas');
      fA.width = cols;
      fA.height = rows;
      fB = document.createElement('canvas');
      fB.width = cols;
      fB.height = rows;
      fAx = fA.getContext('2d', { willReadFrequently: true })!;
      fBx = fB.getContext('2d', { willReadFrequently: true })!;
    };

    const handTransform = (hand: 0 | 1, t: number) => {
      const portrait = H > W;
      const hw = W * (portrait ? 0.66 : 0.53);
      const hh = hw * (0.4 * 1520) / (0.47 * 2688);
      const cy = H * (portrait ? 0.66 : 0.54);
      const a = (2 * Math.PI * t) / LOOP;
      const ph = hand === 0 ? 0 : Math.PI;
      const reach = (0.035 * Math.sin(a + ph) + 0.012 * Math.sin(2 * a + 1.3 + ph)) * W;
      const scale = 1 + 0.07 * Math.sin(a + 0.9 + ph);
      const rot = (hand === 0 ? 1 : -1) * 0.045 * Math.sin(a + 2.1 + ph);
      const x = hand === 0 ? reach - W * 0.045 : W - hw + W * 0.045 - reach;
      return { hw, hh, cy, x, scale, rot };
    };

    const drawTileInField = (fctx: CanvasRenderingContext2D, tile: HTMLCanvasElement, tr: ReturnType<typeof handTransform>, left: boolean) => {
      fctx.save();
      fctx.scale(cols / W, rows / H);
      const px = left ? tr.x : tr.x + tr.hw;
      const py = tr.cy;
      fctx.translate(px, py);
      fctx.rotate(tr.rot);
      fctx.scale(tr.scale, tr.scale);
      fctx.translate(-px, -py);
      fctx.drawImage(tile, tr.x, tr.cy - tr.hh / 2, tr.hw, tr.hh);
      fctx.restore();
    };

    const render = (tt: number) => {
      if (!loaded) return;
      const t = reduced ? 0 : ((tt % LOOP) + LOOP) % LOOP;
      const mL = mixAt(t, 6.2, 14.6, 1.6);
      const mR = mixAt(t, 2.4, 10.4, 1.6);
      const tick = Math.floor(t * 7);
      const trL = handTransform(0, t);
      const trR = handTransform(1, t);

      // Draw both poses into their fields.
      fAx.fillStyle = '#fff';
      fAx.fillRect(0, 0, cols, rows);
      drawTileInField(fAx, tiles.LA, trL, true);
      drawTileInField(fAx, tiles.RA, trR, false);
      fBx.fillStyle = '#fff';
      fBx.fillRect(0, 0, cols, rows);
      drawTileInField(fBx, tiles.LB, trL, true);
      drawTileInField(fBx, tiles.RB, trR, false);

      const dA = fAx.getImageData(0, 0, cols, rows).data;
      const dB = fBx.getImageData(0, 0, cols, rows).data;
      const portrait = H > W;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = DOT_COLOR;
      for (let j = 0; j < rows; j++) {
        let shift = 0;
        if (hash(j, tick) > 0.965) shift = Math.round((hash(tick, j) - 0.5) * 8);
        const y = (j + 0.5) * rowStep;
        for (let i = 0; i < cols; i++) {
          const si = clamp(i - shift, 0, cols - 1);
          const seed = 0.55 * hash(i, j) + 0.45 * hash(j * 3.1, 7.7);
          const m = si < cols / 2 ? mL : mR;
          const useB = seed < m;
          const idx = (j * cols + si) * 4;
          const lum = (useB ? dB[idx] : dA[idx]) / 255;
          let v = clamp((1 - lum - 0.16) / 0.42, 0, 1);
          if (v <= 0) continue;

          v *= 0.86 + 0.14 * Math.sin(t * 3.2 + seed * 40);

          const cx = Math.abs((i + 0.5) / cols - 0.5);
          v *= smooth(0.035, 0.11, cx);

          const ex = cx / (portrait ? 0.44 : 0.2);
          const ey = (y / H - (portrait ? 0.33 : 0.385)) / 0.085;
          v *= smooth(0.85, 1.25, Math.hypot(ex, ey));

          if (m > 0.001 && m < 0.999 && Math.abs(seed - m) < 0.12) {
            v *= Math.abs(seed - m) / 0.12;
            if (hash(i + tick, j) <= 0.4) v *= 0.3;
          }
          if (v <= 0) continue;

          let level = 0;
          for (let li = LEVELS.length - 1; li >= 0; li--) {
            if (v >= LEVELS[li] - 0.13) { level = li; break; }
          }
          if (level === 0) continue;
          const rad = R * (level === 1 ? 0.38 : LEVELS[level]);
          ctx.beginPath();
          ctx.arc((i + 0.5) * step, y, rad, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    };

    const frame = (now: number) => {
      render((now - t0) / 1000);
      raf = requestAnimationFrame(frame);
    };

    loadSheet().then(() => {
      loaded = !!img;
      if (!loaded) return;
      tiles = { LA: makeTile(LA), RA: makeTile(RA), LB: makeTile(LB), RB: makeTile(RB) };
      resize();
      if (reduced) {
        render(0);
      } else {
        t0 = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });

    const ro = new ResizeObserver(() => {
      if (loaded) resize();
    });
    ro.observe(section);

    // Deterministic recorder hook (spec requirement).
    (window as unknown as Record<string, unknown>).__render = render;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="kc-hero">
      <canvas ref={canvasRef} id="dots" className="kc-canvas" aria-hidden="true" />

      <nav className="kc-nav">
        <a href="#top" className="kc-brand">
          <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
            <path d="M1 1 L8 17 L15 1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>VCroom</span>
        </a>
        <div className="kc-links">
          <a href="#how">How it works</a>
          <a href="#committee">The committee</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <Link href="/login" className="kc-signin">Sign in</Link>
      </nav>

      <div className="kc-copy">
        <h1 className="kc-h1">
          <span className="kc-line1">Four investors.</span>
          <span className="kc-line2">One verdict.</span>
        </h1>
        <p className="kc-sub">Upload your pitch. The committee asks one difficult question at a time — and returns an evidence-backed decision.</p>
        <div className="kc-cta">
          <Link href="/signup" className="kc-cta-pill">Start free</Link>
        </div>
      </div>

      <div className="kc-personas">
        {PERSONA_ROW.map((p) => (
          <span key={p.label} className="kc-persona">
            <PersonaGlyph glyph={p.glyph} />
            {p.label}
          </span>
        ))}
      </div>
    </section>
  );
}

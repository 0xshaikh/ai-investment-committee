import type { ReactNode } from 'react';

// Simple basic line icons — no background, no fill, consistent 1.5 stroke.
function I({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconCrossExam = () => (
  <I><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></I>
);
export const IconPersonas = () => (
  <I><circle cx="9" cy="8" r="3.5" /><path d="M3.5 19c.6-3 2.9-5 5.5-5s4.9 2 5.5 5" /><path d="M16 5.5a3.5 3.5 0 0 1 0 6.5M17.5 14.6c1.7.8 2.9 2.4 3 4.4" /></I>
);
export const IconLedger = () => (
  <I><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 12h7M9 16h7M9 8h2" /></I>
);
export const IconSearch = () => (
  <I><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /><path d="M8.5 11h5M11 8.5v5" /></I>
);
export const IconScale = () => (
  <I><path d="M12 4v16M7 20h10" /><path d="M12 6L6 8m6-2l6 2" /><path d="M3.5 12c0 1.4 1.1 2.5 2.5 2.5S8.5 13.4 8.5 12L6 8l-2.5 4z" /><path d="M15.5 12c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5L18 8l-2.5 4z" /></I>
);
export const IconReport = () => (
  <I><path d="M6 2.5h8l4 4V21.5H6z" /><path d="M14 2.5v4h4" /><path d="M9 12h6M9 15.5h6M9 8.5h1.5" /></I>
);

export const IconChartUp = () => (
  <I><path d="M4 19L10 13l3.5 3.5L20 10" /><path d="M15 10h5v5" /></I>
);
export const IconBriefcase = () => (
  <I><rect x="3.5" y="7.5" width="17" height="12" rx="2" /><path d="M9 7.5V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3.5 12.5h17" /></I>
);
export const IconChip = () => (
  <I><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" /><path d="M9.5 6.5V3.5M14.5 6.5V3.5M9.5 20.5v-3M14.5 20.5v-3M6.5 9.5H3.5M6.5 14.5H3.5M20.5 9.5h-3M20.5 14.5h-3" /></I>
);
export const IconFactory = () => (
  <I><path d="M3.5 21h17M5 21V9l5 3.5V9l5 3.5V5.5h3.5V21" /></I>
);

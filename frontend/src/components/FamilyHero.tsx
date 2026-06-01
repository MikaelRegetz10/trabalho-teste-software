export function FamilyHero() {
  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.94 0.04 165)" />
          <stop offset="1" stopColor="oklch(0.88 0.06 165)" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#bg)" />
      <circle cx="320" cy="90" r="22" fill="oklch(0.85 0.12 75)" opacity="0.7" />
      <g transform="translate(150,140)">
        <circle cx="0" cy="0" r="28" fill="oklch(0.85 0.04 60)" />
        <path d="M-22 -2 Q0 -28 22 -2" stroke="oklch(0.5 0.02 60)" strokeWidth="4" fill="none" />
        <circle cx="-9" cy="-2" r="2.5" fill="oklch(0.27 0.012 80)" />
        <circle cx="9" cy="-2" r="2.5" fill="oklch(0.27 0.012 80)" />
        <path d="M-8 12 Q0 18 8 12" stroke="oklch(0.27 0.012 80)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M-30 25 Q0 55 30 25 L40 90 L-40 90 Z" fill="oklch(0.46 0.09 165)" />
      </g>
      <g transform="translate(220,170)">
        <circle cx="0" cy="0" r="22" fill="oklch(0.82 0.05 40)" />
        <path d="M-22 -8 Q0 -22 22 -8 L20 14 L-20 14 Z" fill="oklch(0.35 0.05 40)" />
        <circle cx="-7" cy="0" r="2" fill="oklch(0.27 0.012 80)" />
        <circle cx="7" cy="0" r="2" fill="oklch(0.27 0.012 80)" />
        <path d="M-6 8 Q0 12 6 8" stroke="oklch(0.27 0.012 80)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M-24 18 Q0 42 24 18 L32 75 L-32 75 Z" fill="oklch(0.68 0.16 55)" />
      </g>
      <g transform="translate(195,135)">
        <path d="M0 6 C-8 -6 -22 2 -10 14 L0 22 L10 14 C22 2 8 -6 0 6 Z" fill="oklch(0.68 0.16 30)" />
      </g>
      <ellipse cx="200" cy="320" rx="140" ry="14" fill="oklch(0.46 0.09 165)" opacity="0.15" />
    </svg>
  );
}
/** Generated side-profile art per body type — no photos needed. */

const BODY: Record<string, { body: string; glass: string; wheel: number }> = {
  eco: {
    body: "M22,68 L22,48 Q24,40 40,38 L64,24 Q72,20 92,20 L128,20 Q140,20 150,32 L172,40 Q182,44 182,54 L182,68 Z",
    glass: "M30,40 L62,27 Q70,24 90,24 L126,24 Q136,24 144,36 Z",
    wheel: 12,
  },
  sedan: {
    body: "M12,68 L12,52 Q14,44 34,43 L58,28 Q66,23 86,23 L122,23 Q134,23 146,36 L176,43 Q188,46 188,56 L188,68 Z",
    glass: "M44,42 L62,30 Q68,27 86,27 L120,27 Q130,27 140,40 Z",
    wheel: 12,
  },
  suv: {
    body: "M16,68 L16,40 Q18,30 30,28 L50,18 Q56,15 70,15 L128,15 Q140,15 150,28 L176,36 Q186,39 186,52 L186,68 Z",
    glass: "M24,34 L52,21 Q58,19 70,19 L126,19 Q136,19 144,32 Z",
    wheel: 14,
  },
  ppv: {
    body: "M14,66 L14,30 Q14,16 30,15 L128,14 Q140,14 150,26 L178,34 Q188,38 188,50 L188,66 Z",
    glass: "M22,32 L24,22 Q26,19 34,19 L126,18 Q136,18 144,30 Z",
    wheel: 15,
  },
  pickup: {
    body: "M8,66 L8,40 L84,40 L86,22 Q88,15 98,15 L130,15 Q140,15 148,27 L178,35 Q188,39 188,51 L188,66 Z",
    glass: "M92,36 L94,22 Q96,19 102,19 L128,19 Q136,19 142,32 Z",
    wheel: 15,
  },
  mpv: {
    body: "M14,68 L14,26 Q16,14 32,14 L140,14 Q152,14 162,28 L182,40 Q188,44 188,54 L188,68 Z",
    glass: "M22,34 L22,24 Q24,18 34,18 L138,18 Q148,18 156,32 Z",
    wheel: 12,
  },
  sport: {
    body: "M12,68 L12,56 Q14,50 34,47 L72,34 Q82,30 98,30 L116,30 Q128,30 140,42 L180,49 Q192,52 192,60 L192,68 Z",
    glass: "M64,44 L78,36 Q86,33 98,33 L114,33 Q124,33 132,44 Z",
    wheel: 12,
  },
};

export default function CarArt({
  bodyType,
  hue,
  ev,
  className = "",
}: {
  bodyType: string;
  hue: number;
  ev?: boolean;
  className?: string;
}) {
  const b = BODY[bodyType] ?? BODY.sedan;
  const id = `g-${bodyType}-${hue}`;
  const y = 68;
  return (
    <svg viewBox="0 0 200 90" className={className} role="img" aria-label={`ภาพประกอบรถ${bodyType}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 70% 58%)`} />
          <stop offset="1" stopColor={`hsl(${hue} 65% 38%)`} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="82" rx="88" ry="4" fill="currentColor" opacity="0.12" />
      <path d={b.body} fill={`url(#${id})`} />
      <path d={b.glass} fill="hsl(210 30% 88%)" opacity="0.85" />
      {[50, 150].map((x) => (
        <g key={x}>
          <circle cx={x} cy={y} r={b.wheel + 3} fill="var(--surface)" />
          <circle cx={x} cy={y} r={b.wheel} fill="#1f2430" />
          <circle cx={x} cy={y} r={b.wheel * 0.45} fill="#9aa3b2" />
        </g>
      ))}
      {ev && (
        <path d="M104,44 L96,56 L102,56 L98,66 L108,52 L102,52 Z" fill="#fde047" stroke="#713f12" strokeWidth="0.8" />
      )}
    </svg>
  );
}

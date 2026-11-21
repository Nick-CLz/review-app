/** Generated side-profile motorcycle art per bike type (rear wheel left, front right). */

interface Shape {
  wheel: number;
  body: string;
  seat: string;
  /** Fork: from handlebar down to the front axle. */
  fork: [number, number];
  extra?: string;
}

const SHAPES: Record<string, Shape> = {
  moped: {
    wheel: 15,
    body: "M58,58 L80,44 L120,44 L132,28 L140,30 L130,50 L96,52 L74,62 Z",
    seat: "M66,40 Q68,35 80,35 L104,35 Q108,36 106,41 L68,42 Z",
    fork: [136, 24],
  },
  scooter: {
    wheel: 13,
    body: "M38,62 Q38,42 62,40 L100,40 Q104,52 118,54 L128,54 L136,22 L146,22 L142,54 Q156,57 164,64 L38,64 Z",
    seat: "M56,36 Q58,31 72,31 L98,31 Q103,32 100,38 L58,38 Z",
    fork: [140, 18],
  },
  maxi: {
    wheel: 14,
    body: "M32,62 Q32,34 60,32 L104,32 Q110,48 122,50 L130,50 L138,16 L150,16 L146,52 Q160,56 166,64 L32,64 Z",
    seat: "M54,28 Q58,21 76,21 L100,21 Q107,23 102,30 L56,30 Z",
    fork: [144, 14],
    extra: "M140,16 L148,4 L155,6 L150,16 Z",
  },
  sport: {
    wheel: 15,
    body: "M36,40 L66,40 L100,36 L120,28 L152,32 L162,48 L150,58 L120,60 L96,54 L72,58 L60,48 Z",
    seat: "M48,36 L92,33 L90,38 L50,40 Z",
    fork: [138, 26],
    extra: "M140,26 L150,18 L156,28 Z",
  },
  classic: {
    wheel: 16,
    body: "M84,34 Q92,25 114,27 L126,34 Q118,43 100,43 L86,41 Z M88,45 L118,45 L114,60 L92,60 Z",
    seat: "M52,37 Q54,31 70,31 L86,34 L84,41 L54,41 Z",
    fork: [128, 22],
    extra: "M52,66 L76,42 L120,40 L150,66",
  },
};

export default function BikeArt({
  bikeType,
  hue,
  ev,
  className = "",
}: {
  bikeType: string;
  hue: number;
  ev?: boolean;
  className?: string;
}) {
  const s = SHAPES[bikeType] ?? SHAPES.scooter;
  const id = `b-${bikeType}-${hue}`;
  const y = 66;
  return (
    <svg viewBox="0 0 200 90" className={className} role="img" aria-label={`ภาพประกอบมอเตอร์ไซค์${bikeType}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 70% 58%)`} />
          <stop offset="1" stopColor={`hsl(${hue} 65% 38%)`} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="83" rx="72" ry="3.5" fill="currentColor" opacity="0.12" />
      <line x1={s.fork[0]} y1={s.fork[1]} x2={150} y2={y} stroke="#4b5363" strokeWidth="3.5" strokeLinecap="round" />
      <line x1={s.fork[0] - 6} y1={s.fork[1] - 2} x2={s.fork[0] + 8} y2={s.fork[1] - 5} stroke="#1f2430" strokeWidth="3.5" strokeLinecap="round" />
      {bikeType === "classic" && s.extra && (
        <path d={s.extra} fill="none" stroke="#4b5363" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
      )}
      <path d={s.body} fill={`url(#${id})`} />
      {bikeType !== "classic" && s.extra && <path d={s.extra} fill="hsl(210 30% 88%)" opacity="0.85" />}
      <path d={s.seat} fill="#2a2f3a" />
      {/* Wheels last so scooter bodywork never hides them. */}
      {[52, 150].map((x) => (
        <g key={x}>
          <circle cx={x} cy={y} r={s.wheel} fill="#1f2430" />
          <circle cx={x} cy={y} r={s.wheel * 0.55} fill="var(--surface)" />
          <circle cx={x} cy={y} r={s.wheel * 0.2} fill="#9aa3b2" />
        </g>
      ))}
      {ev && <path d="M104,40 L96,52 L102,52 L98,62 L108,48 L102,48 Z" fill="#fde047" stroke="#713f12" strokeWidth="0.8" />}
    </svg>
  );
}

import { CAR_SCORE_DIMS, carScores, fullName } from "@/lib/items";
import { SERIES } from "@/lib/palette";
import type { Item } from "@/lib/types";

const C = 150;
const R = 100;

function point(axis: number, value: number, total: number) {
  const angle = -Math.PI / 2 + (axis * 2 * Math.PI) / total;
  const r = (value / 10) * R;
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const;
}

/** Spider chart of the five spec scores, one translucent shape per item. */
export default function ScoreRadar({ items }: { items: Item[] }) {
  const n = CAR_SCORE_DIMS.length;
  const ring = (v: number) => CAR_SCORE_DIMS.map((_, i) => point(i, v, n).join(",")).join(" ");

  return (
    <figure className="rounded-2xl border border-line bg-surface p-5">
      <figcaption className="text-lg font-bold">📊 ภาพรวมคะแนน</figcaption>
      <div className="mt-2 grid items-center gap-4 sm:grid-cols-[minmax(0,420px)_1fr]">
        <svg viewBox="-70 0 440 300" className="mx-auto w-full max-w-md" role="img" aria-label="กราฟเรดาร์เปรียบเทียบคะแนน 5 ด้าน">
          {[2, 4, 6, 8, 10].map((v) => (
            <polygon key={v} points={ring(v)} fill="none" stroke="var(--line)" strokeWidth={v === 10 ? 1.5 : 1} />
          ))}
          {CAR_SCORE_DIMS.map((d, i) => {
            const [x, y] = point(i, 10, n);
            const [lx, ly] = point(i, 12.6, n);
            return (
              <g key={d.key}>
                <line x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={Math.abs(lx - C) < 8 ? "middle" : lx > C ? "start" : "end"}
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="var(--muted)"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
          {items.map((item, idx) => {
            const s = carScores(item);
            const pts = CAR_SCORE_DIMS.map((d, i) => point(i, s[d.key], n).join(",")).join(" ");
            return (
              <polygon
                key={item.id}
                points={pts}
                fill={SERIES[idx]}
                fillOpacity={0.14}
                stroke={SERIES[idx]}
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
        <ul className="space-y-3 text-sm">
          {items.map((item, idx) => {
            const s = carScores(item);
            const best = CAR_SCORE_DIMS.reduce((a, b) => (s[b.key] > s[a.key] ? b : a));
            return (
              <li key={item.id} className="flex items-start gap-2">
                <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: SERIES[idx] }} />
                <span>
                  <b>{fullName(item)}</b>
                  <span className="block text-xs text-muted">
                    จุดแข็ง: {best.label} ({s[best.key].toFixed(1)})
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}

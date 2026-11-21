"use client";

// Price-over-time chart for one item: one step line per store (a price holds until the next one
// is logged), markers on the days a price was actually seen, direct labels at the line ends,
// and a crosshair tooltip that lists every store's price on the hovered day.
// Store colours come from the data, so identity is never colour alone: each store also gets its
// own marker shape and a name label.

import { useEffect, useMemo, useRef, useState } from "react";
import { baht } from "@/lib/stats";
import { useLang, useT } from "@/lib/i18n";
import type { Price, Store } from "@/lib/types";

const H = 220;
const PAD = { top: 14, right: 104, bottom: 26, left: 44 };
const SHAPES = ["circle", "square", "diamond", "triangle"] as const;

const dayMs = (d: string) => Date.parse(`${d}T00:00:00Z`);

type Series = { store: Store; shape: (typeof SHAPES)[number]; points: { date: string; price: number }[] };

/** Price in effect for a store on a given day (last one logged on or before it). */
function priceOn(s: Series, date: string) {
  let cur: number | undefined;
  for (const p of s.points) if (p.date <= date) cur = p.price;
  return cur;
}

function niceTicks(lo: number, hi: number, count = 4) {
  const span = hi - lo || 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const start = Math.floor(lo / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

function Marker({ shape, x, y, color }: { shape: Series["shape"]; x: number; y: number; color: string }) {
  const common = { fill: color, className: "stroke-white dark:stroke-zinc-900", strokeWidth: 2 };
  if (shape === "circle") return <circle cx={x} cy={y} r={4.5} {...common} />;
  if (shape === "square") return <rect x={x - 4} y={y - 4} width={8} height={8} rx={1.5} {...common} />;
  if (shape === "diamond") return <path d={`M${x},${y - 5.5} L${x + 5.5},${y} L${x},${y + 5.5} L${x - 5.5},${y} Z`} {...common} />;
  return <path d={`M${x},${y - 5.5} L${x + 5.5},${y + 4.5} L${x - 5.5},${y + 4.5} Z`} {...common} />;
}

export function PriceChart({ itemName, prices, stores }: { itemName: string; prices: Price[]; stores: Store[] }) {
  const t = useT();
  const lang = useLang();
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  const { series, dates, lowest, highest } = useMemo(() => {
    const byStore = new Map<string, Map<string, number>>();
    // Same store, same day: the last one logged wins
    for (const p of prices) {
      if (!byStore.has(p.storeId)) byStore.set(p.storeId, new Map());
      byStore.get(p.storeId)!.set(p.date, p.price);
    }
    const series: Series[] = stores
      .filter((s) => byStore.has(s.id))
      .map((store, i) => ({
        store,
        shape: SHAPES[i % SHAPES.length],
        points: [...byStore.get(store.id)!.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, price]) => ({ date, price })),
      }));
    const dates = [...new Set(prices.map((p) => p.date))].sort();
    const all = series.flatMap((s) => s.points.map((p) => ({ ...p, store: s.store })));
    const lowest = all.reduce<(typeof all)[number] | undefined>((m, p) => (!m || p.price < m.price || (p.price === m.price && p.date > m.date) ? p : m), undefined);
    const highest = all.reduce<(typeof all)[number] | undefined>((m, p) => (!m || p.price > m.price || (p.price === m.price && p.date > m.date) ? p : m), undefined);
    return { series, dates, lowest, highest };
  }, [prices, stores]);

  const hasChart = dates.length >= 2;
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasChart]);

  const fmtDate = (d: string) =>
    new Date(dayMs(d)).toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

  if (!lowest || !highest) return <p className="text-sm text-zinc-500">{t("chart.noData")}</p>;

  const tiles = (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <Tile label={t("chart.lowest")} value={baht(lowest.price)} sub={t("chart.at", { store: lowest.store.name, date: fmtDate(lowest.date) })} />
      <Tile label={t("chart.highest")} value={baht(highest.price)} sub={t("chart.at", { store: highest.store.name, date: fmtDate(highest.date) })} />
    </div>
  );

  if (!hasChart) {
    return (
      <div className="space-y-3">
        {tiles}
        <p className="text-xs text-zinc-500">{t("chart.needMore")}</p>
      </div>
    );
  }

  const W = width;
  const x0 = PAD.left, x1 = W - PAD.right, y0 = PAD.top, y1 = H - PAD.bottom;
  const tMin = dayMs(dates[0]), tMax = dayMs(dates[dates.length - 1]);
  const ticks = niceTicks(lowest.price * 0.97, highest.price * 1.03);
  const vMin = Math.min(ticks[0], lowest.price), vMax = Math.max(ticks[ticks.length - 1], highest.price);
  const x = (d: string) => x0 + ((dayMs(d) - tMin) / (tMax - tMin)) * (x1 - x0);
  const y = (v: number) => y1 - ((v - vMin) / (vMax - vMin || 1)) * (y1 - y0);
  const last = dates[dates.length - 1];

  const paths = series.map((s) => {
    let d = "";
    s.points.forEach((p, i) => {
      d += i === 0 ? `M${x(p.date)},${y(p.price)}` : ` H${x(p.date)} V${y(p.price)}`;
    });
    return d + ` H${x(last)}`;
  });

  // End labels: nudge apart so names never overlap
  const labels = series
    .map((s, i) => ({ i, y: y(s.points[s.points.length - 1].price) }))
    .sort((a, b) => a.y - b.y);
  for (let k = 1; k < labels.length; k++) if (labels[k].y - labels[k - 1].y < 16) labels[k].y = labels[k - 1].y + 16;
  // ...and if that pushed the stack past the bottom of the plot, slide it back up
  for (let k = labels.length - 1, max = y1; k >= 0; k--, max -= 16) labels[k].y = Math.min(labels[k].y, max);
  const labelY = new Map(labels.map((l) => [l.i, l.y]));

  // Date labels: keep as many as fit without colliding, always the first and last
  const xTicks: string[] = [];
  for (const d of dates) if (!xTicks.length || x(d) - x(xTicks[xTicks.length - 1]) >= 64) xTicks.push(d);
  if (xTicks[xTicks.length - 1] !== last) {
    if (xTicks.length > 1 && x(last) - x(xTicks[xTicks.length - 1]) < 64) xTicks.pop();
    xTicks.push(last);
  }
  const hoverDate = hover != null ? dates[hover] : null;

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    dates.forEach((d, i) => {
      if (Math.abs(x(d) - px) < Math.abs(x(dates[best]) - px)) best = i;
    });
    setHover(best);
  }

  return (
    <div className="space-y-3">
      {tiles}
      <div ref={wrap} className="relative overflow-hidden">
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t("chart.label", { name: itemName })}
          tabIndex={0}
          className="block h-auto max-w-full touch-none select-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
          onBlur={() => setHover(null)}
          onFocus={() => setHover((h) => h ?? dates.length - 1)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? dates.length) - 1));
            else if (e.key === "ArrowRight") setHover((h) => Math.min(dates.length - 1, (h ?? -1) + 1));
            else return;
            e.preventDefault();
          }}
        >
          {ticks.map((v) => (
            <g key={v}>
              <line x1={x0} x2={x1} y1={y(v)} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth={1} />
              <text x={x0 - 6} y={y(v)} dy="0.32em" textAnchor="end" className="fill-zinc-500 text-[11px] tabular-nums">
                {baht(v)}
              </text>
            </g>
          ))}
          {xTicks.map((d, i) => (
            <text key={d} x={x(d)} y={H - 8} textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"} className="fill-zinc-500 text-[11px]">
              {fmtDate(d)}
            </text>
          ))}
          {hoverDate && <line x1={x(hoverDate)} x2={x(hoverDate)} y1={y0} y2={y1} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth={1} />}
          {series.map((s, i) => (
            <path key={s.store.id} d={paths[i]} fill="none" stroke={s.store.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {series.map((s) =>
            s.points.map((p) => <Marker key={`${s.store.id}-${p.date}`} shape={s.shape} x={x(p.date)} y={y(p.price)} color={s.store.color} />),
          )}
          {series.map((s, i) => {
            const ly = labelY.get(i)!;
            const v = s.points[s.points.length - 1].price;
            const room = Math.max(4, 14 - baht(v).length); // characters left beside the price
            const name = s.store.name.length > room ? `${s.store.name.slice(0, room - 1)}…` : s.store.name;
            return (
              <g key={s.store.id}>
                <line x1={x1 + 6} x2={x1 + 16} y1={ly} y2={ly} stroke={s.store.color} strokeWidth={2} strokeLinecap="round" />
                <text x={x1 + 20} y={ly} dy="0.32em" className="fill-zinc-700 text-[11px] dark:fill-zinc-300">
                  <tspan className="font-semibold tabular-nums">{baht(v)}</tspan> {name}
                </text>
              </g>
            );
          })}
        </svg>
        {hoverDate && (
          <div
            className="pointer-events-none absolute top-1 z-10 min-w-36 rounded-lg bg-white p-2 text-xs shadow-lg ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700"
            style={x(hoverDate) > W / 2 ? { right: W - x(hoverDate) + 8 } : { left: x(hoverDate) + 8 }}
          >
            <div className="mb-1 text-zinc-500">{fmtDate(hoverDate)}</div>
            {series.map((s) => {
              const v = priceOn(s, hoverDate);
              return (
                <div key={s.store.id} className="flex items-center gap-2">
                  <span className="h-0.5 w-3 rounded" style={{ background: s.store.color }} />
                  <b className="tabular-nums">{v != null ? baht(v) : "—"}</b>
                  <span className="text-zinc-500">{s.store.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="truncate text-xs text-zinc-500">{sub}</div>
    </div>
  );
}

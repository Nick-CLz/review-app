import { CAR_SCORE_DIMS, carScores } from "@/lib/items";
import type { Item } from "@/lib/types";

export default function ScoreBars({ item }: { item: Item }) {
  const s = carScores(item);
  return (
    <ul className="space-y-2">
      {CAR_SCORE_DIMS.map((d) => (
        <li key={d.key} className="grid grid-cols-[96px_1fr_32px] items-center gap-2 text-sm">
          <span className="text-muted">{d.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-brand" style={{ width: `${s[d.key] * 10}%` }} />
          </span>
          <span className="text-right font-semibold tabular-nums">{s[d.key].toFixed(1)}</span>
        </li>
      ))}
    </ul>
  );
}

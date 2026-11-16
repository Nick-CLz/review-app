export default function Stars({ value, size = "text-sm" }: { value: number; size?: string }) {
  const full = Math.round(value);
  return (
    <span className={`${size} tracking-tight text-accent`} aria-label={`${value.toFixed(1)} จาก 5 ดาว`}>
      {"★".repeat(full)}
      <span className="text-line">{"★".repeat(5 - full)}</span>
    </span>
  );
}

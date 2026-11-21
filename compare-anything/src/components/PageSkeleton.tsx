export default function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-8" aria-busy="true" aria-label="กำลังโหลด">
      <div className="h-3 w-40 rounded bg-surface-2" />
      <div className="mt-4 h-8 w-2/3 max-w-md rounded bg-surface-2" />
      <div className="mt-3 h-4 w-1/2 max-w-sm rounded bg-surface-2" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-surface-2" />
        ))}
      </div>
    </div>
  );
}

export function DashLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-7">
        <div className="h-7 w-56 rounded-lg bg-white/[0.06]" />
        <div className="mt-2.5 h-4 w-80 max-w-full rounded-md bg-white/[0.04]" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card h-64" />
        <div className="card h-64" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="card h-20" />
        <div className="card h-20" />
        <div className="card h-20" />
      </div>
    </div>
  );
}

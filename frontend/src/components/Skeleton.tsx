export function CardSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="size-9 animate-pulse rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
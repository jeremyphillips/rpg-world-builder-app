/** Neutral loading placeholder for the header nav while session resolves. */
export function SiteHeaderNavSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
      <div className="size-8 animate-pulse rounded-full bg-muted" />
    </div>
  )
}

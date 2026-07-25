import { cva } from 'class-variance-authority'

/** Compact quiet counter for collection-backed table cells — no semantic status colors. */
export const collectionSummaryCounterVariants = cva(
  'inline-flex min-w-[2.25rem] items-center justify-center rounded border border-border-subtle bg-surface-subtle px-1.5 py-0.5 font-data-stat text-table-stat tabular-nums text-muted-foreground transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

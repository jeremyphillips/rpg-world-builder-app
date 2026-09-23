import { cva } from 'class-variance-authority'

export const mediaManagerStyles = {
  layout: cva('grid min-w-0 gap-6 md:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]'),
  gallery: cva('min-w-0 space-y-4 md:border-r md:border-border md:pr-6'),
  row: cva('flex flex-wrap items-center justify-between gap-2'),
  grid: cva('flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible'),
  tile: cva(
    'relative aspect-square w-28 shrink-0 overflow-hidden rounded-md border-2 bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-full',
    { variants: { selected: { true: 'border-primary', false: 'border-transparent' } } },
  ),
  thumbnail: cva('size-full object-cover'),
  badges: cva('absolute inset-x-1 bottom-1 flex flex-wrap gap-1'),
  badge: cva('rounded bg-background px-2 py-1 text-xs text-foreground'),
  workspace: cva('min-w-0 space-y-4'),
  editor: cva('grid min-w-0 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'),
  details: cva('min-w-0 space-y-5'),
  preview: cva('aspect-square w-full rounded-md bg-sunken object-contain'),
  heading: cva('text-lg font-semibold'),
  subheading: cva('text-sm font-semibold'),
  muted: cva('text-sm text-muted-foreground'),
  metadata: cva('space-y-2 border-t border-border pt-4 text-sm break-words'),
  empty: cva(
    'flex min-h-48 items-center justify-center rounded-md bg-sunken p-6 text-center text-muted-foreground',
  ),
  queue: cva('space-y-2 rounded-md border border-border p-3 text-sm'),
  hidden: cva('sr-only'),
  roles: cva('space-y-3'),
  error: cva('text-sm text-destructive'),
}

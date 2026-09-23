import { cva } from 'class-variance-authority'

export const mediaCropStyles = {
  root: cva('flex min-w-0 flex-col gap-4'),
  viewport: cva(
    'relative aspect-square w-full overflow-hidden rounded-md bg-sunken touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  ),
  image: cva('pointer-events-none absolute max-w-none select-none'),
  aperture: cva(
    'pointer-events-none absolute inset-[12.5%] border-2 border-foreground ring-[100vmax] ring-overlay',
  ),
  guides: cva('absolute inset-1/3 border-x border-y border-border'),
  row: cva('flex flex-wrap items-center gap-2'),
  slider: cva('min-w-0 flex-1 accent-primary'),
  previews: cva('flex flex-wrap gap-4'),
  preview: cva('relative size-20 overflow-hidden bg-sunken', {
    variants: { circle: { true: 'rounded-full', false: 'rounded-md' } },
  }),
  label: cva('text-sm text-muted-foreground'),
}

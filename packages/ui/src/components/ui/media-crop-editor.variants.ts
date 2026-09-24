import { cva } from 'class-variance-authority'

export const mediaCropStyles = {
  root: cva('flex min-w-0 flex-col gap-4'),
  viewport: cva(
    'relative w-full overflow-hidden rounded-md bg-sunken touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    {
      variants: {
        frame: {
          square: 'aspect-square',
          banner: 'aspect-[3/1]',
          free: 'aspect-square',
        },
      },
      defaultVariants: { frame: 'square' },
    },
  ),
  image: cva('pointer-events-none absolute max-w-none select-none'),
  aperture: cva(
    'pointer-events-none absolute border-2 border-foreground ring-[100vmax] ring-overlay',
    {
      variants: {
        frame: {
          square: 'inset-[12.5%]',
          banner: 'inset-x-[8%] inset-y-[20%]',
          free: 'inset-[12.5%]',
        },
      },
      defaultVariants: { frame: 'square' },
    },
  ),
  guides: cva('absolute inset-1/3 border-x border-y border-border'),
  focalPoint: cva(
    'absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-background shadow-sm touch-none',
  ),
  row: cva('flex flex-wrap items-center gap-2'),
  slider: cva('min-w-0 flex-1 accent-primary'),
  previews: cva('flex flex-wrap gap-4'),
  preview: cva('relative size-20 overflow-hidden bg-sunken', {
    variants: { circle: { true: 'rounded-full', false: 'rounded-md' } },
  }),
  label: cva('text-sm text-muted-foreground'),
}

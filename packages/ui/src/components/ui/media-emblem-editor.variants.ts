import { cva } from 'class-variance-authority'

export const mediaEmblemStyles = {
  root: cva('flex min-w-0 flex-col gap-4'),
  viewport: cva(
    'relative aspect-square w-full overflow-hidden rounded-md border border-border touch-none',
  ),
  checkerboard: cva(
    'absolute inset-0 bg-[linear-gradient(45deg,var(--muted)_25%,transparent_25%,transparent_75%,var(--muted)_75%,var(--muted)),linear-gradient(45deg,var(--muted)_25%,transparent_25%,transparent_75%,var(--muted)_75%,var(--muted))] bg-[length:16px_16px] bg-[position:0_0,8px_8px]',
  ),
  image: cva('absolute select-none'),
  controls: cva('flex flex-wrap items-center gap-2'),
  slider: cva('min-w-0 flex-1 accent-primary'),
  actions: cva('flex flex-wrap items-center gap-2'),
  actionSeparator: cva('text-muted-foreground'),
}

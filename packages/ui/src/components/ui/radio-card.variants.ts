import { cva } from 'class-variance-authority'

/** Card-style radio option: selected, hover, and focus states use design tokens only. */
export const radioCardVariants = cva(
  'group relative flex w-full cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left text-card-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-accent/30 data-[state=checked]:ring-1 data-[state=checked]:ring-primary/20 aria-invalid:border-destructive',
)

/** Decorative radio circle shown inside the card, synced to the parent item state. */
export const radioCardControlVariants = cva(
  'flex aspect-square size-5 shrink-0 items-center justify-center rounded-full border border-input text-primary shadow-sm transition-colors group-data-[state=checked]:border-primary',
)

export const radioCardIndicatorVariants = cva(
  'opacity-0 transition-opacity group-data-[state=checked]:opacity-100',
)

export const radioCardBodyVariants = cva('flex min-w-0 flex-1 flex-col gap-2')

export const radioCardRootLayoutVariants = cva('flex items-start gap-3')

export const radioCardMetaListVariants = cva('flex flex-wrap gap-1.5')

import { cva } from 'class-variance-authority'

/** Card-style radio option: selected, hover, and focus states use design tokens only. */
export const radioCardVariants = cva(
  'relative flex w-full cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left text-card-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-accent/30 data-[state=checked]:ring-1 data-[state=checked]:ring-primary/20 aria-invalid:border-destructive',
)

export const radioCardMetaListVariants = cva('flex flex-wrap gap-1.5')

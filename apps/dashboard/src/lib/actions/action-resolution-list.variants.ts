import { cva } from 'class-variance-authority'

/** Lighter-than-modal inset for conflict/resolution lists inside action dialogs. */
export const actionResolutionListVariants = cva(
  'max-h-[min(50vh,18rem)] overflow-y-auto rounded-md border border-border bg-surface-subtle',
)

export const actionResolutionRowVariants = cva('flex items-start gap-3 px-3 py-2.5 text-sm', {
  variants: {
    state: {
      eligible: 'text-foreground',
      blocked: 'text-destructive',
      updated: 'text-success',
      failed: 'text-destructive',
    },
  },
  defaultVariants: {
    state: 'eligible',
  },
})

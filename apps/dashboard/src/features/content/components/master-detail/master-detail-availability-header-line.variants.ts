import { cva } from 'class-variance-authority'
import { cn } from '@rpg/ui'

export const masterDetailAvailabilityHeaderLineClasses =
  'flex flex-wrap items-center gap-x-1 text-xs'

export const masterDetailAvailabilityHeaderStatusClasses = 'min-w-0 flex items-center gap-1.5'

export const masterDetailAvailabilityHeaderChangeClasses = 'h-auto shrink-0 px-0 text-xs'

export const masterDetailAvailabilityAvailableStatusClasses = cn(
  'inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-foreground',
)

export const masterDetailAvailabilityAvailableDotClasses = cva('size-1.5 shrink-0 rounded-full', {
  variants: {
    tone: {
      success: 'bg-semantic-success',
    },
  },
  defaultVariants: {
    tone: 'success',
  },
})

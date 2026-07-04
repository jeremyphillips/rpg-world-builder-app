import { cn } from '../../lib/utils'

/** Count badge appended to a tab trigger after a failed submit. */
export const tabbedFormTabIssueBadgeClasses = cn(
  'inline-flex min-w-5 items-center justify-center rounded-sm px-1',
  'bg-destructive/10 text-destructive text-xs font-medium tabular-nums leading-none',
)

export const tabbedFormTabIssueSeparatorClasses = 'text-destructive-muted'

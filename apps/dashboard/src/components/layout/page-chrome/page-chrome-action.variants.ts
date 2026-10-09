import { buttonVariants, cn } from '@rpg/ui'

/** Outline link/button styling for sticky page chrome toolbar actions. */
export const pageChromeOutlineActionClasses = cn(
  buttonVariants({ variant: 'outline', size: 'sm', density: 'compact' }),
  'inline-flex items-center',
)

import { cva } from 'class-variance-authority'

import { cn, contentCardDensityInsetVariants } from '@rpg/ui'

const entityCardFrameShellVariants = cva('w-full min-w-0 rounded-md border border-border', {
  variants: {
    disabled: {
      true: 'opacity-60',
      false: '',
    },
  },
  defaultVariants: {
    disabled: false,
  },
})

/** Canonical bordered entity card shell — shared by ContentEntityCard (and future DisclosureEntityCard). */
export function entityCardFrameVariants({
  density,
  disabled = false,
}: {
  density: 'compact' | 'comfortable'
  disabled?: boolean
}) {
  return cn(
    entityCardFrameShellVariants({ disabled }),
    contentCardDensityInsetVariants({ density }),
  )
}

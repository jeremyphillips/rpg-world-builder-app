import { cva } from 'class-variance-authority'

import { cn } from '@rpg/ui'

/** Matches inherited radio-card / shell `--surface-current` for blend knockouts. */
export const contentMediaImageSurfaceBackdropClasses =
  'bg-[var(--surface-current,var(--background))]'

export const contentMediaImageFrameVariants = cva('relative overflow-hidden', {
  variants: {
    frame: {
      intrinsic: 'isolate min-h-0 w-full',
      primary: 'isolate aspect-[4/3] w-full min-h-0',
      builderSheetHero: 'isolate aspect-[4/3] w-full min-h-0',
      builderCard: cn('aspect-[4/2] w-full min-h-0', contentMediaImageSurfaceBackdropClasses),
      square: 'isolate size-6 shrink-0 rounded-md lg:size-8',
    },
  },
  defaultVariants: {
    frame: 'intrinsic',
  },
})

export const contentMediaImageClasses = 'block size-full max-w-none select-none object-cover'

/** White-paper line art on a light surface; dark mode renders the original artwork. */
export const contentMediaImageWhitePaperKnockoutClasses = 'mix-blend-multiply dark:mix-blend-normal'

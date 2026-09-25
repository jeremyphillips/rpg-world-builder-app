import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

export const heroRootClasses = '@container max-w-4xl space-y-3'

export const heroMediaFrameClasses =
  'relative w-full overflow-hidden rounded-xl h-[min(calc(100cqw/3),15rem)]'

export const heroMediaImageClasses = 'block size-full object-cover object-center'

/** Emblem is desktop-only; below sm the layout matches the no-emblem path. */
export const heroMarkVisibilityClasses = 'hidden sm:block'

/** Horizontal separation between the emblem shell and the copy column. */
export const heroMarkCopyGapClasses = 'sm:mr-4'

export const heroIdentityBlockVariants = cva('flex items-start', {
  variants: {
    hasMark: {
      true: 'sm:px-4 md:px-2 lg:px-4',
      false: '',
    },
  },
  defaultVariants: {
    hasMark: false,
  },
})

export const heroCopyColumnClasses = 'flex min-w-0 flex-1 flex-col gap-1'

export const heroIdentityRowClasses = 'flex items-center justify-between gap-4'

export const heroTitleShellClasses = 'min-w-0 flex-1'

export const heroMetaStackClasses = 'flex flex-col gap-3'

export const heroMetaClasses = 'inline-flex items-center gap-1.5 text-xs sm:text-sm'

export const heroMarkShellVariants = cva(
  cn('relative shrink-0', heroMarkVisibilityClasses, heroMarkCopyGapClasses),
  {
    variants: {
      placement: {
        inline: '',
        overlap: 'sm:-mt-6 z-10',
      },
    },
    defaultVariants: {
      placement: 'inline',
    },
  },
)

export const heroMarkRadiusClasses = 'rounded-lg'

export const heroMarkFrameClasses = cn(
  'box-content size-image-preview overflow-hidden border-[6px] border-background',
  heroMarkRadiusClasses,
)

export const heroMarkImageClasses = cn('block size-full object-contain', heroMarkRadiusClasses)

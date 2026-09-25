import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

export const heroRootClasses = '@container max-w-4xl space-y-3'

export const heroMediaFrameClasses =
  'relative w-full overflow-hidden rounded-xl h-[min(calc(100cqw/3),15rem)]'

export const heroMediaImageClasses = 'block size-full object-cover object-center'

export const heroIdentityRowClasses = 'flex items-start justify-between gap-4'

export const heroTitleShellClasses = 'min-w-0 flex-1'

export const heroMetaStackClasses = 'flex flex-col gap-1'

export const heroMarkShellVariants = cva('relative', {
  variants: {
    placement: {
      inline: '',
      overlap: '-mt-3 z-10',
    },
  },
  defaultVariants: {
    placement: 'inline',
  },
})

export const heroMarkFrameClasses = cn(
  'box-content size-image-preview overflow-hidden rounded-lg border-[6px] border-background',
)

export const heroMarkImageClasses = 'block size-full object-contain'

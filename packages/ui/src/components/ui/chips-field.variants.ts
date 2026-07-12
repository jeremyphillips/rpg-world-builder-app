import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldSizeTypographyClasses } from './field-sizing.variants'
import type { CompactLabelSize } from './compact-label.lib'

export type ChipSize = CompactLabelSize

export const chipPillVariants = cva(
  [
    'inline-flex items-center rounded-full border font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: cn('px-2.5 py-0.5', fieldSizeTypographyClasses.sm),
        md: cn('px-2.5 py-1 text-sm-meta'),
        lg: cn('px-4 py-2', fieldSizeTypographyClasses.lg),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type ChipPillVariantProps = VariantProps<typeof chipPillVariants>

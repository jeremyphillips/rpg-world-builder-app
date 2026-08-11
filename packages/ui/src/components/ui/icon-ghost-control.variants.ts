import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { controlActionCompactIconClasses } from './control-action.variants'
import { interactiveFocusVariants } from './interactive-focus.variants'

/**
 * Icon-only ghost control chrome — composes compact/comfortable hit targets with embedded focus.
 * Features compose semantic intent (hover tone, size); they do not assemble ring or geometry utilities.
 */
export const iconGhostControlVariants = cva(
  cn(
    'shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground',
    interactiveFocusVariants({ context: 'embedded' }),
  ),
  {
    variants: {
      size: {
        compact: controlActionCompactIconClasses,
        comfortable: 'size-8',
      },
      hover: {
        accent: 'hover:bg-control-hover hover:text-foreground',
        text: 'hover:text-foreground',
        destructive: 'hover:text-destructive',
        destructiveSubtle: 'hover:bg-destructive-subtle hover:text-destructive',
      },
      layout: {
        inline: 'inline-flex',
        flex: 'flex',
      },
    },
    defaultVariants: {
      size: 'compact',
      hover: 'text',
      layout: 'inline',
    },
  },
)

export type IconGhostControlVariantProps = VariantProps<typeof iconGhostControlVariants>

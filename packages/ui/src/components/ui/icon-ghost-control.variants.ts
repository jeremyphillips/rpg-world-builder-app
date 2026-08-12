import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { controlActionCompactIconClasses } from './control-action.variants'
import { interactiveFocusVariants } from './interactive-focus.variants'

/**
 * Icon-only ghost control chrome — compact control-action hit target with embedded focus.
 * List-row removes use the default compact size; features must not assemble geometry utilities.
 */
export const iconGhostControlVariants = cva(
  cn(
    'inline-flex shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground',
    controlActionCompactIconClasses,
    interactiveFocusVariants({ context: 'embedded' }),
  ),
  {
    variants: {
      hover: {
        accent: 'hover:bg-control-hover hover:text-foreground',
        text: 'hover:text-foreground',
        destructive: 'hover:text-destructive',
        destructiveSubtle: 'hover:bg-destructive-subtle hover:text-destructive',
      },
      layout: {
        inline: '',
        flex: 'flex',
      },
    },
    defaultVariants: {
      hover: 'text',
      layout: 'inline',
    },
  },
)

export type IconGhostControlVariantProps = VariantProps<typeof iconGhostControlVariants>

import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Shared focus ring policy for interactive controls.
 *
 * - `standalone` — full ring + offset (buttons, choice indicators on their own surface).
 * - `embedded` — ring without offset (icon ghosts and dense row/card chrome).
 */
export const interactiveFocusVariants = cva(
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      context: {
        standalone: 'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        embedded: '',
      },
    },
    defaultVariants: {
      context: 'standalone',
    },
  },
)

export type InteractiveFocusVariantProps = VariantProps<typeof interactiveFocusVariants>

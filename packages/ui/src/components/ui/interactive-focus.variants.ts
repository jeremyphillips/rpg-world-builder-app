import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Shared focus ring policy for interactive controls.
 *
 * - `standalone` — full ring + offset (buttons, choice indicators on their own surface).
 * - `embedded` — ring without offset (icon ghosts and dense row/card chrome).
 */
export const interactiveFocusVariants = cva('ui-focus-ring', {
  variants: {
    context: {
      standalone: '',
      embedded: 'ui-focus-ring--embedded',
    },
  },
  defaultVariants: {
    context: 'standalone',
  },
})

export type InteractiveFocusVariantProps = VariantProps<typeof interactiveFocusVariants>

/**
 * Explicit pointer cursor for interactive hit targets. Tailwind v4 preflight sets
 * `button { cursor: default }`; globals base restores pointer on buttons, but
 * row shells and non-button targets still compose this in variants.
 */
export const interactivePointerClasses = 'cursor-pointer'

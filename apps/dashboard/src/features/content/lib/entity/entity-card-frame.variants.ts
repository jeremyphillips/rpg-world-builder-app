import { cva } from 'class-variance-authority'

/** Canonical bordered entity card shell — shared by ContentEntityCard (and future DisclosureEntityCard). */
export const entityCardFrameVariants = cva('w-full min-w-0 rounded-md border border-border', {
  variants: {
    density: {
      compact: 'px-3 py-2',
      comfortable: 'px-5 py-3',
    },
    disabled: {
      true: 'opacity-60',
      false: '',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    disabled: false,
  },
})

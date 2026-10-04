import { cva } from 'class-variance-authority'

/** Passive triggers show info on hover/focus; interactive triggers are real controls. */
export const tooltipTriggerCursorVariants = cva('', {
  variants: {
    interactive: {
      false: 'cursor-default',
      true: 'cursor-pointer',
    },
  },
  defaultVariants: {
    interactive: false,
  },
})

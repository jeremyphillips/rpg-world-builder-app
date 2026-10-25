import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

export const accordionItemVariants = cva('', {
  variants: {
    variant: {
      default: 'border-b border-border',
      section: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const accordionTriggerVariants = cva(
  [
    'flex flex-1 cursor-pointer items-center justify-between gap-2 text-left transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        default: 'py-4 font-medium hover:underline',
        section: cn('w-full py-2 hover:text-foreground/80', 'text-style-field-legend'),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

// forceMount keeps RHF fields registered; block interaction/focus when visually closed.
export const accordionContentVariants =
  'overflow-hidden text-sm data-[state=open]:overflow-visible data-[state=closed]:h-0 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down data-[state=closed]:pointer-events-none data-[state=closed]:inert'

export const accordionContentInnerVariants = cva('', {
  variants: {
    variant: {
      default: 'px-4 pb-4 pt-0',
      // px-1 inset keeps focus rings (ring-2 + ring-offset-2) inside overflow-hidden content.
      section: 'pb-3 pt-1',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type AccordionVariant = 'default' | 'section'

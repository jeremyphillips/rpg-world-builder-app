import { cva } from 'class-variance-authority'

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
    'flex flex-1 items-center justify-between gap-2 text-left transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    '[&[data-state=open]>svg]:rotate-180',
  ],
  {
    variants: {
      variant: {
        default: 'py-4 font-medium hover:underline',
        section:
          'w-full font-display text-lg font-semibold leading-none text-foreground hover:text-foreground/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export const accordionContentVariants = cva([
  'overflow-hidden text-sm',
  'data-[state=closed]:h-0 data-[state=closed]:animate-accordion-up',
  'data-[state=open]:animate-accordion-down',
  // forceMount keeps RHF fields registered; block interaction/focus when visually closed.
  'data-[state=closed]:pointer-events-none data-[state=closed]:inert',
])

export const accordionContentInnerVariants = cva('', {
  variants: {
    variant: {
      default: 'px-4 pb-4 pt-0',
      section: 'pb-4 pt-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type AccordionVariant = 'default' | 'section'

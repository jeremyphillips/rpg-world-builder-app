import { cva } from 'class-variance-authority'

/** Retained for DismissibleBadge until cleanup PR removes it. */
export const dismissibleBadgeVariants = cva('gap-0.5', {
  variants: {
    size: {
      sm: 'pr-0.5',
      md: 'pr-0.5',
      lg: 'pr-1',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Retained for DismissibleBadge until cleanup PR removes it. */
export const badgeDismissButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'size-5 [&_svg]:size-2.5',
        md: 'size-6 [&_svg]:size-3',
        lg: 'size-8 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

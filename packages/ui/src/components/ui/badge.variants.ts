import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border font-body-emphasis transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80',
        outline: 'text-foreground',
      },
      size: {
        sm: 'px-1.5 py-px text-badge-sm',
        md: 'px-2 py-0.5 text-badge-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>

/** Layout tweaks when a badge includes a dismiss control. */
export const dismissibleBadgeVariants = cva('', {
  variants: {
    size: {
      sm: 'gap-0.5 pr-0.5',
      md: 'gap-1 pr-1',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Icon button that removes a `DismissibleBadge`. */
export const badgeDismissButtonVariants = cva(
  'rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'p-px [&_svg]:size-2.5',
        md: 'p-0.5 [&_svg]:size-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

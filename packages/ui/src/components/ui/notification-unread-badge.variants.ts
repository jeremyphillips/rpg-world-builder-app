import { cva } from 'class-variance-authority'

export const notificationUnreadBadgeVariants = cva(
  'absolute right-0 top-0 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-xs font-body-emphasis leading-none',
  {
    variants: {
      tone: {
        alert: 'border border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      tone: 'alert',
    },
  },
)

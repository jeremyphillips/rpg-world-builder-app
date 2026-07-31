import { cva } from 'class-variance-authority'

export const notificationPreviewItemVariants = cva(
  'w-full px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      unread: {
        true: 'bg-row-selected hover:bg-row-selected',
        false: 'bg-background hover:bg-row-hover',
      },
    },
    defaultVariants: {
      unread: false,
    },
  },
)

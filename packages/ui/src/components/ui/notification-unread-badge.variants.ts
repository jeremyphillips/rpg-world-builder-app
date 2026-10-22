import { cva } from 'class-variance-authority'

export const notificationUnreadBadgeVariants = cva('ui-notification-unread-badge', {
  variants: {
    tone: {
      alert: 'ui-notification-unread-badge--alert',
    },
  },
  defaultVariants: {
    tone: 'alert',
  },
})

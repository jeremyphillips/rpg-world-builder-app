import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { menuItemIconGlyphClasses } from './icon-glyph.variants'

/** Shared popover/dropdown row styling for notification bell footer links. */
export const notificationMenuRowLinkVariants = cva(
  cn(
    'ui-menu-item',
    'w-full hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground',
    menuItemIconGlyphClasses,
  ),
)

export const notificationMenuFooterLinkVariants = cva(notificationMenuRowLinkVariants(), {
  variants: {
    emphasis: {
      default: '',
      strong: 'font-body-emphasis',
    },
  },
  defaultVariants: {
    emphasis: 'default',
  },
})

import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { menuItemIconGlyphClasses } from './icon-glyph.variants'

/** Shared popover/dropdown row styling for notification bell footer links. */
export const notificationMenuRowLinkVariants = cva(
  cn(
    'relative flex w-full select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0',
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

import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { resolveCompactControlMenuItemClasses } from './compact-control.styles'
import {
  interactiveListMenuHostClasses,
  interactiveListPanelVariants,
} from './interactive-list.variants'

/** Viewport-safe choice menu width — target ~300px, shrink on narrow viewports. */
export const dropdownMenuChoiceContentClasses =
  'w-[min(var(--popover-choice-menu-width),calc(100vw-2rem))]'

/** Choice menus — shared panel shell + viewport width (replaces `bg-field-container p-1`). */
export const interactiveListChoiceMenuContentClasses = cn(
  interactiveListPanelVariants({ triggerWidth: 'fit' }),
  dropdownMenuChoiceContentClasses,
  interactiveListMenuHostClasses,
)

export const dropdownMenuChoiceItemVariants = cva('h-auto items-start', {
  variants: {
    size: {
      sm: resolveCompactControlMenuItemClasses('sm'),
      md: resolveCompactControlMenuItemClasses('md'),
      lg: resolveCompactControlMenuItemClasses('lg'),
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** @deprecated Prefer `dropdownMenuChoiceItemVariants({ size })`. */
export const dropdownMenuChoiceItemClasses = dropdownMenuChoiceItemVariants({ size: 'md' })

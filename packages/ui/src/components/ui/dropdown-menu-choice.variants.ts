import { cva, type VariantProps } from 'class-variance-authority'

import { resolveCompactControlMenuItemClasses } from './compact-control.styles'

/** Viewport-safe choice menu width — target ~300px, shrink on narrow viewports. */
export const dropdownMenuChoiceContentClasses =
  'w-[min(var(--popover-choice-menu-width),calc(100vw-2rem))]'

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

export type DropdownMenuChoiceItemVariantsProps = VariantProps<
  typeof dropdownMenuChoiceItemVariants
>

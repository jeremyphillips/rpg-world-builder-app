'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { DropdownMenuItemContent } from './dropdown-menu-item-content'
import { DropdownMenuItem } from './dropdown-menu.client'
import {
  dropdownMenuChoiceItemVariants,
  type DropdownMenuChoiceItemVariantsProps,
} from './dropdown-menu-choice.variants'

export type MenuChoiceRowProps = Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem>,
  'children'
> & {
  heading: React.ReactNode
  supporting?: React.ReactNode
  supportingWrap?: boolean
  size?: NonNullable<DropdownMenuChoiceItemVariantsProps['size']>
}

/** Action menu row with optional description — `ui-menu-item` only, not for listboxes. */
export const MenuChoiceRow = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuItem>,
  MenuChoiceRowProps
>(function MenuChoiceRow(
  { heading, supporting, supportingWrap = false, size = 'md', className, disabled, ...props },
  ref,
) {
  return (
    <DropdownMenuItem
      ref={ref}
      disabled={disabled}
      className={cn(dropdownMenuChoiceItemVariants({ size }), className)}
      {...props}
    >
      <DropdownMenuItemContent
        label={heading}
        description={supporting}
        descriptionWrap={supportingWrap}
      />
    </DropdownMenuItem>
  )
})

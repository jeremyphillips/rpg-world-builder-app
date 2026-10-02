'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { DropdownMenuItem } from './dropdown-menu.client'
import { IdentityRow } from './identity-row.client'
import { identityRowHeadingVariants } from './identity-row.variants'
import { identityRowSizeFromInteractiveListSize } from './interactive-list.lib'
import type { InteractiveListSize } from './interactive-list.variants'
import {
  interactiveListRowChromeVariants,
  interactiveListRowMainVariants,
  menuChoiceItemResetVariants,
} from './interactive-list.variants'

export type MenuChoiceRowProps = Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem>,
  'children'
> & {
  heading: React.ReactNode
  supporting?: React.ReactNode
  supportingWrap?: boolean
  size?: InteractiveListSize
}

/** Action menu row — highlight from Radix `data-[highlighted]` only. Not for listboxes. */
export const MenuChoiceRow = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuItem>,
  MenuChoiceRowProps
>(function MenuChoiceRow(
  { heading, supporting, supportingWrap = false, size = 'md', className, disabled, ...props },
  ref,
) {
  const identitySize = identityRowSizeFromInteractiveListSize(size)
  const hasIdentityCopy = supporting != null && supporting !== ''

  return (
    <DropdownMenuItem
      ref={ref}
      disabled={disabled}
      className={cn(
        menuChoiceItemResetVariants(),
        interactiveListRowChromeVariants({ host: 'menuitem', interactive: false }),
        interactiveListRowMainVariants({ size, interactive: false }),
        className,
      )}
      {...props}
    >
      {hasIdentityCopy ? (
        <IdentityRow
          heading={heading}
          supporting={supporting}
          supportingWrap={supportingWrap}
          size={identitySize}
          className="min-w-0 flex-1 flex-none"
        />
      ) : (
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-left',
            identityRowHeadingVariants({ size: identitySize }),
          )}
        >
          {heading}
        </span>
      )}
    </DropdownMenuItem>
  )
})

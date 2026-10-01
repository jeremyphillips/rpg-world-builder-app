'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { ActionIcon } from './action-icon.client'

import { cn } from '../../lib/utils'
import { Button, type ButtonForwardingProps } from './button.client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.client'
import { IdentityRow } from './identity-row.client'
import {
  dropdownMenuChoiceContentClasses,
  dropdownMenuChoiceItemClasses,
} from './dropdown-menu-choice.variants'
import {
  splitButtonChevronIconClasses,
  splitButtonChevronVariants,
  splitButtonPrimaryVariants,
  splitButtonRootVariants,
} from './split-button.variants'

export type SplitButtonMenuItem = {
  id: string
  label: string
  description?: string
  disabled?: boolean
  onSelect: () => void
}

export type SplitButtonMenuGroup = {
  id: string
  label?: string
  items: readonly SplitButtonMenuItem[]
}

export type SplitButtonProps = Omit<ButtonForwardingProps, 'children'> & {
  label: string
  onPrimaryClick: () => void
  showLeadingIcon?: boolean
  menuGroups?: readonly SplitButtonMenuGroup[]
  menuAriaLabel?: string
}

export function SplitButton({
  label,
  onPrimaryClick,
  showLeadingIcon = true,
  menuGroups = [],
  menuAriaLabel,
  variant = 'outline',
  size = 'sm',
  density,
  disabled,
  className,
  ...props
}: SplitButtonProps) {
  const hasMenu = menuGroups.some((group) => group.items.length > 0)
  const menuItems = menuGroups.flatMap((group) => group.items)
  const useChoiceMenuLayout = menuItems.some((item) => item.description != null)
  const resolvedMenuAriaLabel = menuAriaLabel ?? `${label} shortcuts`

  return (
    <div className={cn(splitButtonRootVariants(), className)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        density={density}
        disabled={disabled}
        className={hasMenu ? splitButtonPrimaryVariants() : undefined}
        onClick={onPrimaryClick}
        {...props}
      >
        {showLeadingIcon ? <ActionIcon action="add" /> : null}
        {label}
      </Button>
      {hasMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={variant}
              size={size}
              density={density}
              disabled={disabled}
              className={splitButtonChevronVariants()}
              aria-label={resolvedMenuAriaLabel}
            >
              <ChevronDown className={splitButtonChevronIconClasses} aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={useChoiceMenuLayout ? cn(dropdownMenuChoiceContentClasses) : undefined}
          >
            {menuGroups.map((group, groupIndex) => (
              <React.Fragment key={group.id}>
                {groupIndex > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuGroup>
                  {group.label ? <DropdownMenuLabel>{group.label}</DropdownMenuLabel> : null}
                  {group.items.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className={
                        useChoiceMenuLayout ? cn(dropdownMenuChoiceItemClasses) : undefined
                      }
                      disabled={item.disabled}
                      onSelect={() => item.onSelect()}
                    >
                      {item.description ? (
                        <IdentityRow
                          heading={item.label}
                          supporting={item.description}
                          supportingWrap
                          size="md"
                          className="flex-none"
                        />
                      ) : (
                        item.label
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}

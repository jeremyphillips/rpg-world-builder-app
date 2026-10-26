'use client'
import { Icon } from './icon/icon'

import * as React from 'react'
import { ActionIcon } from './action-icon.client'

import { cn } from '../../lib/utils'
import { Button, type ButtonForwardingProps } from './button.client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.client'
import { MenuChoiceRow } from './menu-choice-row.client'
import { dropdownMenuChoiceContentClasses } from './dropdown-menu-choice.variants'
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
  disabled,
  className,
  ...props
}: SplitButtonProps) {
  const hasMenu = menuGroups.some((group) => group.items.length > 0)
  const menuItems = menuGroups.flatMap((group) => group.items)
  const useChoiceMenuLayout = menuItems.some((item) => item.description != null)
  const resolvedMenuAriaLabel = menuAriaLabel ?? `${label} shortcuts`

  return (
    <div className={cn('ui-split-button', className)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        className={hasMenu ? 'ui-split-button__primary' : undefined}
        onClick={onPrimaryClick}
        {...props}
      >
        {showLeadingIcon ? <ActionIcon action="add" size="lg" /> : null}
        {label}
      </Button>
      {hasMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={variant}
              size={size}
              disabled={disabled}
              className="ui-split-button__menu"
              aria-label={resolvedMenuAriaLabel}
            >
              <Icon name="chevron-down" size="sm" className="opacity-80" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={useChoiceMenuLayout ? cn(dropdownMenuChoiceContentClasses) : undefined}
          >
            {menuGroups.map((group, groupIndex) => (
              <React.Fragment key={group.id}>
                {groupIndex > 0 ? <DropdownMenuSeparator /> : null}
                {group.label ? <DropdownMenuLabel>{group.label}</DropdownMenuLabel> : null}
                {group.items.map((item) => (
                  <MenuChoiceRow
                    key={item.id}
                    heading={item.label}
                    supporting={item.description}
                    supportingWrap={item.description != null}
                    disabled={item.disabled}
                    onSelect={() => item.onSelect()}
                  />
                ))}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}

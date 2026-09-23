'use client'

import * as React from 'react'
import { ChevronDown, Plus } from 'lucide-react'

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
import {
  splitButtonChevronIconClasses,
  splitButtonChevronVariants,
  splitButtonPrimaryVariants,
  splitButtonRootVariants,
} from './split-button.variants'

export type SplitButtonMenuItem = {
  id: string
  label: string
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
        {showLeadingIcon ? <Plus aria-hidden /> : null}
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
          <DropdownMenuContent align="end">
            {menuGroups.map((group, groupIndex) => (
              <React.Fragment key={group.id}>
                {groupIndex > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuGroup>
                  {group.label ? <DropdownMenuLabel>{group.label}</DropdownMenuLabel> : null}
                  {group.items.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      disabled={item.disabled}
                      onSelect={() => item.onSelect()}
                    >
                      {item.label}
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

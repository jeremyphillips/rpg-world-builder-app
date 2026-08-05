'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@rpg/ui'

import {
  ORGANIZATION_FORWARD_CONNECTION_MENU_ITEMS,
  type OrganizationConnectionDrawerIntent,
} from '../../lib/location-connection-drawer-intent'

export const ORGANIZATION_LOCATION_CONNECTION_ADD_BUTTON_LABEL = 'Add connection'

export type OrganizationLocationConnectionAddMenuProps = {
  disabled?: boolean
  availableIntents?: readonly OrganizationConnectionDrawerIntent[]
  onSelectIntent: (intent: OrganizationConnectionDrawerIntent) => void
}

export function OrganizationLocationConnectionAddMenu({
  disabled = false,
  availableIntents,
  onSelectIntent,
}: OrganizationLocationConnectionAddMenuProps) {
  const menuItems = availableIntents
    ? ORGANIZATION_FORWARD_CONNECTION_MENU_ITEMS.filter((item) =>
        availableIntents.includes(item.intent),
      )
    : ORGANIZATION_FORWARD_CONNECTION_MENU_ITEMS

  if (menuItems.length === 0) {
    return null
  }

  if (menuItems.length === 1) {
    const [onlyItem] = menuItems
    if (!onlyItem) return null

    return (
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => onSelectIntent(onlyItem.intent)}
      >
        {onlyItem.label}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled}>
          {ORGANIZATION_LOCATION_CONNECTION_ADD_BUTTON_LABEL}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menuItems.map((item) => (
          <DropdownMenuItem key={item.intent} onSelect={() => onSelectIntent(item.intent)}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

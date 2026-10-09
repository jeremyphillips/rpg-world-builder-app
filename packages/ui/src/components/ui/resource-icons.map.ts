import { Coins, Gem } from 'lucide-react'

import type { AppIcon } from './app-icon.types'

export const RESOURCE_ICON_ROLES = ['currency', 'magicItem'] as const

export type ResourceIconRole = (typeof RESOURCE_ICON_ROLES)[number]

/** Closed resource role → glyph map. Not catalog identity and not an action verb. */
export const RESOURCE_ICONS = {
  currency: Coins,
  magicItem: Gem,
} as const satisfies Record<ResourceIconRole, AppIcon>

export function resourceIcon(role: ResourceIconRole): AppIcon {
  return RESOURCE_ICONS[role]
}

import type { IconName } from './icon/icon-glyphs'

export const RESOURCE_ICON_ROLES = ['currency', 'magicItem'] as const

export type ResourceIconRole = (typeof RESOURCE_ICON_ROLES)[number]

/** Closed resource role → glyph name. Not catalog identity and not an action verb. */
export const RESOURCE_ICONS = {
  currency: 'coins',
  magicItem: 'gem',
} as const satisfies Record<ResourceIconRole, IconName>

export function resourceIcon(role: ResourceIconRole): IconName {
  return RESOURCE_ICONS[role]
}

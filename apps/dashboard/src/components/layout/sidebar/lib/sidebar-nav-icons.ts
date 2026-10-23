import { contentIdentityIcon, type IconName } from '@rpg/ui'

import type { SidebarNavItem } from './sidebar-nav-model'

export const SIDEBAR_NAV_ICONS = {
  dashboard: 'layout-dashboard',
  campaigns: contentIdentityIcon('campaign'),
  messages: 'message-square',
  characters: contentIdentityIcon('character'),
  'name-generator': 'dices',
  overview: 'layout-dashboard',
  sessions: 'calendar-days',
  npcs: contentIdentityIcon('npc'),
  organizations: contentIdentityIcon('organization'),
  locations: contentIdentityIcon('location'),
  homebrew: 'flask-conical',
  'game-terms': contentIdentityIcon('game-term'),
  'campaign-settings': 'settings-sliders',
  classes: contentIdentityIcon('class'),
  spells: contentIdentityIcon('spell'),
  species: contentIdentityIcon('species'),
  feats: contentIdentityIcon('feat'),
  equipment: contentIdentityIcon('equipment'),
  'skill-proficiencies': contentIdentityIcon('skill-proficiency'),
  monsters: contentIdentityIcon('monster'),
  'admin-users': 'users',
  'admin-settings': 'shield-check',
} as const satisfies Record<string, IconName>

export type SidebarNavIconId = keyof typeof SIDEBAR_NAV_ICONS

export function sidebarNavItem(
  item: Omit<SidebarNavItem, 'icon'> & { id: SidebarNavIconId },
): SidebarNavItem {
  return { ...item, icon: SIDEBAR_NAV_ICONS[item.id] }
}

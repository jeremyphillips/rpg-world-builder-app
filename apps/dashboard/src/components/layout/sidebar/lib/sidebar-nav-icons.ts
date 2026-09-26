import {
  CalendarDays,
  Dices,
  FlaskConical,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { contentIdentityIcon } from '@rpg/ui'

import type { SidebarNavItem } from './sidebar-nav-model'

export const SIDEBAR_NAV_ICONS = {
  dashboard: LayoutDashboard,
  campaigns: contentIdentityIcon('campaign'),
  messages: MessageSquare,
  characters: contentIdentityIcon('character'),
  'name-generator': Dices,
  overview: LayoutDashboard,
  sessions: CalendarDays,
  npcs: contentIdentityIcon('npc'),
  organizations: contentIdentityIcon('organization'),
  locations: contentIdentityIcon('location'),
  homebrew: FlaskConical,
  'game-terms': contentIdentityIcon('game-term'),
  'campaign-settings': Settings2,
  classes: contentIdentityIcon('class'),
  spells: contentIdentityIcon('spell'),
  species: contentIdentityIcon('species'),
  feats: contentIdentityIcon('feat'),
  equipment: contentIdentityIcon('equipment'),
  'skill-proficiencies': contentIdentityIcon('skill-proficiency'),
  'admin-users': Users,
  'admin-settings': ShieldCheck,
} as const satisfies Record<string, LucideIcon>

export type SidebarNavIconId = keyof typeof SIDEBAR_NAV_ICONS

export function sidebarNavItem(
  item: Omit<SidebarNavItem, 'icon'> & { id: SidebarNavIconId },
): SidebarNavItem {
  return { ...item, icon: SIDEBAR_NAV_ICONS[item.id] }
}

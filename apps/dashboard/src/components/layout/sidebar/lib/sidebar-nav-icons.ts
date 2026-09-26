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

import { CONTENT_DISPLAY_FALLBACK_ICONS } from '@rpg/ui'

import type { SidebarNavItem } from './sidebar-nav-model'

export const SIDEBAR_NAV_ICONS = {
  dashboard: LayoutDashboard,
  campaigns: CONTENT_DISPLAY_FALLBACK_ICONS.campaign,
  messages: MessageSquare,
  characters: CONTENT_DISPLAY_FALLBACK_ICONS.character,
  'name-generator': Dices,
  overview: LayoutDashboard,
  sessions: CalendarDays,
  npcs: CONTENT_DISPLAY_FALLBACK_ICONS.npc,
  organizations: CONTENT_DISPLAY_FALLBACK_ICONS.organization,
  locations: CONTENT_DISPLAY_FALLBACK_ICONS.location,
  homebrew: FlaskConical,
  'game-terms': CONTENT_DISPLAY_FALLBACK_ICONS['game-term'],
  'campaign-settings': Settings2,
  classes: CONTENT_DISPLAY_FALLBACK_ICONS.class,
  spells: CONTENT_DISPLAY_FALLBACK_ICONS.spell,
  species: CONTENT_DISPLAY_FALLBACK_ICONS.species,
  feats: CONTENT_DISPLAY_FALLBACK_ICONS.feat,
  equipment: CONTENT_DISPLAY_FALLBACK_ICONS.equipment,
  'skill-proficiencies': CONTENT_DISPLAY_FALLBACK_ICONS['skill-proficiency'],
  'admin-users': Users,
  'admin-settings': ShieldCheck,
} as const satisfies Record<string, LucideIcon>

export type SidebarNavIconId = keyof typeof SIDEBAR_NAV_ICONS

export function sidebarNavItem(
  item: Omit<SidebarNavItem, 'icon'> & { id: SidebarNavIconId },
): SidebarNavItem {
  return { ...item, icon: SIDEBAR_NAV_ICONS[item.id] }
}

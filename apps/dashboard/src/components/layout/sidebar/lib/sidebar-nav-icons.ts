import {
  Backpack,
  BookOpen,
  CalendarDays,
  Castle,
  Dices,
  Dna,
  Drama,
  FlaskConical,
  Landmark,
  MessageSquare,
  LayoutDashboard,
  ListChecks,
  Medal,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'

import type { SidebarNavItem } from './sidebar-nav-model'

export const SIDEBAR_NAV_ICONS = {
  dashboard: LayoutDashboard,
  campaigns: Castle,
  messages: MessageSquare,
  characters: UserRound,
  'name-generator': Dices,
  overview: LayoutDashboard,
  sessions: CalendarDays,
  npcs: Drama,
  organizations: Landmark,
  homebrew: FlaskConical,
  'campaign-settings': Settings2,
  classes: BookOpen,
  spells: Sparkles,
  species: Dna,
  feats: Medal,
  equipment: Backpack,
  'skill-proficiencies': ListChecks,
  'admin-users': Users,
  'admin-settings': ShieldCheck,
} as const satisfies Record<string, LucideIcon>

export type SidebarNavIconId = keyof typeof SIDEBAR_NAV_ICONS

export function sidebarNavItem(
  item: Omit<SidebarNavItem, 'icon'> & { id: SidebarNavIconId },
): SidebarNavItem {
  return { ...item, icon: SIDEBAR_NAV_ICONS[item.id] }
}

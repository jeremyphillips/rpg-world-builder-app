import { createElement, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Clock,
  Flag,
  ListChecks,
  Network,
  Scale,
  Sparkle,
  Sparkles,
  Tags,
  Target,
  Trees,
  User,
} from 'lucide-react'
import type { TabbedFormTab } from '@rpg/ui/form'

export const CONTENT_FORM_TAB_ICONS = {
  basics: BookOpen,
  proficiencies: ListChecks,
  spellcasting: Sparkles,
  features: Flag,
  subclasses: Network,
  characterCreation: User,
  traits: Sparkle,
  heritage: Trees,
  rules: Scale,
  casting: Clock,
  resolution: Target,
  tags: Tags,
} as const satisfies Record<string, LucideIcon>

export type ContentFormTabIconId = keyof typeof CONTENT_FORM_TAB_ICONS

export function contentFormTabLeadingIcon(tabId: string): ReactNode | undefined {
  const Icon = CONTENT_FORM_TAB_ICONS[tabId as ContentFormTabIconId]
  if (!Icon) return undefined
  return createElement(Icon, { 'aria-hidden': true })
}

export function withContentFormTabIcon(tab: TabbedFormTab): TabbedFormTab {
  return { ...tab, leadingIcon: contentFormTabLeadingIcon(tab.id) }
}

import { createElement, type ReactNode } from 'react'
import { BookOpen, Clock, Flag, Network, Scale, Sparkle, Target, Trees } from 'lucide-react'
import { contentIdentityIcon, type AppIcon } from '@rpg/ui'
import type { TabbedFormTab } from '@rpg/ui/form'

export const CONTENT_FORM_TAB_ICONS = {
  basics: BookOpen,
  proficiencies: contentIdentityIcon('skill-proficiency'),
  spellcasting: contentIdentityIcon('spell'),
  features: Flag,
  subclasses: Network,
  characterCreation: contentIdentityIcon('character'),
  traits: Sparkle,
  heritage: Trees,
  rules: Scale,
  casting: Clock,
  resolution: Target,
  tags: contentIdentityIcon('game-term'),
} as const satisfies Record<string, AppIcon>

export type ContentFormTabIconId = keyof typeof CONTENT_FORM_TAB_ICONS

export function contentFormTabLeadingIcon(tabId: string): ReactNode | undefined {
  const Icon = CONTENT_FORM_TAB_ICONS[tabId as ContentFormTabIconId]
  if (!Icon) return undefined
  return createElement(Icon, { 'aria-hidden': true })
}

export function withContentFormTabIcon(tab: TabbedFormTab): TabbedFormTab {
  return { ...tab, leadingIcon: contentFormTabLeadingIcon(tab.id) }
}

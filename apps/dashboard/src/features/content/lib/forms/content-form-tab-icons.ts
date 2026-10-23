import { createElement, type ReactNode } from 'react'
import { contentIdentityIcon, Icon, type IconName } from '@rpg/ui'
import type { TabbedFormTab } from '@rpg/ui/form'

export const CONTENT_FORM_TAB_ICONS = {
  basics: 'book-open',
  proficiencies: contentIdentityIcon('skill-proficiency'),
  spellcasting: contentIdentityIcon('spell'),
  features: 'flag',
  subclasses: 'network',
  characterCreation: contentIdentityIcon('character'),
  traits: 'sparkle',
  heritage: 'trees',
  rules: 'scale',
  casting: 'clock',
  resolution: 'target',
  tags: contentIdentityIcon('game-term'),
  identity: contentIdentityIcon('monster'),
  statistics: 'gauge',
  creatureDetails: contentIdentityIcon('species'),
  equipment: contentIdentityIcon('equipment'),
  actions: 'swords',
} as const satisfies Record<string, IconName>

export type ContentFormTabIconId = keyof typeof CONTENT_FORM_TAB_ICONS

export function contentFormTabLeadingIcon(tabId: string): ReactNode | undefined {
  const name = CONTENT_FORM_TAB_ICONS[tabId as ContentFormTabIconId]
  if (!name) return undefined
  return createElement(Icon, { name, size: 'sm' })
}

export function withContentFormTabIcon(tab: TabbedFormTab): TabbedFormTab {
  return { ...tab, leadingIcon: contentFormTabLeadingIcon(tab.id) }
}

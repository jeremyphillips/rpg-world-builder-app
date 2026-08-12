import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

export const ORGANIZATION_ACTIVITY_TERM = {
  label: 'Organization Activity',
  description: 'Sustained work, trade, mission, or practice performed by an organization.',
  sentence: {
    singular: 'organization activity',
    plural: 'organization activities',
  },
} as const satisfies VocabularyTerm

export const ORGANIZATION_ACTIVITY_ENTRIES = {
  blacksmithing: {
    label: 'Blacksmithing',
    description: 'Forging, shaping, and repairing iron or steel goods.',
  },
  brewing: {
    label: 'Brewing',
    description: 'Producing beer, ale, or other brewed beverages.',
  },
  worship: {
    label: 'Worship',
    description: 'Conducting or supporting religious devotion and ceremony.',
  },
} as const satisfies Record<string, GameTermEntry>

export type OrganizationActivity = keyof typeof ORGANIZATION_ACTIVITY_ENTRIES

export const ORGANIZATION_ACTIVITY_IDS = keysFromEntries(ORGANIZATION_ACTIVITY_ENTRIES)

export const organizationActivitySchema = vocabEnumFromEntries(ORGANIZATION_ACTIVITY_ENTRIES)

export function getOrganizationActivityEntry(id: string): GameTermEntry | undefined {
  return ORGANIZATION_ACTIVITY_ENTRIES[id as OrganizationActivity]
}

export function getOrganizationActivityLabel(id: string): string {
  return getOrganizationActivityEntry(id)?.label ?? id
}

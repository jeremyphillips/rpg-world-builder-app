import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

export const ORGANIZATION_KIND_TERM = {
  label: 'Organization Kind',
  description: 'The primary purpose or structure of an organization.',
  sentence: {
    singular: 'organization kind',
    plural: 'organization kinds',
  },
} as const satisfies VocabularyTerm

export const ORGANIZATION_KIND_ENTRIES = {
  government: {
    label: 'Government',
    description: 'A kingdom, council, administration, or other governing body.',
  },
  political: {
    label: 'Political',
    description: 'A party, movement, court, or noble bloc pursuing political influence.',
  },
  religious: {
    label: 'Religious',
    description: 'A church, cult, temple, holy order, or other faith-based organization.',
  },
  military: {
    label: 'Military',
    description: 'An army, guard, militia, martial order, or other armed organization.',
  },
  criminal: {
    label: 'Criminal',
    description: 'A syndicate, gang, smuggling ring, or thieves’ guild.',
  },
  commercial: {
    label: 'Commercial',
    description: 'A company, merchant house, or trade consortium organized for commerce.',
  },
  professional: {
    label: 'Guild or professional',
    description: 'A guild, trade group, union, or occupational association.',
  },
  academic: {
    label: 'Academic',
    description: 'A school, college, library, or learned society.',
  },
  community: {
    label: 'Community',
    description: 'A clan, mutual-aid group, neighborhood association, or civic group.',
  },
  other: {
    label: 'Other',
    description: 'An organization with no useful primary-purpose match.',
  },
} as const satisfies Record<string, GameTermEntry>

export type OrganizationKind = keyof typeof ORGANIZATION_KIND_ENTRIES

export const ORGANIZATION_KIND_IDS = keysFromEntries(ORGANIZATION_KIND_ENTRIES)

export const organizationKindSchema = vocabEnumFromEntries(ORGANIZATION_KIND_ENTRIES)

/** Returns the reference entry for an organization kind id, if known. */
export function getOrganizationKindEntry(id: string): GameTermEntry | undefined {
  return ORGANIZATION_KIND_ENTRIES[id as OrganizationKind]
}

/** Returns the display label for an organization kind. Falls back to the raw id. */
export function getOrganizationKindLabel(id: string): string {
  return getOrganizationKindEntry(id)?.label ?? id
}

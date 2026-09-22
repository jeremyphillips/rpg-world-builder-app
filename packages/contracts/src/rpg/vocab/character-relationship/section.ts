import { type z } from 'zod'

import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const CHARACTER_RELATIONSHIP_SECTION_TERM = {
  label: 'Relationship section',
  description:
    'UI grouping for character relationship kinds in the connections step and detail sheet.',
  sentence: {
    singular: 'relationship section',
    plural: 'relationship sections',
  },
} as const satisfies VocabularyTerm

export const CHARACTER_RELATIONSHIP_SECTION_ENTRIES = {
  'people.family': {
    label: 'Family',
    description: 'Parent, child, sibling, and other family relationships.',
  },
  'people.social': {
    label: 'Social',
    description: 'Partners, mentors, rivals, and other social relationships.',
  },
  organizations: {
    label: 'Organizations',
    description: 'Membership in campaign organizations.',
  },
  places: {
    label: 'Places',
    description: 'Hometown, birthplace, and other place associations.',
  },
  property: {
    label: 'Property',
    description: 'Ownership, residence, tenancy, and operational presence at locations.',
  },
} as const satisfies Record<string, GameTermEntry>

export const CHARACTER_RELATIONSHIP_SECTION_IDS = keysFromEntries(
  CHARACTER_RELATIONSHIP_SECTION_ENTRIES,
)

export const characterRelationshipSectionSchema = vocabEnumFromEntries(
  CHARACTER_RELATIONSHIP_SECTION_ENTRIES,
)

export type CharacterRelationshipSection = z.infer<typeof characterRelationshipSectionSchema>

export function getCharacterRelationshipSectionLabel(id: string): string {
  return CHARACTER_RELATIONSHIP_SECTION_ENTRIES[id as CharacterRelationshipSection]?.label ?? id
}

import { type z } from 'zod'

import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const CHARACTER_RELATIONSHIP_LIFECYCLE_TERM = {
  label: 'Relationship lifecycle',
  description:
    'Whether a relationship is currently active or has ended. Applies to membership, residence, ownership, and social roles — not enduring facts like parentage or birthplace.',
  sentence: {
    singular: 'relationship lifecycle',
    plural: 'relationship lifecycles',
  },
} as const satisfies VocabularyTerm

export const CHARACTER_RELATIONSHIP_LIFECYCLE_ENTRIES = {
  current: {
    label: 'Current',
    description: 'The relationship is active now.',
  },
  former: {
    label: 'Former',
    description: 'The relationship has ended but remains part of the character history.',
  },
} as const satisfies Record<string, GameTermEntry>

export const CHARACTER_RELATIONSHIP_LIFECYCLE_IDS = keysFromEntries(
  CHARACTER_RELATIONSHIP_LIFECYCLE_ENTRIES,
)

export const characterRelationshipLifecycleSchema = vocabEnumFromEntries(
  CHARACTER_RELATIONSHIP_LIFECYCLE_ENTRIES,
)

export type CharacterRelationshipLifecycle = z.infer<typeof characterRelationshipLifecycleSchema>

export function getCharacterRelationshipLifecycleLabel(id: string): string {
  return CHARACTER_RELATIONSHIP_LIFECYCLE_ENTRIES[id as CharacterRelationshipLifecycle]?.label ?? id
}

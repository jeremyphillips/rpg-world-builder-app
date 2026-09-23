import { type z } from 'zod'

import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const CHARACTER_RELATIONSHIP_REFERENCE_STATUS_TERM = {
  label: 'Relationship reference status',
  description:
    'Whether the relationship target resolved for the viewer. Internal diagnostics distinguish unavailable, deleted, and inaccessible targets.',
  sentence: {
    singular: 'relationship reference status',
    plural: 'relationship reference statuses',
  },
} as const satisfies VocabularyTerm

export const CHARACTER_RELATIONSHIP_REFERENCE_STATUS_ENTRIES = {
  resolved: {
    label: 'Resolved',
    description: 'The relationship target is available to the viewer.',
  },
  unavailable: {
    label: 'Unavailable',
    description: 'The relationship target could not be loaded.',
  },
  deleted: {
    label: 'Deleted',
    description: 'The relationship target no longer exists.',
  },
  inaccessible: {
    label: 'Inaccessible',
    description: 'The relationship target exists but is not visible to the viewer.',
  },
} as const satisfies Record<string, GameTermEntry>

export const CHARACTER_RELATIONSHIP_REFERENCE_STATUS_IDS = keysFromEntries(
  CHARACTER_RELATIONSHIP_REFERENCE_STATUS_ENTRIES,
)

export const characterRelationshipReferenceStatusSchema = vocabEnumFromEntries(
  CHARACTER_RELATIONSHIP_REFERENCE_STATUS_ENTRIES,
)

export type CharacterRelationshipReferenceStatus = z.infer<
  typeof characterRelationshipReferenceStatusSchema
>

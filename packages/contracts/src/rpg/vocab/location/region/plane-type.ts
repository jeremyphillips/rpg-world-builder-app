import { keysFromEntries, vocabEnumFromEntries } from '../../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../../types'

export const PLANE_TYPE_TERM = {
  label: 'Plane Type',
  description: 'The cosmological category of a plane.',
  sentence: {
    singular: 'plane type',
    plural: 'plane types',
  },
} as const satisfies VocabularyTerm

export const PLANE_TYPE_ENTRIES = {
  material: {
    label: 'Material',
    description: 'The Material Plane or a closely analogous prime world.',
  },
  inner: {
    label: 'Inner',
    description: 'An Inner Plane, such as an Elemental Plane.',
  },
  outer: {
    label: 'Outer',
    description: 'An Outer Plane aligned with a moral or philosophical axis.',
  },
  transitive: {
    label: 'Transitive',
    description: 'A Transitive Plane, such as the Astral, Ethereal, or Shadow.',
  },
  demiplane: {
    label: 'Demiplane',
    description: 'A self-contained extradimensional space.',
  },
  domain: {
    label: 'Domain',
    description: 'A bounded realm such as a Domain of Dread.',
  },
} as const satisfies Record<string, GameTermEntry>

export type PlaneType = keyof typeof PLANE_TYPE_ENTRIES

export const PLANE_TYPE_IDS = keysFromEntries(PLANE_TYPE_ENTRIES)

export const planeTypeSchema = vocabEnumFromEntries(PLANE_TYPE_ENTRIES)

/** Returns the reference entry for a plane type id, if known. */
export function getPlaneTypeEntry(id: string): GameTermEntry | undefined {
  return PLANE_TYPE_ENTRIES[id as PlaneType]
}

/** Returns the display label for a plane type. Falls back to the raw id. */
export function getPlaneTypeLabel(id: string): string {
  return getPlaneTypeEntry(id)?.label ?? id
}

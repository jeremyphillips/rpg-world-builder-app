import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

export const REST_KIND_TERM = {
  label: 'Rest',
  description: 'A recovery period that can restore a limited use.',
  sentence: {
    singular: 'rest',
    plural: 'rests',
  },
} as const satisfies VocabularyTerm

export const REST_KIND_ENTRIES = {
  short: {
    label: 'Short Rest',
    description: 'A shorter recovery period. A long rest also meets a short-rest threshold.',
  },
  long: {
    label: 'Long Rest',
    description: 'The most complete recovery period.',
  },
} as const satisfies Record<string, GameTermEntry>

export type RestKind = keyof typeof REST_KIND_ENTRIES

/** Least to most complete. Order lives in code; ranks are never persisted. */
export const REST_KINDS = ['short', 'long'] as const satisfies readonly RestKind[]

export const restKindSchema = vocabEnumFromEntries(REST_KIND_ENTRIES)

export const REST_KIND_IDS = keysFromEntries(REST_KIND_ENTRIES)

export function getRestKindEntry(id: string): GameTermEntry | undefined {
  return REST_KIND_ENTRIES[id as RestKind]
}

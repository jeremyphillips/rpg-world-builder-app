import { z } from 'zod'

import type { GameTermEntry, VocabularyTerm } from '../types'
import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'

import { spellCollectionKindSchema, type SpellCollectionKind } from './spell-collection-kind'

// ---------------------------------------------------------------------------
// Spell choice source — where eligible spells come from when making a selection.
// ---------------------------------------------------------------------------

export const SPELL_CHOICE_SOURCE_TERM = {
  label: 'Spell Choice Source',
  description: 'Where eligible spells come from for a choice progression.',
  sentence: {
    singular: 'spell choice source',
    plural: 'spell choice sources',
  },
} as const satisfies VocabularyTerm

export const SPELL_CHOICE_SOURCE_KIND_ENTRIES = {
  classList: {
    label: 'Class spell list',
    description: 'Spells on the class spell list (via spell.classIds).',
  },
  collection: {
    label: 'Spell collection',
    description: 'Spells already stored in another spell collection on the character.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellChoiceSourceKind = keyof typeof SPELL_CHOICE_SOURCE_KIND_ENTRIES

export const SPELL_CHOICE_SOURCE_KINDS = keysFromEntries(SPELL_CHOICE_SOURCE_KIND_ENTRIES)

export const spellChoiceSourceKindSchema = vocabEnumFromEntries(SPELL_CHOICE_SOURCE_KIND_ENTRIES)

export const spellChoiceSourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('classList') }),
  z.object({
    kind: z.literal('collection'),
    collection: spellCollectionKindSchema,
  }),
])

export type SpellChoiceSource = z.infer<typeof spellChoiceSourceSchema>

export function spellChoiceSourceFromCollection(
  collection: SpellCollectionKind,
): SpellChoiceSource {
  return { kind: 'collection', collection }
}

export const CLASS_LIST_SPELL_CHOICE_SOURCE = {
  kind: 'classList',
} as const satisfies SpellChoiceSource

export function getSpellChoiceSourceKindEntry(id: string): GameTermEntry | undefined {
  return SPELL_CHOICE_SOURCE_KIND_ENTRIES[id as SpellChoiceSourceKind]
}

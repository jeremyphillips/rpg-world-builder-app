import type { GameTermEntry, VocabularyTerm } from '../types'
import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'

// ---------------------------------------------------------------------------
// Spell collection kind — where spell selections are stored on a character.
// Schema semantics only; game-facing labels live on presentation config.
// ---------------------------------------------------------------------------

export const SPELL_COLLECTION_KIND_TERM = {
  label: 'Spell Collection',
  description: 'Persistent or mutable spell selection storage on a character.',
  sentence: {
    singular: 'spell collection',
    plural: 'spell collections',
  },
} as const satisfies VocabularyTerm

export const SPELL_COLLECTION_KIND_ENTRIES = {
  cantrips: {
    label: 'Cantrips',
    description: 'Known cantrip selections.',
  },
  repertoire: {
    label: 'Repertoire',
    description: 'Durable spell repertoire that expands at level-up.',
  },
  prepared: {
    label: 'Prepared loadout',
    description: 'Currently prepared spells available to cast.',
  },
  spellbook: {
    label: 'Spellbook',
    description: 'Durable learned spells from which prepared loadouts may be chosen.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellCollectionKind = keyof typeof SPELL_COLLECTION_KIND_ENTRIES

export const SPELL_COLLECTION_KINDS = keysFromEntries(SPELL_COLLECTION_KIND_ENTRIES)

export const spellCollectionKindSchema = vocabEnumFromEntries(SPELL_COLLECTION_KIND_ENTRIES)

/** Collections that persist spell selections across rests. */
export const PERSISTENT_SPELL_COLLECTION_KINDS = [
  'cantrips',
  'repertoire',
  'spellbook',
] as const satisfies readonly SpellCollectionKind[]

export function isPersistentSpellCollectionKind(
  kind: SpellCollectionKind,
): kind is (typeof PERSISTENT_SPELL_COLLECTION_KINDS)[number] {
  return (PERSISTENT_SPELL_COLLECTION_KINDS as readonly string[]).includes(kind)
}

export function getSpellCollectionKindEntry(id: string): GameTermEntry | undefined {
  return SPELL_COLLECTION_KIND_ENTRIES[id as SpellCollectionKind]
}

export function getSpellCollectionKindLabel(id: string): string {
  return getSpellCollectionKindEntry(id)?.label ?? id
}

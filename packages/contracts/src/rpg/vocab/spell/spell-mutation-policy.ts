import { z } from 'zod'

import type { GameTermEntry, VocabularyTerm } from '../types'
import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'

// ---------------------------------------------------------------------------
// Spell mutation policy — when and how existing selections may change.
// Composed from orthogonal fields, not one enum per SRD rule combination.
// ---------------------------------------------------------------------------

export const SPELL_MUTATION_POLICY_TERM = {
  label: 'Spell Mutation Policy',
  description: 'When and how existing spell selections may change.',
  sentence: {
    singular: 'spell mutation policy',
    plural: 'spell mutation policies',
  },
} as const satisfies VocabularyTerm

export const SPELL_MUTATION_TRIGGER_ENTRIES = {
  levelUp: {
    label: 'Level up',
    description: 'When the character gains a class level.',
  },
  longRest: {
    label: 'Long rest',
    description: 'When the character finishes a long rest.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellMutationTrigger = keyof typeof SPELL_MUTATION_TRIGGER_ENTRIES

export const SPELL_MUTATION_TRIGGERS = keysFromEntries(SPELL_MUTATION_TRIGGER_ENTRIES)

export const spellMutationTriggerSchema = vocabEnumFromEntries(SPELL_MUTATION_TRIGGER_ENTRIES)

export const SPELL_MUTATION_OPERATION_ENTRIES = {
  replace: {
    label: 'Replace',
    description: 'Replace existing selection(s) with new choice(s).',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellMutationOperation = keyof typeof SPELL_MUTATION_OPERATION_ENTRIES

export const spellMutationOperationSchema = vocabEnumFromEntries(SPELL_MUTATION_OPERATION_ENTRIES)

export const spellMutationReplaceLimitSchema = z.union([z.number().int().min(1), z.literal('all')])

export type SpellMutationReplaceLimit = z.infer<typeof spellMutationReplaceLimitSchema>

export const spellMutationPolicySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('none') }),
  z.object({
    kind: z.literal('replace'),
    trigger: spellMutationTriggerSchema,
    limit: spellMutationReplaceLimitSchema,
  }),
])

export type SpellMutationPolicy = z.infer<typeof spellMutationPolicySchema>

export const IMMUTABLE_SPELL_MUTATION = { kind: 'none' } as const satisfies SpellMutationPolicy

export function getSpellMutationTriggerEntry(id: string): GameTermEntry | undefined {
  return SPELL_MUTATION_TRIGGER_ENTRIES[id as SpellMutationTrigger]
}

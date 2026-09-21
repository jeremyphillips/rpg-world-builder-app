import { z } from 'zod'

import { spellMutationPolicySchema } from '../../../vocab/spell/spell-mutation-policy'

import { classGainProgressionSchema } from './class-gain-progression'

// ---------------------------------------------------------------------------
// Class spell selection — semantic L1+ rules without embedded capacity curves.
// ---------------------------------------------------------------------------

/** Persistent collections a class may prepare spells from (seed: spellbook). */
export const learnedSpellCollectionKindSchema = z.enum(['spellbook'])

export type LearnedSpellCollectionKind = z.infer<typeof learnedSpellCollectionKindSchema>

export const classSpellSelectionSchema = z.discriminatedUnion('model', [
  z.object({
    model: z.literal('limitedRepertoire'),
    change: spellMutationPolicySchema,
    columnLabel: z.string().min(1).optional(),
  }),
  z.object({
    model: z.literal('prepareFromClassList'),
    change: spellMutationPolicySchema,
    columnLabel: z.string().min(1).optional(),
  }),
  z.object({
    model: z.literal('prepareFromLearnedCollection'),
    collection: learnedSpellCollectionKindSchema,
    acquisition: classGainProgressionSchema,
    change: spellMutationPolicySchema,
    columnLabel: z.string().min(1).optional(),
  }),
])

export type ClassSpellSelection = z.infer<typeof classSpellSelectionSchema>

/** Default column label for L1+ capacity columns (2024 SRD wording). */
export const DEFAULT_SPELL_SELECTION_COLUMN_LABEL = 'Prepared Spells' as const

export function resolveSpellSelectionColumnLabel(
  spellSelection: Pick<ClassSpellSelection, 'columnLabel'> | undefined,
): string {
  return spellSelection?.columnLabel ?? DEFAULT_SPELL_SELECTION_COLUMN_LABEL
}

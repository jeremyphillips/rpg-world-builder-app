import type { VocabularyTerm } from '@rpg/contracts'

/** Counted noun vocabulary for a master-detail collection row. */
export type MasterDetailItemNounTerm = VocabularyTerm

export function defineMasterDetailItemNoun(input: {
  label: string
  singular: string
  plural?: string
  description?: string
}): MasterDetailItemNounTerm {
  return {
    label: input.label,
    description: input.description ?? `${input.label} row in a master-detail editor.`,
    sentence: {
      singular: input.singular,
      plural: input.plural,
    },
  }
}

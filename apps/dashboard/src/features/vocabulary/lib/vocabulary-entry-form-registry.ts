import type { VocabularyOptionSetId } from '@rpg/contracts'
import { vocabularySetIdsRequiringFormDefinition } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { buildVocabularyEntrySheetFields } from './vocabulary-entry-form-fields'

export type VocabularyEntryFormDefinition = {
  createFields: FormItem[]
  editFields: FormItem[]
}

const registrySheetFields = buildVocabularyEntrySheetFields({
  groupId: 'vocabulary-entry-registry',
  pending: false,
  available: true,
})

/** Partial registry — only sets with create/edit capabilities register form defs. */
export const VOCABULARY_ENTRY_FORM_REGISTRY: Partial<
  Record<VocabularyOptionSetId, VocabularyEntryFormDefinition>
> = {
  'creature-types': {
    createFields: registrySheetFields,
    editFields: registrySheetFields,
  },
}

export function getVocabularyEntryFormDefinition(
  setId: VocabularyOptionSetId,
): VocabularyEntryFormDefinition | undefined {
  return VOCABULARY_ENTRY_FORM_REGISTRY[setId]
}

/** Asserts every create/edit-enabled set has a registered form definition. */
export function assertVocabularyFormRegistryCoverage(): void {
  for (const setId of vocabularySetIdsRequiringFormDefinition()) {
    if (!VOCABULARY_ENTRY_FORM_REGISTRY[setId]) {
      throw new Error(`Missing vocabulary form definition for "${setId}".`)
    }
  }
}

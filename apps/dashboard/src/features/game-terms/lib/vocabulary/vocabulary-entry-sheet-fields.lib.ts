import { createElement } from 'react'
import type {
  VocabularyOptionSetId,
  VocabularyOptionWithUsage,
  VocabularyUsageReference,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { UsageReferencesSection } from '@/lib/usage-references/usage-references-section'

import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import {
  buildVocabularyEntrySheetFields,
  requireVocabularyEntryFormDefinition,
  vocabularyAvailableFromStatus,
} from '@/features/vocabulary'
import { languageMultiComboboxField } from '@/lib/forms/language-combobox-form-fields.lib'

export function buildVocabularyEntrySheetFieldItems(input: {
  setId: VocabularyOptionSetId
  campaignId: string
  groupId: string
  isEdit: boolean
  isPending: boolean
  entry?: VocabularyOptionWithUsage
  usageResolution: boolean
  references: VocabularyUsageReference[]
  languageOptions?: FieldOption[]
}): FormItem[] {
  requireVocabularyEntryFormDefinition(input.setId)

  const availabilityFields = buildVocabularyEntrySheetFields({
    groupId: input.groupId,
    pending: input.isPending,
    available: input.entry ? vocabularyAvailableFromStatus(input.entry.status) : true,
  })

  const creatureTypeFields =
    input.setId === CREATURE_TYPE_SET_ID
      ? [
          languageMultiComboboxField({
            name: 'languageAffinities',
            label: 'Language affinities',
            hint: 'Choose languages broadly associated with this creature type. Leave blank when languages vary by species, as with Humanoids. These are recommendations in monster creation, not automatic grants.',
            options: input.languageOptions ?? [],
          }),
        ]
      : []

  const sheetFields = [
    ...availabilityFields.slice(0, 2),
    ...creatureTypeFields,
    ...availabilityFields.slice(2),
  ]

  if (!input.isEdit || !input.usageResolution) {
    return sheetFields
  }

  return [
    ...sheetFields,
    {
      kind: 'slot' as const,
      name: 'usageReferences',
      render: () =>
        createElement(UsageReferencesSection, {
          campaignId: input.campaignId,
          references: input.references,
        }),
    },
  ]
}

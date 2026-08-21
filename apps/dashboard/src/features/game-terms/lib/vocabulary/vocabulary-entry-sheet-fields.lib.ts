import { createElement } from 'react'
import type {
  VocabularyOptionSetId,
  VocabularyOptionWithUsage,
  VocabularyUsageReference,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { UsageReferencesSection } from '@/lib/usage-references/usage-references-section'

import {
  buildVocabularyEntrySheetFields,
  requireVocabularyEntryFormDefinition,
  vocabularyAvailableFromStatus,
} from '@/features/vocabulary'

export function buildVocabularyEntrySheetFieldItems(input: {
  setId: VocabularyOptionSetId
  campaignId: string
  groupId: string
  isEdit: boolean
  isPending: boolean
  entry?: VocabularyOptionWithUsage
  usageResolution: boolean
  references: VocabularyUsageReference[]
}): FormItem[] {
  requireVocabularyEntryFormDefinition(input.setId)

  const sheetFields = buildVocabularyEntrySheetFields({
    groupId: input.groupId,
    pending: input.isPending,
    available: input.entry ? vocabularyAvailableFromStatus(input.entry.status) : true,
  })

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

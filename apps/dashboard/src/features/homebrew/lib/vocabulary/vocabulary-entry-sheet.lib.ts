import { createElement } from 'react'
import type {
  ContentUsageBlocker,
  VocabularyOptionSetId,
  VocabularyOptionWithUsage,
  VocabularyUsageReference,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { UsageReferencesSection } from '@/lib/usage-references/usage-references-section.client'

import { fetchVocabularyDisableAvailability } from '../../api/vocabulary-api'
import {
  buildVocabularyEntrySheetFields,
  vocabularyAvailableFromStatus,
  vocabularyStatusFromAvailable,
  type VocabularyEntryFormValues,
  type VocabularyEntrySheetFormValues,
} from './vocabulary-entry-form-fields'

export function buildVocabularyEntrySheetDefaultValues(
  isEdit: boolean,
  entry?: VocabularyOptionWithUsage,
): VocabularyEntrySheetFormValues {
  if (isEdit && entry) {
    return {
      label: entry.label,
      description: entry.description ?? '',
      available: vocabularyAvailableFromStatus(entry.status),
    }
  }

  return {
    label: '',
    description: '',
    available: true,
  }
}

export function buildVocabularyEntrySheetFieldItems(input: {
  campaignId: string
  groupId: string
  isEdit: boolean
  isPending: boolean
  entry?: VocabularyOptionWithUsage
  usageCounting: boolean
  references: VocabularyUsageReference[]
}): FormItem[] {
  const sheetFields = buildVocabularyEntrySheetFields({
    groupId: input.groupId,
    pending: input.isPending,
    available: input.entry ? vocabularyAvailableFromStatus(input.entry.status) : true,
  })

  if (!input.isEdit || !input.usageCounting) {
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

export async function submitVocabularyEntrySheet(input: {
  values: VocabularyEntrySheetFormValues
  isEdit: boolean
  entry?: VocabularyOptionWithUsage
  campaignId: string
  setId: VocabularyOptionSetId
  onSubmit: (values: VocabularyEntryFormValues) => void | Promise<void>
  onBlocked: (blockers: ContentUsageBlocker[]) => void
}): Promise<void> {
  const nextStatus = vocabularyStatusFromAvailable(input.values.available)

  if (input.isEdit && input.entry) {
    const wasActive = input.entry.status === 'active'

    if (wasActive && nextStatus === 'disabled') {
      const availability = await fetchVocabularyDisableAvailability(
        input.campaignId,
        input.setId,
        input.entry.id,
      )
      if (availability.status === 'blocked') {
        input.onBlocked(availability.blockers)
        return
      }
    }

    await input.onSubmit({
      label: input.values.label,
      description: input.values.description ?? '',
      status: nextStatus,
    })
    return
  }

  await input.onSubmit({
    label: input.values.label,
    description: input.values.description ?? '',
    status: nextStatus,
  })
}

export function resolveVocabularyEntrySheetHeadline(
  isEdit: boolean,
  createLabel: string,
  entry?: VocabularyOptionWithUsage,
): string {
  if (!isEdit) {
    return createLabel
  }

  return `Edit ${entry?.label?.trim() || entry?.id || 'vocabulary entry'}`
}

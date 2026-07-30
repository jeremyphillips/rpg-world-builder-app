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
  buildVocabularyEntryEditFields,
  vocabularyAvailableFromStatus,
  vocabularyEntryCreateFields,
  vocabularyStatusFromAvailable,
  type VocabularyEntryCreateFormValues,
  type VocabularyEntryEditFormValues,
  type VocabularyEntryFormValues,
} from './vocabulary-entry-form-fields'

export function buildVocabularyEntrySheetDefaultValues(
  isEdit: boolean,
  entry?: VocabularyOptionWithUsage,
): VocabularyEntryCreateFormValues | VocabularyEntryEditFormValues {
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
  }
}

export function buildVocabularyEntrySheetFields(input: {
  campaignId: string
  groupId: string
  isEdit: boolean
  isPending: boolean
  entry?: VocabularyOptionWithUsage
  usageCounting: boolean
  references: VocabularyUsageReference[]
}): FormItem[] {
  if (!input.isEdit) {
    return vocabularyEntryCreateFields
  }

  const editFields = buildVocabularyEntryEditFields({
    groupId: input.groupId,
    pending: input.isPending,
    available: input.entry ? vocabularyAvailableFromStatus(input.entry.status) : true,
  })

  if (!input.usageCounting) {
    return editFields
  }

  return [
    ...editFields,
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
  values: VocabularyEntryCreateFormValues | VocabularyEntryEditFormValues
  isEdit: boolean
  entry?: VocabularyOptionWithUsage
  campaignId: string
  setId: VocabularyOptionSetId
  onSubmit: (values: VocabularyEntryFormValues) => void | Promise<void>
  onBlocked: (blockers: ContentUsageBlocker[]) => void
}): Promise<void> {
  if (input.isEdit && input.entry) {
    const editValues = input.values as VocabularyEntryEditFormValues
    const nextStatus = vocabularyStatusFromAvailable(editValues.available)
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
      label: editValues.label,
      description: editValues.description ?? '',
      status: nextStatus,
    })
    return
  }

  const createValues = input.values as VocabularyEntryCreateFormValues
  await input.onSubmit({
    label: createValues.label,
    description: createValues.description ?? '',
    status: 'active',
  })
}

export function resolveVocabularyEntrySheetHeadline(
  isEdit: boolean,
  entry?: VocabularyOptionWithUsage,
): string {
  if (!isEdit) {
    return 'Add vocabulary entry'
  }

  return `Edit ${entry?.label?.trim() || entry?.id || 'vocabulary entry'}`
}

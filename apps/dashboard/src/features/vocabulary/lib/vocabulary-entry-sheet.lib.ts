import type {
  ContentUsageBlocker,
  VocabularyOptionSetId,
  VocabularyOptionWithUsage,
} from '@rpg/contracts'
import { getVocabularySetCapability } from '@rpg/contracts'

import { fetchVocabularyDisableAvailability } from '../api/vocabulary-api'
import {
  vocabularyAvailableFromStatus,
  vocabularyStatusFromAvailable,
  type VocabularyEntryFormValues,
  type VocabularyEntrySheetFormValues,
} from './vocabulary-entry-form-fields'
import { getVocabularyEntryFormDefinition } from './vocabulary-entry-form-registry'

export function requireVocabularyEntryFormDefinition(setId: VocabularyOptionSetId): void {
  const capability = getVocabularySetCapability(setId)
  if (!capability.create && !capability.edit) {
    return
  }

  if (!getVocabularyEntryFormDefinition(setId)) {
    throw new Error(`Missing vocabulary form definition for "${setId}".`)
  }
}

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

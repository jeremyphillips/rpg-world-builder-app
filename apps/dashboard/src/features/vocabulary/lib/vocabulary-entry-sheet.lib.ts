import {
  CREATURE_TYPE_SET_ID,
  type ContentUsageBlocker,
  type VocabularyOptionSetId,
  type VocabularyOptionWithUsage,
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

function vocabularyEntryFormValuesFromSheet(
  setId: VocabularyOptionSetId,
  values: VocabularyEntrySheetFormValues,
  status: VocabularyEntryFormValues['status'],
): VocabularyEntryFormValues {
  return {
    label: values.label,
    description: values.description ?? '',
    status,
    ...(setId === CREATURE_TYPE_SET_ID
      ? { languageAffinities: values.languageAffinities ?? [] }
      : {}),
  }
}

async function assertVocabularyDisableAllowedForSheetEdit(input: {
  campaignId: string
  setId: VocabularyOptionSetId
  entry: VocabularyOptionWithUsage
  nextStatus: VocabularyEntryFormValues['status']
  onBlocked: (blockers: ContentUsageBlocker[]) => void
}): Promise<boolean> {
  const wasActive = input.entry.status === 'active'
  if (!wasActive || input.nextStatus !== 'disabled') {
    return true
  }

  const availability = await fetchVocabularyDisableAvailability(
    input.campaignId,
    input.setId,
    input.entry.id,
  )
  if (availability.status === 'blocked') {
    input.onBlocked(availability.blockers)
    return false
  }

  return true
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
      languageAffinities: entry.languageAffinities ?? [],
    }
  }

  return {
    label: '',
    description: '',
    available: true,
    languageAffinities: [],
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
  const formValues = vocabularyEntryFormValuesFromSheet(input.setId, input.values, nextStatus)

  if (input.isEdit && input.entry) {
    const allowed = await assertVocabularyDisableAllowedForSheetEdit({
      campaignId: input.campaignId,
      setId: input.setId,
      entry: input.entry,
      nextStatus,
      onBlocked: input.onBlocked,
    })
    if (!allowed) {
      return
    }

    await input.onSubmit(formValues)
    return
  }

  await input.onSubmit(formValues)
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

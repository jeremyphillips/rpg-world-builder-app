'use client'

import { useCallback, useMemo } from 'react'
import {
  getVocabularySetCapability,
  type ContentUsageBlocker,
  type VocabularyOptionSetId,
  type VocabularyOptionWithUsage,
} from '@rpg/contracts'

import { useVocabularyEntryUsage } from '../hooks/use-vocabulary-entry-usage'
import {
  buildVocabularyEntrySheetDefaultValues,
  buildVocabularyEntrySheetFieldItems,
  resolveVocabularyEntrySheetHeadline,
  submitVocabularyEntrySheet,
} from '../lib/vocabulary/vocabulary-entry-sheet.lib'
import {
  vocabularyEntrySheetFormSchema,
  type VocabularyEntryFormValues,
} from '../lib/vocabulary/vocabulary-entry-form-fields'

type UseVocabularyEntrySheetOptions = {
  open: boolean
  mode: 'create' | 'edit'
  campaignId: string
  setId: VocabularyOptionSetId
  createHeadline: string
  entry?: VocabularyOptionWithUsage
  isPending: boolean
  onSubmit: (values: VocabularyEntryFormValues) => void | Promise<void>
  onBlocked: (blockers: ContentUsageBlocker[]) => void
}

export function useVocabularyEntrySheet({
  open,
  mode,
  campaignId,
  setId,
  createHeadline,
  entry,
  isPending,
  onSubmit,
  onBlocked,
}: UseVocabularyEntrySheetOptions) {
  const isEdit = mode === 'edit'
  const groupId = `vocabulary-entry-availability-${entry?.id ?? 'create'}`
  const capabilities = getVocabularySetCapability(setId)

  const { data: usage } = useVocabularyEntryUsage(
    campaignId,
    setId,
    entry?.id,
    open && isEdit && capabilities.usageResolution,
  )

  const defaultValues = useMemo(
    () => buildVocabularyEntrySheetDefaultValues(isEdit, entry),
    [entry, isEdit],
  )

  const fields = useMemo(
    () =>
      buildVocabularyEntrySheetFieldItems({
        setId,
        campaignId,
        groupId,
        isEdit,
        isPending,
        entry,
        usageResolution: capabilities.usageResolution,
        references: usage?.references ?? [],
      }),
    [
      campaignId,
      capabilities.usageResolution,
      entry,
      groupId,
      isEdit,
      isPending,
      setId,
      usage?.references,
    ],
  )

  const handleSubmit = useCallback(
    (values: typeof defaultValues) =>
      submitVocabularyEntrySheet({
        values,
        isEdit,
        entry,
        campaignId,
        setId,
        onSubmit,
        onBlocked,
      }),
    [campaignId, entry, isEdit, onBlocked, onSubmit, setId],
  )

  return {
    isEdit,
    headline: resolveVocabularyEntrySheetHeadline(isEdit, createHeadline, entry),
    formKey: isEdit && entry ? `edit-${entry.id}` : 'create',
    schema: vocabularyEntrySheetFormSchema,
    fields,
    defaultValues,
    handleSubmit,
  }
}

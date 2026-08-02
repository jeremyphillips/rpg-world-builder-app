import { z } from 'zod'
import type { FormItem } from '@rpg/ui/form'

import {
  buildCampaignAvailabilityFields,
  resolveVocabularyAvailabilitySummary,
} from '@/lib/campaign-availability/campaign-availability-form-fields'

export const VOCABULARY_ENTRY_STATUSES = ['active', 'disabled'] as const

export type VocabularyEntryStatus = (typeof VOCABULARY_ENTRY_STATUSES)[number]

/** Values passed to vocabulary create/patch handlers from the entry sheet. */
export type VocabularyEntryFormValues = {
  label: string
  description: string
  status: VocabularyEntryStatus
}

export const vocabularyEntrySheetFormSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
  available: z.boolean().default(true),
})

export type VocabularyEntrySheetFormValues = z.infer<typeof vocabularyEntrySheetFormSchema>

/** @deprecated Use vocabularyEntrySheetFormSchema */
export const vocabularyEntryCreateFormSchema = vocabularyEntrySheetFormSchema

/** @deprecated Use vocabularyEntrySheetFormSchema */
export const vocabularyEntryEditFormSchema = vocabularyEntrySheetFormSchema

/** @deprecated Use VocabularyEntrySheetFormValues */
export type VocabularyEntryCreateFormValues = VocabularyEntrySheetFormValues

/** @deprecated Use VocabularyEntrySheetFormValues */
export type VocabularyEntryEditFormValues = VocabularyEntrySheetFormValues

const sharedVocabularyEntryFields: FormItem[] = [
  {
    type: 'text',
    name: 'label',
    label: 'Name',
    required: true,
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Description',
  },
]

export type VocabularyEntrySheetFieldCtx = {
  groupId: string
  pending: boolean
  available: boolean
}

export function buildVocabularyEntrySheetFields(ctx: VocabularyEntrySheetFieldCtx): FormItem[] {
  return [
    ...sharedVocabularyEntryFields,
    ...buildCampaignAvailabilityFields({
      groupId: ctx.groupId,
      pending: ctx.pending,
      groupRhythm: 'comfortable',
      switchSize: 'md',
      summaryDependsOn: ['available'],
      resolveSummary: (values) => resolveVocabularyAvailabilitySummary(Boolean(values.available)),
    }),
  ]
}

/** @deprecated Use buildVocabularyEntrySheetFields */
export const vocabularyEntryCreateFields: FormItem[] = buildVocabularyEntrySheetFields({
  groupId: 'vocabulary-entry-create-registry',
  pending: false,
  available: true,
})

/** @deprecated Use buildVocabularyEntrySheetFields */
export function buildVocabularyEntryEditFields(ctx: VocabularyEntrySheetFieldCtx): FormItem[] {
  return buildVocabularyEntrySheetFields(ctx)
}

/** @deprecated Use buildVocabularyEntrySheetFields — kept for registry static coverage. */
export const vocabularyEntryEditFields: FormItem[] = buildVocabularyEntrySheetFields({
  groupId: 'vocabulary-entry-edit-registry',
  pending: false,
  available: true,
})

export function vocabularyStatusFromAvailable(available: boolean): VocabularyEntryStatus {
  return available ? 'active' : 'disabled'
}

export function vocabularyAvailableFromStatus(status: VocabularyEntryStatus): boolean {
  return status === 'active'
}

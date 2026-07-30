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

export const vocabularyEntryCreateFormSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
})

export type VocabularyEntryCreateFormValues = z.infer<typeof vocabularyEntryCreateFormSchema>

export const vocabularyEntryEditFormSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
  available: z.boolean(),
})

export type VocabularyEntryEditFormValues = z.infer<typeof vocabularyEntryEditFormSchema>

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

export const vocabularyEntryCreateFields: FormItem[] = [...sharedVocabularyEntryFields]

export type VocabularyEntryEditFieldCtx = {
  groupId: string
  pending: boolean
  available: boolean
}

export function buildVocabularyEntryEditFields(ctx: VocabularyEntryEditFieldCtx): FormItem[] {
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

export function vocabularyStatusFromAvailable(available: boolean): VocabularyEntryStatus {
  return available ? 'active' : 'disabled'
}

export function vocabularyAvailableFromStatus(status: VocabularyEntryStatus): boolean {
  return status === 'active'
}

/** @deprecated Use buildVocabularyEntryEditFields — kept for registry static coverage. */
export const vocabularyEntryEditFields: FormItem[] = buildVocabularyEntryEditFields({
  groupId: 'vocabulary-entry-availability',
  pending: false,
  available: true,
})

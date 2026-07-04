import { z } from 'zod'
import { slugSchema } from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { VOCABULARY_STATUS_LABELS } from './labels'

export const VOCABULARY_ENTRY_STATUSES = ['active', 'disabled'] as const

export type VocabularyEntryStatus = (typeof VOCABULARY_ENTRY_STATUSES)[number]

/** Values passed to vocabulary create/patch handlers from the entry sheet. */
export type VocabularyEntryFormValues = {
  id: string
  label: string
  description: string
  status: VocabularyEntryStatus
}

export const vocabularyEntryCreateFormSchema = z.object({
  id: slugSchema,
  label: z.string().min(1),
  description: z.string().optional(),
})

export type VocabularyEntryCreateFormValues = z.infer<typeof vocabularyEntryCreateFormSchema>

export const vocabularyEntryEditFormSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(VOCABULARY_ENTRY_STATUSES),
})

export type VocabularyEntryEditFormValues = z.infer<typeof vocabularyEntryEditFormSchema>

const STATUS_OPTIONS = toOptions(VOCABULARY_ENTRY_STATUSES, VOCABULARY_STATUS_LABELS)

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

export const vocabularyEntryCreateFields: FormItem[] = [
  {
    type: 'text',
    name: 'id',
    label: 'Id',
    hint: 'Lowercase slug, e.g. fey-kin',
    required: true,
  },
  ...sharedVocabularyEntryFields,
]

export const vocabularyEntryEditFields: FormItem[] = [
  {
    type: 'text',
    name: 'id',
    label: 'Id',
    disabled: true,
  },
  ...sharedVocabularyEntryFields,
  {
    type: 'select',
    name: 'status',
    label: 'Status',
    options: STATUS_OPTIONS,
    required: true,
  },
]

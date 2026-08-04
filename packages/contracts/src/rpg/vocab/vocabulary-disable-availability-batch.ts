import { z } from 'zod'

import { vocabularyDisableAvailabilitySchema } from '../content/lib/content-deletion'
import {
  ACTION_VALIDATE_BATCH_TARGET_LIMIT,
  createBatchTargetOutcomeSchema,
  createBatchTargetsRequestSchema,
  uniqueTargetIdsRefinement,
} from '../../lib/action-validation-batch'

const vocabularyDisableAvailabilityBatchTargetSchema = z.object({
  entryId: z.string().min(1),
})

export const vocabularyDisableAvailabilityBatchRequestSchema = createBatchTargetsRequestSchema(
  vocabularyDisableAvailabilityBatchTargetSchema,
).superRefine(uniqueTargetIdsRefinement('entryId'))

export type VocabularyDisableAvailabilityBatchRequest = z.infer<
  typeof vocabularyDisableAvailabilityBatchRequestSchema
>

export const vocabularyDisableAvailabilityBatchTargetOutcomeSchema = createBatchTargetOutcomeSchema(
  vocabularyDisableAvailabilitySchema,
)

export type VocabularyDisableAvailabilityBatchTargetOutcome = z.infer<
  typeof vocabularyDisableAvailabilityBatchTargetOutcomeSchema
>

export const vocabularyDisableAvailabilityBatchResponseSchema = z.object({
  targets: z
    .array(vocabularyDisableAvailabilityBatchTargetOutcomeSchema)
    .min(1)
    .max(ACTION_VALIDATE_BATCH_TARGET_LIMIT),
})

export type VocabularyDisableAvailabilityBatchResponse = z.infer<
  typeof vocabularyDisableAvailabilityBatchResponseSchema
>

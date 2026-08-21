import { z } from 'zod'

import {
  ACTION_VALIDATE_BATCH_TARGET_LIMIT,
  createBatchTargetOutcomeSchema,
  createBatchTargetsRequestSchema,
  uniqueTargetIdsRefinement,
} from '../../../../lib/action-validation-batch'
import { contentCampaignAccessAvailabilitySchema } from './campaign-access'

const contentCampaignAccessAvailabilityBatchTargetSchema = z.object({
  entityId: z.string().min(1),
})

export const contentCampaignAccessAvailabilityBatchRequestSchema = createBatchTargetsRequestSchema(
  contentCampaignAccessAvailabilityBatchTargetSchema,
).superRefine(uniqueTargetIdsRefinement('entityId'))

export type ContentCampaignAccessAvailabilityBatchRequest = z.infer<
  typeof contentCampaignAccessAvailabilityBatchRequestSchema
>

export const contentCampaignAccessAvailabilityBatchTargetOutcomeSchema =
  createBatchTargetOutcomeSchema(contentCampaignAccessAvailabilitySchema)

export type ContentCampaignAccessAvailabilityBatchTargetOutcome = z.infer<
  typeof contentCampaignAccessAvailabilityBatchTargetOutcomeSchema
>

export const contentCampaignAccessAvailabilityBatchResponseSchema = z.object({
  targets: z
    .array(contentCampaignAccessAvailabilityBatchTargetOutcomeSchema)
    .min(1)
    .max(ACTION_VALIDATE_BATCH_TARGET_LIMIT),
})

export type ContentCampaignAccessAvailabilityBatchResponse = z.infer<
  typeof contentCampaignAccessAvailabilityBatchResponseSchema
>

import { z } from 'zod'

import { ApiError } from '../../shared/errors'
import { characterBuilderStepIdSchema } from '../runtime/character-builder/step-ids'
import {
  characterCampaignBlockingIssueSchema,
  characterCampaignWarningSchema,
} from './eligibility/character-campaign-eligibility'

// ---------------------------------------------------------------------------
// Campaign invite completion error wire schema — serialized in API `error.details`.
// ---------------------------------------------------------------------------

export const CAMPAIGN_INVITE_COMPLETION_ERROR_CODE = 'campaign_invite_completion_failed' as const

export const campaignInviteUnavailableReasonSchema = z.enum([
  'expired',
  'revoked',
  'not_owned',
  'not_accepted',
  'already_completed',
])

export type CampaignInviteUnavailableReason = z.infer<typeof campaignInviteUnavailableReasonSchema>

export const characterBuildValidationIssueSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.string().optional(),
  stepId: characterBuilderStepIdSchema.optional(),
  choiceSetId: z.string().optional(),
  allowanceId: z.string().optional(),
})

export type CharacterBuildValidationIssueWire = z.infer<typeof characterBuildValidationIssueSchema>

export const campaignInviteCompletionBuildInvalidDetailsSchema = z.object({
  kind: z.literal('build_invalid'),
  issues: z.array(characterBuildValidationIssueSchema),
})

export const campaignInviteCompletionCampaignIneligibleDetailsSchema = z.object({
  kind: z.literal('campaign_ineligible'),
  blockingIssues: z.array(characterCampaignBlockingIssueSchema),
  warnings: z.array(characterCampaignWarningSchema),
})

export const campaignInviteCompletionInviteUnavailableDetailsSchema = z.object({
  kind: z.literal('invite_unavailable'),
  reason: campaignInviteUnavailableReasonSchema,
})

export const campaignInviteCompletionErrorDetailsSchema = z.discriminatedUnion('kind', [
  campaignInviteCompletionBuildInvalidDetailsSchema,
  campaignInviteCompletionCampaignIneligibleDetailsSchema,
  campaignInviteCompletionInviteUnavailableDetailsSchema,
])

export type CampaignInviteCompletionErrorDetails = z.infer<
  typeof campaignInviteCompletionErrorDetailsSchema
>

export type ResolvedCampaignInviteCompletionError =
  | CampaignInviteCompletionErrorDetails
  | { kind: 'generic'; message: string }

export function parseCampaignInviteCompletionErrorDetails(
  details: unknown,
): CampaignInviteCompletionErrorDetails | undefined {
  const parsed = campaignInviteCompletionErrorDetailsSchema.safeParse(details)
  return parsed.success ? parsed.data : undefined
}

export function isCampaignInviteCompletionErrorCode(code: string): boolean {
  return code === CAMPAIGN_INVITE_COMPLETION_ERROR_CODE
}

export function resolveCampaignInviteCompletionError(
  error: unknown,
  fallbackMessage: string,
): ResolvedCampaignInviteCompletionError {
  if (!(error instanceof ApiError) || !isCampaignInviteCompletionErrorCode(error.code)) {
    return {
      kind: 'generic',
      message: error instanceof ApiError ? error.message : fallbackMessage,
    }
  }

  const details = parseCampaignInviteCompletionErrorDetails(error.details)
  if (!details) {
    return { kind: 'generic', message: error.message }
  }

  return details
}

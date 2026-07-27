import { z } from 'zod'

import { isApiError } from '../../shared/errors'
import { characterBuilderStepIdSchema } from '../runtime/character-builder/step-ids'
import {
  characterCampaignBlockingIssueSchema,
  characterCampaignWarningSchema,
} from './eligibility/character-campaign-eligibility'

// ---------------------------------------------------------------------------
// Campaign invite completion error wire schema — serialized in API `error.details`.
// ---------------------------------------------------------------------------

export const CAMPAIGN_INVITE_COMPLETION_ERROR_CODE = 'campaign_invite_completion_failed' as const

/** Pre-Phase-3 completion rejection code — still surfaced by stale API processes. */
export const LEGACY_CAMPAIGN_INVITE_INELIGIBLE_CODE = 'ineligible_character' as const

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

function parseLegacyCampaignInviteCompletionErrorDetails(
  details: unknown,
): CampaignInviteCompletionErrorDetails | undefined {
  if (!details || typeof details !== 'object') return undefined

  const candidate = {
    kind: 'campaign_ineligible' as const,
    blockingIssues:
      'blockingIssues' in details && Array.isArray(details.blockingIssues)
        ? details.blockingIssues
        : [],
    warnings: 'warnings' in details && Array.isArray(details.warnings) ? details.warnings : [],
  }

  const parsed = campaignInviteCompletionCampaignIneligibleDetailsSchema.safeParse(candidate)
  return parsed.success ? parsed.data : undefined
}

export function resolveCampaignInviteCompletionError(
  error: unknown,
  fallbackMessage: string,
): ResolvedCampaignInviteCompletionError {
  if (!isApiError(error)) {
    return {
      kind: 'generic',
      message: fallbackMessage,
    }
  }

  if (isCampaignInviteCompletionErrorCode(error.code)) {
    const details = parseCampaignInviteCompletionErrorDetails(error.details)
    if (details) {
      return details
    }

    return { kind: 'generic', message: error.message }
  }

  if (error.code === LEGACY_CAMPAIGN_INVITE_INELIGIBLE_CODE) {
    const legacyDetails = parseLegacyCampaignInviteCompletionErrorDetails(error.details)
    if (legacyDetails) {
      return legacyDetails
    }
  }

  return {
    kind: 'generic',
    message: error.message,
  }
}

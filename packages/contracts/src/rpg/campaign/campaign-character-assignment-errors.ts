import { z } from 'zod'

import { isApiError } from '../../shared/errors'
import { characterBuildValidationIssueSchema } from '../character-builder'
import {
  characterCampaignBlockingIssueSchema,
  characterCampaignWarningSchema,
} from './character-eligibility-contracts'

// ---------------------------------------------------------------------------
// Campaign character assignment error wire schema — serialized in API `error.details`.
// Shared by invite and membership onboarding completion paths.
// ---------------------------------------------------------------------------

export const CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE =
  'campaign_character_assignment_failed' as const

/** Pre-Phase-3 completion rejection code — still surfaced by stale API processes. */
export const LEGACY_CAMPAIGN_INVITE_INELIGIBLE_CODE = 'ineligible_character' as const

/** Pre-neutral-rename completion rejection code — accepted by the resolver during cutover. */
export const LEGACY_CAMPAIGN_INVITE_COMPLETION_ERROR_CODE =
  'campaign_invite_completion_failed' as const

export const campaignInviteUnavailableReasonSchema = z.enum([
  'expired',
  'revoked',
  'not_owned',
  'not_accepted',
  'already_completed',
])

export type CampaignInviteUnavailableReason = z.infer<typeof campaignInviteUnavailableReasonSchema>

export const campaignCharacterAssignmentBuildInvalidDetailsSchema = z.object({
  kind: z.literal('build_invalid'),
  issues: z.array(characterBuildValidationIssueSchema),
})

export const campaignCharacterAssignmentCampaignIneligibleDetailsSchema = z.object({
  kind: z.literal('campaign_ineligible'),
  blockingIssues: z.array(characterCampaignBlockingIssueSchema),
  warnings: z.array(characterCampaignWarningSchema),
})

export const campaignCharacterAssignmentInviteUnavailableDetailsSchema = z.object({
  kind: z.literal('invite_unavailable'),
  reason: campaignInviteUnavailableReasonSchema,
})

export const campaignCharacterAssignmentErrorDetailsSchema = z.discriminatedUnion('kind', [
  campaignCharacterAssignmentBuildInvalidDetailsSchema,
  campaignCharacterAssignmentCampaignIneligibleDetailsSchema,
  campaignCharacterAssignmentInviteUnavailableDetailsSchema,
])

export type CampaignCharacterAssignmentErrorDetails = z.infer<
  typeof campaignCharacterAssignmentErrorDetailsSchema
>

export type ResolvedCampaignCharacterAssignmentError =
  | CampaignCharacterAssignmentErrorDetails
  | { kind: 'generic'; message: string }

export function parseCampaignCharacterAssignmentErrorDetails(
  details: unknown,
): CampaignCharacterAssignmentErrorDetails | undefined {
  const parsed = campaignCharacterAssignmentErrorDetailsSchema.safeParse(details)
  return parsed.success ? parsed.data : undefined
}

export function isCampaignCharacterAssignmentErrorCode(code: string): boolean {
  return (
    code === CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE ||
    code === LEGACY_CAMPAIGN_INVITE_COMPLETION_ERROR_CODE
  )
}

function parseLegacyCampaignCharacterAssignmentErrorDetails(
  details: unknown,
): CampaignCharacterAssignmentErrorDetails | undefined {
  if (!details || typeof details !== 'object') return undefined

  const candidate = {
    kind: 'campaign_ineligible' as const,
    blockingIssues:
      'blockingIssues' in details && Array.isArray(details.blockingIssues)
        ? details.blockingIssues
        : [],
    warnings: 'warnings' in details && Array.isArray(details.warnings) ? details.warnings : [],
  }

  const parsed = campaignCharacterAssignmentCampaignIneligibleDetailsSchema.safeParse(candidate)
  return parsed.success ? parsed.data : undefined
}

export function resolveCampaignCharacterAssignmentError(
  error: unknown,
  fallbackMessage: string,
): ResolvedCampaignCharacterAssignmentError {
  if (!isApiError(error)) {
    return {
      kind: 'generic',
      message: fallbackMessage,
    }
  }

  if (isCampaignCharacterAssignmentErrorCode(error.code)) {
    const details = parseCampaignCharacterAssignmentErrorDetails(error.details)
    if (details) {
      return details
    }

    return { kind: 'generic', message: error.message }
  }

  if (error.code === LEGACY_CAMPAIGN_INVITE_INELIGIBLE_CODE) {
    const legacyDetails = parseLegacyCampaignCharacterAssignmentErrorDetails(error.details)
    if (legacyDetails) {
      return legacyDetails
    }
  }

  return {
    kind: 'generic',
    message: error.message,
  }
}

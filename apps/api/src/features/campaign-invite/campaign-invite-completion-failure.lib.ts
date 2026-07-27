import type {
  CampaignInviteCompletionErrorDetails,
  CharacterBuildValidationIssueWire,
  CharacterCampaignBlockingIssue,
  CharacterCampaignWarning,
} from '@rpg/contracts'
import { CAMPAIGN_INVITE_COMPLETION_ERROR_CODE } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'

export type CampaignInviteCompletionFailure =
  | { kind: 'build_invalid'; issues: CharacterBuildValidationIssueWire[] }
  | {
      kind: 'campaign_ineligible'
      blockingIssues: CharacterCampaignBlockingIssue[]
      warnings: CharacterCampaignWarning[]
    }
  | {
      kind: 'invite_unavailable'
      reason: 'expired' | 'revoked' | 'not_owned' | 'not_accepted' | 'already_completed'
    }

export class CampaignInviteCompletionFailureError extends Error {
  readonly failure: CampaignInviteCompletionFailure

  constructor(failure: CampaignInviteCompletionFailure) {
    super(resolveCampaignInviteCompletionFailureMessage(failure))
    this.name = 'CampaignInviteCompletionFailureError'
    this.failure = failure
  }
}

export function failCampaignInviteCompletion(failure: CampaignInviteCompletionFailure): never {
  throw new CampaignInviteCompletionFailureError(failure)
}

export function isCampaignInviteCompletionFailureError(
  error: unknown,
): error is CampaignInviteCompletionFailureError {
  return error instanceof CampaignInviteCompletionFailureError
}

function resolveCampaignInviteCompletionFailureMessage(
  failure: CampaignInviteCompletionFailure,
): string {
  switch (failure.kind) {
    case 'build_invalid':
      return 'Character build is not valid for campaign onboarding.'
    case 'campaign_ineligible':
      return 'Character is not eligible for this campaign.'
    case 'invite_unavailable':
      return resolveInviteUnavailableMessage(failure.reason)
  }
}

function resolveInviteUnavailableMessage(
  reason: Extract<CampaignInviteCompletionFailure, { kind: 'invite_unavailable' }>['reason'],
): string {
  switch (reason) {
    case 'expired':
      return 'This invitation has expired.'
    case 'revoked':
      return 'This invitation has been revoked.'
    case 'not_owned':
      return 'This invitation belongs to another user.'
    case 'not_accepted':
      return 'Invitation is not ready for onboarding.'
    case 'already_completed':
      return 'Invitation is already completed.'
  }
}

function resolveInviteUnavailableStatus(
  reason: Extract<CampaignInviteCompletionFailure, { kind: 'invite_unavailable' }>['reason'],
): number {
  switch (reason) {
    case 'not_owned':
      return 403
    case 'expired':
    case 'revoked':
      return 410
    case 'not_accepted':
    case 'already_completed':
      return 409
  }
}

export function toCampaignInviteCompletionErrorDetails(
  failure: CampaignInviteCompletionFailure,
): CampaignInviteCompletionErrorDetails {
  switch (failure.kind) {
    case 'build_invalid':
      return { kind: 'build_invalid', issues: failure.issues }
    case 'campaign_ineligible':
      return {
        kind: 'campaign_ineligible',
        blockingIssues: failure.blockingIssues,
        warnings: failure.warnings,
      }
    case 'invite_unavailable':
      return { kind: 'invite_unavailable', reason: failure.reason }
  }
}

export function mapCampaignInviteCompletionFailureToHttpError(
  failure: CampaignInviteCompletionFailure,
): HttpError {
  const details = toCampaignInviteCompletionErrorDetails(failure)

  switch (failure.kind) {
    case 'build_invalid':
      return new HttpError(
        400,
        CAMPAIGN_INVITE_COMPLETION_ERROR_CODE,
        resolveCampaignInviteCompletionFailureMessage(failure),
        details,
      )
    case 'campaign_ineligible':
      return new HttpError(
        422,
        CAMPAIGN_INVITE_COMPLETION_ERROR_CODE,
        resolveCampaignInviteCompletionFailureMessage(failure),
        details,
      )
    case 'invite_unavailable':
      return new HttpError(
        resolveInviteUnavailableStatus(failure.reason),
        CAMPAIGN_INVITE_COMPLETION_ERROR_CODE,
        resolveCampaignInviteCompletionFailureMessage(failure),
        details,
      )
  }
}

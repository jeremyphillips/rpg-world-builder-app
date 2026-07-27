import type {
  CampaignCharacterAssignmentErrorDetails,
  CampaignInviteUnavailableReason,
} from '@rpg/contracts'
import { CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'

/** Service-layer failure before HTTP mapping — same shape as wire `error.details`. */
export type CampaignCharacterAssignmentFailure = CampaignCharacterAssignmentErrorDetails

export class CampaignCharacterAssignmentFailureError extends Error {
  readonly failure: CampaignCharacterAssignmentFailure

  constructor(failure: CampaignCharacterAssignmentFailure) {
    super(resolveCampaignCharacterAssignmentFailureMessage(failure))
    this.name = 'CampaignCharacterAssignmentFailureError'
    this.failure = failure
  }
}

export function failCampaignCharacterAssignment(
  failure: CampaignCharacterAssignmentFailure,
): never {
  throw new CampaignCharacterAssignmentFailureError(failure)
}

export function isCampaignCharacterAssignmentFailureError(
  error: unknown,
): error is CampaignCharacterAssignmentFailureError {
  return error instanceof CampaignCharacterAssignmentFailureError
}

/** @deprecated Use failCampaignCharacterAssignment */
export function failCampaignInviteCompletion(failure: CampaignCharacterAssignmentFailure): never {
  return failCampaignCharacterAssignment(failure)
}

/** @deprecated Use CampaignCharacterAssignmentFailure */
export type CampaignInviteCompletionFailure = CampaignCharacterAssignmentFailure

/** @deprecated Use CampaignCharacterAssignmentFailureError */
export const CampaignInviteCompletionFailureError = CampaignCharacterAssignmentFailureError

/** @deprecated Use isCampaignCharacterAssignmentFailureError */
export const isCampaignInviteCompletionFailureError = isCampaignCharacterAssignmentFailureError

function resolveCampaignCharacterAssignmentFailureMessage(
  failure: CampaignCharacterAssignmentFailure,
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

function resolveInviteUnavailableMessage(reason: CampaignInviteUnavailableReason): string {
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

function resolveInviteUnavailableStatus(reason: CampaignInviteUnavailableReason): number {
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

export function mapCampaignCharacterAssignmentFailureToHttpError(
  failure: CampaignCharacterAssignmentFailure,
): HttpError {
  switch (failure.kind) {
    case 'build_invalid':
      return new HttpError(
        400,
        CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE,
        resolveCampaignCharacterAssignmentFailureMessage(failure),
        failure,
      )
    case 'campaign_ineligible':
      return new HttpError(
        422,
        CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE,
        resolveCampaignCharacterAssignmentFailureMessage(failure),
        failure,
      )
    case 'invite_unavailable':
      return new HttpError(
        resolveInviteUnavailableStatus(failure.reason),
        CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE,
        resolveCampaignCharacterAssignmentFailureMessage(failure),
        failure,
      )
  }
}

/** @deprecated Use mapCampaignCharacterAssignmentFailureToHttpError */
export const mapCampaignInviteCompletionFailureToHttpError =
  mapCampaignCharacterAssignmentFailureToHttpError

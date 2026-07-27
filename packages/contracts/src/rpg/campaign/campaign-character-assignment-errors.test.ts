import { describe, expect, it } from 'vitest'

import { ApiError, isApiError } from '../../shared/errors'
import {
  CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE,
  isCampaignCharacterAssignmentErrorCode,
  LEGACY_CAMPAIGN_INVITE_COMPLETION_ERROR_CODE,
  LEGACY_CAMPAIGN_INVITE_INELIGIBLE_CODE,
  parseCampaignCharacterAssignmentErrorDetails,
  resolveCampaignCharacterAssignmentError,
} from './campaign-character-assignment-errors'

describe('parseCampaignCharacterAssignmentErrorDetails', () => {
  it('parses campaign_ineligible details', () => {
    const parsed = parseCampaignCharacterAssignmentErrorDetails({
      kind: 'campaign_ineligible',
      blockingIssues: [
        {
          code: 'content_missing',
          contentType: 'subclass',
          contentId: 'srd-cc-5.2.1:missing-subclass',
        },
      ],
      warnings: [],
    })

    expect(parsed?.kind).toBe('campaign_ineligible')
    if (parsed?.kind === 'campaign_ineligible') {
      expect(parsed.blockingIssues).toHaveLength(1)
    }
  })

  it('parses build_invalid details', () => {
    const parsed = parseCampaignCharacterAssignmentErrorDetails({
      kind: 'build_invalid',
      issues: [{ code: 'ruleset_mismatch', message: 'Ruleset must match the campaign.' }],
    })

    expect(parsed?.kind).toBe('build_invalid')
  })

  it('parses invite_unavailable details', () => {
    const parsed = parseCampaignCharacterAssignmentErrorDetails({
      kind: 'invite_unavailable',
      reason: 'expired',
    })

    expect(parsed).toEqual({ kind: 'invite_unavailable', reason: 'expired' })
  })

  it('returns undefined for unrelated details', () => {
    expect(parseCampaignCharacterAssignmentErrorDetails({ blockingIssues: [] })).toBeUndefined()
  })
})

describe('isCampaignCharacterAssignmentErrorCode', () => {
  it('matches the stable assignment error code', () => {
    expect(isCampaignCharacterAssignmentErrorCode(CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE)).toBe(
      true,
    )
    expect(
      isCampaignCharacterAssignmentErrorCode(LEGACY_CAMPAIGN_INVITE_COMPLETION_ERROR_CODE),
    ).toBe(true)
    expect(isCampaignCharacterAssignmentErrorCode('ineligible_character')).toBe(false)
  })
})

describe('resolveCampaignCharacterAssignmentError', () => {
  it('returns structured details for assignment ApiError payloads', () => {
    const resolved = resolveCampaignCharacterAssignmentError(
      new ApiError(422, CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE, 'Not eligible', {
        kind: 'campaign_ineligible',
        blockingIssues: [{ code: 'not_owned_pc' }],
        warnings: [],
      }),
      'Fallback',
    )

    expect(resolved).toEqual({
      kind: 'campaign_ineligible',
      blockingIssues: [{ code: 'not_owned_pc' }],
      warnings: [],
    })
  })

  it('accepts the legacy invite completion error code', () => {
    const resolved = resolveCampaignCharacterAssignmentError(
      new ApiError(422, LEGACY_CAMPAIGN_INVITE_COMPLETION_ERROR_CODE, 'Not eligible', {
        kind: 'campaign_ineligible',
        blockingIssues: [{ code: 'not_owned_pc' }],
        warnings: [],
      }),
      'Fallback',
    )

    expect(resolved).toEqual({
      kind: 'campaign_ineligible',
      blockingIssues: [{ code: 'not_owned_pc' }],
      warnings: [],
    })
  })

  it('recognizes ApiError across duplicate module instances', () => {
    const error = new ApiError(422, CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE, 'Not eligible', {
      kind: 'campaign_ineligible',
      blockingIssues: [{ code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 }],
      warnings: [],
    })

    const foreignApiError = Object.assign(Object.create(ApiError.prototype), error)
    expect(isApiError(foreignApiError)).toBe(true)

    expect(resolveCampaignCharacterAssignmentError(foreignApiError, 'Fallback')).toEqual({
      kind: 'campaign_ineligible',
      blockingIssues: [{ code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 }],
      warnings: [],
    })
  })

  it('maps legacy ineligible_character payloads to campaign_ineligible', () => {
    expect(
      resolveCampaignCharacterAssignmentError(
        new ApiError(422, LEGACY_CAMPAIGN_INVITE_INELIGIBLE_CODE, 'Not eligible', {
          blockingIssues: [
            {
              code: 'content_missing',
              contentType: 'subclass',
              contentId: 'srd-cc-5.2.1:missing-subclass',
            },
          ],
        }),
        'Fallback',
      ),
    ).toEqual({
      kind: 'campaign_ineligible',
      blockingIssues: [
        {
          code: 'content_missing',
          contentType: 'subclass',
          contentId: 'srd-cc-5.2.1:missing-subclass',
        },
      ],
      warnings: [],
    })
  })

  it('falls back for unrelated errors', () => {
    expect(
      resolveCampaignCharacterAssignmentError(new Error('boom'), 'Could not complete onboarding.'),
    ).toEqual({
      kind: 'generic',
      message: 'Could not complete onboarding.',
    })
  })
})

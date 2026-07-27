import { describe, expect, it } from 'vitest'

import { ApiError, isApiError } from '../../shared/errors'
import {
  CAMPAIGN_INVITE_COMPLETION_ERROR_CODE,
  isCampaignInviteCompletionErrorCode,
  LEGACY_CAMPAIGN_INVITE_INELIGIBLE_CODE,
  parseCampaignInviteCompletionErrorDetails,
  resolveCampaignInviteCompletionError,
} from './campaign-invite-completion-errors'

describe('parseCampaignInviteCompletionErrorDetails', () => {
  it('parses campaign_ineligible details', () => {
    const parsed = parseCampaignInviteCompletionErrorDetails({
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
    const parsed = parseCampaignInviteCompletionErrorDetails({
      kind: 'build_invalid',
      issues: [{ code: 'ruleset_mismatch', message: 'Ruleset must match the campaign.' }],
    })

    expect(parsed?.kind).toBe('build_invalid')
  })

  it('parses invite_unavailable details', () => {
    const parsed = parseCampaignInviteCompletionErrorDetails({
      kind: 'invite_unavailable',
      reason: 'expired',
    })

    expect(parsed).toEqual({ kind: 'invite_unavailable', reason: 'expired' })
  })

  it('returns undefined for unrelated details', () => {
    expect(parseCampaignInviteCompletionErrorDetails({ blockingIssues: [] })).toBeUndefined()
  })
})

describe('isCampaignInviteCompletionErrorCode', () => {
  it('matches the stable completion error code', () => {
    expect(isCampaignInviteCompletionErrorCode(CAMPAIGN_INVITE_COMPLETION_ERROR_CODE)).toBe(true)
    expect(isCampaignInviteCompletionErrorCode('ineligible_character')).toBe(false)
  })
})

describe('resolveCampaignInviteCompletionError', () => {
  it('returns structured details for completion ApiError payloads', () => {
    const resolved = resolveCampaignInviteCompletionError(
      new ApiError(422, CAMPAIGN_INVITE_COMPLETION_ERROR_CODE, 'Not eligible', {
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
    const error = new ApiError(422, CAMPAIGN_INVITE_COMPLETION_ERROR_CODE, 'Not eligible', {
      kind: 'campaign_ineligible',
      blockingIssues: [{ code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 }],
      warnings: [],
    })

    const foreignApiError = Object.assign(Object.create(ApiError.prototype), error)
    expect(isApiError(foreignApiError)).toBe(true)

    expect(resolveCampaignInviteCompletionError(foreignApiError, 'Fallback')).toEqual({
      kind: 'campaign_ineligible',
      blockingIssues: [{ code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 }],
      warnings: [],
    })
  })

  it('maps legacy ineligible_character payloads to campaign_ineligible', () => {
    expect(
      resolveCampaignInviteCompletionError(
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
      resolveCampaignInviteCompletionError(new Error('boom'), 'Could not complete onboarding.'),
    ).toEqual({
      kind: 'generic',
      message: 'Could not complete onboarding.',
    })
  })
})

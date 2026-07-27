import { describe, expect, it } from 'vitest'

import { CAMPAIGN_INVITE_COMPLETION_ERROR_CODE } from '@rpg/contracts'

import {
  CampaignInviteCompletionFailureError,
  mapCampaignInviteCompletionFailureToHttpError,
} from './campaign-invite-completion-failure.lib'

describe('mapCampaignInviteCompletionFailureToHttpError', () => {
  it('maps campaign_ineligible to 422 with structured details', () => {
    const error = mapCampaignInviteCompletionFailureToHttpError({
      kind: 'campaign_ineligible',
      blockingIssues: [{ code: 'not_owned_pc' }],
      warnings: [],
    })

    expect(error.status).toBe(422)
    expect(error.code).toBe(CAMPAIGN_INVITE_COMPLETION_ERROR_CODE)
    expect(error.details).toEqual({
      kind: 'campaign_ineligible',
      blockingIssues: [{ code: 'not_owned_pc' }],
      warnings: [],
    })
  })

  it('maps invite_unavailable reasons to expected HTTP statuses', () => {
    expect(
      mapCampaignInviteCompletionFailureToHttpError({
        kind: 'invite_unavailable',
        reason: 'not_owned',
      }).status,
    ).toBe(403)

    expect(
      mapCampaignInviteCompletionFailureToHttpError({
        kind: 'invite_unavailable',
        reason: 'expired',
      }).status,
    ).toBe(410)
  })

  it('throws CampaignInviteCompletionFailureError with the failure payload', () => {
    const error = new CampaignInviteCompletionFailureError({
      kind: 'build_invalid',
      issues: [{ code: 'invalid_field', message: 'Required' }],
    })

    expect(error.failure.kind).toBe('build_invalid')
    expect(error.message).toContain('not valid')
  })
})

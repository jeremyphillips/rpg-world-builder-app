import { describe, expect, it } from 'vitest'

import { CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE } from '@rpg/contracts'

import { HttpError } from '../../../../lib/http-error'
import {
  CampaignCharacterAssignmentFailureError,
  mapCampaignCharacterAssignmentFailureToHttpError,
} from './campaign-character-assignment-failure.lib'
import { runCampaignCharacterAssignmentAction } from './run-campaign-character-assignment-action.lib'

describe('mapCampaignCharacterAssignmentFailureToHttpError', () => {
  it('maps campaign_ineligible to 422 with structured details', () => {
    const error = mapCampaignCharacterAssignmentFailureToHttpError({
      kind: 'campaign_ineligible',
      blockingIssues: [{ code: 'not_owned_pc' }],
      warnings: [],
    })

    expect(error.status).toBe(422)
    expect(error.code).toBe(CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE)
    expect(error.details).toEqual({
      kind: 'campaign_ineligible',
      blockingIssues: [{ code: 'not_owned_pc' }],
      warnings: [],
    })
  })

  it('maps invite_unavailable reasons to expected HTTP statuses', () => {
    expect(
      mapCampaignCharacterAssignmentFailureToHttpError({
        kind: 'invite_unavailable',
        reason: 'not_owned',
      }).status,
    ).toBe(403)

    expect(
      mapCampaignCharacterAssignmentFailureToHttpError({
        kind: 'invite_unavailable',
        reason: 'expired',
      }).status,
    ).toBe(410)
  })

  it('throws CampaignCharacterAssignmentFailureError with the failure payload', () => {
    const error = new CampaignCharacterAssignmentFailureError({
      kind: 'build_invalid',
      issues: [{ code: 'invalid_field', message: 'Required' }],
    })

    expect(error.failure.kind).toBe('build_invalid')
    expect(error.message).toContain('not valid')
  })
})

describe('runCampaignCharacterAssignmentAction', () => {
  it('maps assignment failures to HttpError', async () => {
    await expect(
      runCampaignCharacterAssignmentAction(() => {
        throw new CampaignCharacterAssignmentFailureError({
          kind: 'campaign_ineligible',
          blockingIssues: [{ code: 'not_owned_pc' }],
          warnings: [],
        })
      }),
    ).rejects.toMatchObject({
      status: 422,
      code: CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE,
    })
  })

  it('rethrows non-assignment errors unchanged', async () => {
    const error = new HttpError(404, 'not_found', 'Missing')

    await expect(
      runCampaignCharacterAssignmentAction(() => {
        throw error
      }),
    ).rejects.toBe(error)
  })
})

import { describe, expect, it, vi } from 'vitest'

import { ApiError, CharacterBuildFinalizationError } from '@rpg/contracts'

import {
  createCampaignPcBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from '../character-builder-fixtures'
import {
  applyBuilderCreateFailure,
  resolveBuilderCreateFailure,
} from './character-builder-create-error.lib'

describe('resolveBuilderCreateFailure', () => {
  const inviteContext = createCampaignPcBuilderContextFixture()

  it('maps finalization errors to builder validation issues', () => {
    const error = new CharacterBuildFinalizationError([
      { code: 'name_required', message: 'Name is required.', stepId: 'identity' },
    ])

    expect(
      resolveBuilderCreateFailure(error, {
        context: inviteContext,
        defaultMessage: 'Could not create campaign character.',
      }),
    ).toEqual({
      kind: 'validation',
      issues: [{ code: 'name_required', message: 'Name is required.', stepId: 'identity' }],
    })
  })

  it('maps campaign assignment ApiError payloads before any network retry handling', () => {
    expect(
      resolveBuilderCreateFailure(
        new ApiError(422, 'campaign_character_assignment_failed', 'Not eligible', {
          kind: 'campaign_ineligible',
          blockingIssues: [{ code: 'content_missing', contentType: 'subclass', contentId: 'x' }],
          warnings: [],
        }),
        {
          context: inviteContext,
          defaultMessage: 'Could not create campaign character.',
        },
      ),
    ).toEqual({
      kind: 'campaign_eligibility',
      blockingIssues: [{ code: 'content_missing', contentType: 'subclass', contentId: 'x' }],
      warnings: [],
    })
  })

  it('maps campaign assignment errors for onboarding builds', () => {
    const onboardingContext = createCampaignPcBuilderContextFixture({
      acquisition: { kind: 'campaign_pc_onboarding', campaignId: 'camp_1' },
    })

    expect(
      resolveBuilderCreateFailure(
        new ApiError(422, 'campaign_character_assignment_failed', 'Not eligible', {
          kind: 'campaign_ineligible',
          blockingIssues: [{ code: 'content_missing', contentType: 'subclass', contentId: 'x' }],
          warnings: [],
        }),
        {
          context: onboardingContext,
          defaultMessage: 'Could not create campaign character.',
        },
      ),
    ).toEqual({
      kind: 'campaign_eligibility',
      blockingIssues: [{ code: 'content_missing', contentType: 'subclass', contentId: 'x' }],
      warnings: [],
    })
  })

  it('falls back to create_error for standalone builds', () => {
    expect(
      resolveBuilderCreateFailure(new Error('Save failed'), {
        context: createStandaloneBuilderContextFixture(),
        defaultMessage: 'Could not create character.',
      }),
    ).toEqual({
      kind: 'create_error',
      message: 'Save failed',
    })
  })

  it('defaults invite_unavailable to create_error when no handler is provided', () => {
    const setCreateError = vi.fn()

    applyBuilderCreateFailure(
      { kind: 'invite_unavailable', reason: 'expired' },
      {
        applyValidationIssues: vi.fn(),
        patchDraft: vi.fn(),
        setCampaignEligibilityError: vi.fn(),
        setCreateError,
      },
    )

    expect(setCreateError).toHaveBeenCalledWith(
      'This invitation has expired. Ask the campaign owner to send a new invite.',
    )
  })
})

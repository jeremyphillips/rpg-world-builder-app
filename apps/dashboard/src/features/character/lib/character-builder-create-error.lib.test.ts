import { describe, expect, it } from 'vitest'

import { ApiError, CharacterBuildFinalizationError } from '@rpg/contracts'

import {
  createCampaignPcBuilderContextFixture,
  createStandaloneBuilderContextFixture,
} from './character-builder-fixtures'
import { resolveBuilderCreateFailure } from './character-builder-create-error.lib'

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

  it('maps invite completion ApiError payloads before any network retry handling', () => {
    expect(
      resolveBuilderCreateFailure(
        new ApiError(422, 'campaign_invite_completion_failed', 'Not eligible', {
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
})

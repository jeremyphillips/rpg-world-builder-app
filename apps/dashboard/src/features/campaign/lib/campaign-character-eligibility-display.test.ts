import { describe, expect, it } from 'vitest'

import type { CharacterCampaignBlockingIssue } from '@rpg/contracts'

import {
  formatBlockingReason,
  formatComboboxBlockingDescription,
} from './campaign-character-eligibility-display'

describe('formatBlockingReason', () => {
  it('formats content_missing copy', () => {
    expect(
      formatBlockingReason({
        code: 'content_missing',
        contentType: 'subclass',
        contentId: 'srd-cc-5.2.1:missing-subclass',
      }),
    ).toBe('Subclass is not available in this campaign')
  })

  it('formats level mismatch copy', () => {
    const issue: CharacterCampaignBlockingIssue = {
      code: 'level_mismatch',
      actualLevel: 3,
      requiredLevel: 1,
    }

    expect(formatBlockingReason(issue)).toBe('Campaign starts at level 1')
  })

  it('formats conflicting campaign copy with a name', () => {
    const issue: CharacterCampaignBlockingIssue = {
      code: 'conflicting_open_participation',
      conflictingCampaignName: 'The Shattered Vale',
    }

    expect(formatBlockingReason(issue)).toBe('Already participating in The Shattered Vale')
  })
})

describe('formatComboboxBlockingDescription', () => {
  it('appends a compact suffix when multiple issues exist', () => {
    expect(
      formatComboboxBlockingDescription([
        { code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 },
        { code: 'not_owned_pc' },
      ]),
    ).toBe('You can only bring characters you own · 1 more issue')
  })
})

import { describe, expect, it } from 'vitest'

import type { CampaignInviteEligibleCharacter } from '@rpg/contracts'

import {
  buildCharacterOptions,
  summarizeEligibleCharacters,
} from './campaign-invite-onboarding.lib'

function makeCharacter(
  overrides: Partial<CampaignInviteEligibleCharacter> = {},
): CampaignInviteEligibleCharacter {
  return {
    characterId: 'char_1',
    name: 'Aldric',
    summary: 'Level 3 Fighter',
    eligibility: { eligible: true, blockingIssues: [], warnings: [] },
    ...overrides,
  }
}

describe('summarizeEligibleCharacters', () => {
  it('reports empty lists', () => {
    expect(summarizeEligibleCharacters(undefined)).toEqual({
      hasCharacters: false,
      hasEligibleCharacter: false,
    })
  })

  it('detects when no characters are eligible', () => {
    expect(
      summarizeEligibleCharacters([
        makeCharacter({ eligibility: { eligible: false, blockingIssues: [], warnings: [] } }),
      ]),
    ).toEqual({
      hasCharacters: true,
      hasEligibleCharacter: false,
    })
  })
})

describe('buildCharacterOptions', () => {
  it('marks ineligible characters disabled with blocking copy', () => {
    const options = buildCharacterOptions([
      makeCharacter({
        eligibility: {
          eligible: false,
          blockingIssues: [{ code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 }],
          warnings: [],
        },
      }),
    ])

    expect(options[0]).toMatchObject({
      disabled: true,
      description: 'Campaign starts at level 1',
    })
  })
})

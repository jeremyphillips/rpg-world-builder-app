import { describe, expect, it } from 'vitest'

import {
  ABSOLUTE_MAX_CHARACTER_LEVEL,
  MAX_CHARACTER_LEVEL,
  resolveCampaignRules,
  resolveMaxCharacterLevel,
} from '@rpg/contracts'

describe('resolveMaxCharacterLevel', () => {
  it('defaults to system max when override is absent', () => {
    expect(resolveMaxCharacterLevel(undefined)).toBe(MAX_CHARACTER_LEVEL)
    expect(
      resolveMaxCharacterLevel({
        characterCreation: { startingLevel: 1, importedCharacters: { policy: 'disabled' } },
      }),
    ).toBe(MAX_CHARACTER_LEVEL)
  })

  it('returns sparse override when set', () => {
    expect(
      resolveMaxCharacterLevel({
        characterCreation: { startingLevel: 1, importedCharacters: { policy: 'disabled' } },
        ruleOverrides: { maxCharacterLevel: 25 },
      }),
    ).toBe(25)
  })
})

describe('resolveCampaignRules', () => {
  it('returns resolved max character level', () => {
    expect(
      resolveCampaignRules({
        characterCreation: { startingLevel: 1, importedCharacters: { policy: 'disabled' } },
        ruleOverrides: { maxCharacterLevel: ABSOLUTE_MAX_CHARACTER_LEVEL },
      }),
    ).toEqual({ maxCharacterLevel: ABSOLUTE_MAX_CHARACTER_LEVEL })
  })
})

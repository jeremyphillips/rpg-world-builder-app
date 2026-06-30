import { describe, expect, it } from 'vitest'
import { defaultMulticlassingRules, MAX_CHARACTER_LEVEL } from '@rpg/contracts'

import {
  campaignRulesFromCtx,
  defaultCampaignRules,
  effectiveMaxFromCtx,
} from './content-campaign-rules'

describe('content-campaign-rules', () => {
  it('defaultCampaignRules matches contract defaults', () => {
    const rules = defaultCampaignRules()

    expect(rules.maxCharacterLevel).toBe(MAX_CHARACTER_LEVEL)
    expect(rules.standardMaxCharacterLevel).toBe(MAX_CHARACTER_LEVEL)
    expect(rules.multiclassing).toEqual(defaultMulticlassingRules())
    expect(rules.allowedCharacterCreatureTypes.length).toBeGreaterThan(0)
  })

  it('campaignRulesFromCtx falls back to defaults', () => {
    expect(campaignRulesFromCtx()).toEqual(defaultCampaignRules())
  })

  it('campaignRulesFromCtx uses ctx.campaignRules when present', () => {
    const custom = {
      ...defaultCampaignRules(),
      maxCharacterLevel: 25,
    }

    expect(campaignRulesFromCtx({ campaignRules: custom }).maxCharacterLevel).toBe(25)
  })

  it('effectiveMaxFromCtx reads maxCharacterLevel from resolved rules', () => {
    expect(effectiveMaxFromCtx()).toBe(MAX_CHARACTER_LEVEL)
    expect(
      effectiveMaxFromCtx({
        campaignRules: { ...defaultCampaignRules(), maxCharacterLevel: 9 },
      }),
    ).toBe(9)
  })
})

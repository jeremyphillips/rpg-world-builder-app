import { describe, expect, it } from 'vitest'
import { defaultSpeciesLevelLimits, defaultMulticlassingRules } from '@rpg/contracts'

import { defaultCampaignRules } from '../../lib/level-field-options'
import {
  characterCreationFromFormValues,
  characterCreationToFormValues,
  refineSpeciesCharacterCreationForm,
} from './species-rules-form-values'

describe('species-rules-form-fields conversions', () => {
  it('maps stored level limits with null max to form shape', () => {
    expect(
      characterCreationToFormValues({
        levelLimits: defaultSpeciesLevelLimits(),
      }),
    ).toEqual({
      levelLimits: {
        limitMaxCharacterLevel: false,
        maxCharacterLevel: undefined,
        classLevelCaps: [],
      },
    })
  })

  it('round-trips multiclassing and level limits', () => {
    const form = {
      multiclassing: {
        policy: 'restricted' as const,
        classPolicy: { mode: 'only' as const, classIds: ['fighter'] },
      },
      levelLimits: {
        limitMaxCharacterLevel: true,
        maxCharacterLevel: 10,
        classLevelCaps: [{ classId: 'wizard', maxLevel: 5 }],
      },
    }

    const stored = characterCreationFromFormValues(form)
    expect(stored).toEqual({
      multiclassing: form.multiclassing,
      levelLimits: {
        maxCharacterLevel: 10,
        classLevelCaps: [{ classId: 'wizard', maxLevel: 5 }],
      },
    })
  })

  it('rejects level limits above the campaign cap', () => {
    const issues: Array<{ message?: string; path?: PropertyKey[] }> = []
    refineSpeciesCharacterCreationForm(
      {
        levelLimits: {
          limitMaxCharacterLevel: true,
          maxCharacterLevel: 25,
          classLevelCaps: [],
        },
      },
      { campaignRules: defaultCampaignRules() },
      {
        addIssue: (issue) => {
          if (typeof issue === 'object' && issue !== null && 'message' in issue) {
            issues.push({
              message: issue.message,
              path: issue.path,
            })
          }
        },
      } as Parameters<typeof refineSpeciesCharacterCreationForm>[2],
    )

    expect(issues[0]?.message).toContain('campaign cap')
  })
})

describe('default campaign rules', () => {
  it('includes resolved multiclassing defaults', () => {
    expect(defaultCampaignRules().multiclassing).toEqual(defaultMulticlassingRules())
  })
})

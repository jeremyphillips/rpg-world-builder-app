import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SPECIES_CLASS_POLICY_MODE,
  DEFAULT_SPECIES_MULTICLASS_POLICY,
  defaultSpeciesLevelLimits,
  defaultMulticlassingRules,
} from '@rpg/contracts'

import { type StackConfig, type FormItem } from '@rpg/ui/form'

import { defaultCampaignRules } from '../../lib/form-options/content-campaign-rules'
import {
  ENABLE_CLASS_LEVEL_CAPS_FIELD,
  multiclassingPolicyFields,
  speciesLevelLimitsFields,
} from './species-rules-form-fields'
import {
  characterCreationFromFormValues,
  characterCreationToFormValues,
  mergeCharacterCreationFormDefaults,
  mergeMulticlassingFormDefaults,
  refineSpeciesCharacterCreationForm,
} from './species-rules-form-values'

function expectStack(item: FormItem | undefined): StackConfig {
  if (!item || !('kind' in item) || item.kind !== 'stack') {
    throw new Error('expected dependent stack')
  }
  return item
}

describe('multiclassingPolicyFields', () => {
  it('uses contract defaults for policy and class policy mode', () => {
    const fields = multiclassingPolicyFields({})
    expect(fields[0]).toEqual(
      expect.objectContaining({
        name: 'policy',
        defaultValue: DEFAULT_SPECIES_MULTICLASS_POLICY,
      }),
    )
    const stack = expectStack(fields[1])
    expect(stack).toMatchObject({ kind: 'stack', layout: 'dependent' })
    expect(stack.fields[0]).toEqual(
      expect.objectContaining({
        name: 'classPolicy.mode',
        defaultValue: DEFAULT_SPECIES_CLASS_POLICY_MODE,
      }),
    )
    expect(stack.fields[1]).toEqual(
      expect.objectContaining({
        name: 'classPolicy.classIds',
      }),
    )
  })
})

describe('speciesLevelLimitsFields', () => {
  it('defaults maximum character level to the campaign max', () => {
    const campaignMax = 15
    const fields = speciesLevelLimitsFields({
      campaignRules: { ...defaultCampaignRules(), maxCharacterLevel: campaignMax },
    })
    const stack = expectStack(fields[0])
    expect(stack).toMatchObject({ kind: 'stack', layout: 'dependent' })
    expect(stack.fields[1]).toEqual(
      expect.objectContaining({
        name: 'maxCharacterLevel',
        defaultValue: String(campaignMax),
        hint: `Must be at most the campaign maximum (${campaignMax}).`,
      }),
    )
  })

  it('uses class-specific limits in a dependent stack with nested array', () => {
    const fields = speciesLevelLimitsFields({})
    const stack = expectStack(fields[1])
    expect(stack).toMatchObject({
      kind: 'stack',
      layout: 'dependent',
      dependentsChrome: 'subtle',
      dependentsChromeScope: 'arrayItems',
    })
    expect(stack.fields[0]).toMatchObject({
      type: 'switch',
      name: ENABLE_CLASS_LEVEL_CAPS_FIELD,
      label: 'Class-specific limits',
      hint: 'Optionally limit how far this species can progress in individual classes.',
    })
    expect(stack.fields[1]).toMatchObject({
      kind: 'array',
      name: 'classLevelCaps',
      addLabel: 'Add class limit',
    })
  })
})

describe('mergeCharacterCreationFormDefaults', () => {
  it('fills missing multiclass policy defaults from contracts', () => {
    expect(mergeMulticlassingFormDefaults(undefined)).toEqual({
      policy: DEFAULT_SPECIES_MULTICLASS_POLICY,
      classPolicy: { mode: DEFAULT_SPECIES_CLASS_POLICY_MODE, classIds: [] },
    })
    expect(mergeMulticlassingFormDefaults({ classPolicy: { mode: 'only', classIds: ['fighter'] } } as never)).toEqual({
      policy: DEFAULT_SPECIES_MULTICLASS_POLICY,
      classPolicy: { mode: 'only', classIds: ['fighter'] },
    })
  })

  it('merges enabled character creation blocks on the rules tab', () => {
    expect(
      mergeCharacterCreationFormDefaults(undefined, {
        policyEnabled: true,
        limitsEnabled: true,
      }),
    ).toEqual({
      multiclassing: {
        policy: DEFAULT_SPECIES_MULTICLASS_POLICY,
        classPolicy: { mode: DEFAULT_SPECIES_CLASS_POLICY_MODE, classIds: [] },
      },
      levelLimits: {
        limitMaxCharacterLevel: false,
        maxCharacterLevel: undefined,
        enableClassLevelCaps: false,
        classLevelCaps: [],
      },
    })
  })
})

describe('species-rules-form-fields conversions', () => {
  it('applies multiclass defaults when mapping stored multiclassing', () => {
    expect(
      characterCreationToFormValues({
        multiclassing: { classPolicy: { mode: 'only', classIds: ['fighter'] } } as never,
      }),
    ).toEqual({
      multiclassing: {
        policy: DEFAULT_SPECIES_MULTICLASS_POLICY,
        classPolicy: { mode: 'only', classIds: ['fighter'] },
      },
    })
  })

  it('maps stored level limits with null max to form shape', () => {
    expect(
      characterCreationToFormValues({
        levelLimits: defaultSpeciesLevelLimits(),
      }),
    ).toEqual({
      levelLimits: {
        limitMaxCharacterLevel: false,
        maxCharacterLevel: undefined,
        enableClassLevelCaps: false,
        classLevelCaps: [],
      },
    })
  })

  it('enables the class limits switch when stored caps exist', () => {
    expect(
      characterCreationToFormValues({
        levelLimits: {
          maxCharacterLevel: null,
          classLevelCaps: [{ classId: 'wizard', maxLevel: 5 }],
        },
      }),
    ).toEqual({
      levelLimits: {
        limitMaxCharacterLevel: false,
        maxCharacterLevel: undefined,
        enableClassLevelCaps: true,
        classLevelCaps: [{ classId: 'wizard', maxLevel: 5 }],
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
        enableClassLevelCaps: true,
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

  it('clears class level caps when class-specific limits are disabled', () => {
    const stored = characterCreationFromFormValues({
      levelLimits: {
        limitMaxCharacterLevel: false,
        enableClassLevelCaps: false,
        classLevelCaps: [{ classId: 'wizard', maxLevel: 5 }],
      },
    })

    expect(stored?.levelLimits).toEqual({
      maxCharacterLevel: null,
      classLevelCaps: [],
    })
  })

  it('rejects level limits above the campaign cap', () => {
    const issues: Array<{ message?: string; path?: PropertyKey[] }> = []
    refineSpeciesCharacterCreationForm(
      {
        levelLimits: {
          limitMaxCharacterLevel: true,
          maxCharacterLevel: 25,
          enableClassLevelCaps: false,
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

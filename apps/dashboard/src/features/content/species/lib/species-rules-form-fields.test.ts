import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SPECIES_CLASS_POLICY_MODE,
  DEFAULT_SPECIES_MULTICLASS_POLICY,
  defaultSpeciesLevelLimits,
  defaultMulticlassingRules,
  defaultSubclassingRules,
  levelValidationMessages,
  MAX_CHARACTER_LEVEL,
} from '@rpg/contracts'

import { type DependentConfig, type FormItem } from '@rpg/ui/form'

import { defaultCampaignRules } from '../../lib/form-options/content-campaign-rules'
import {
  ENABLE_CLASS_LEVEL_CAPS_FIELD,
  multiclassingPolicyFields,
  speciesLevelLimitsFields,
} from './species-rules-form-fields'
import {
  SPECIES_CLASS_POLICY_ALLOWED_CLASSES_HINT,
  SPECIES_CLASS_POLICY_ALLOWED_CLASSES_LABEL,
  SPECIES_CLASS_POLICY_FORBIDDEN_CLASSES_HINT,
  SPECIES_CLASS_POLICY_FORBIDDEN_CLASSES_LABEL,
} from './species-rules-form-labels'
import {
  characterCreationFromFormValues,
  characterCreationToFormValues,
  mergeCharacterCreationFormDefaults,
  mergeMulticlassingFormDefaults,
  refineSpeciesCharacterCreationForm,
} from './species-rules-form-values'

function expectDependent(item: FormItem | undefined): DependentConfig {
  if (!item || !('kind' in item) || item.kind !== 'dependent') {
    throw new Error('expected dependent field')
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
    const dependent = expectDependent(fields[1])
    expect(dependent).toMatchObject({
      kind: 'dependent',
      separator: 'subtle',
    })
    expect(dependent.controller).toEqual(
      expect.objectContaining({
        name: 'classPolicy.mode',
        defaultValue: DEFAULT_SPECIES_CLASS_POLICY_MODE,
      }),
    )
    expect(dependent.dependents.fields[0]).toEqual(
      expect.objectContaining({
        type: 'combobox',
        name: 'classPolicy.classIds',
        label: SPECIES_CLASS_POLICY_ALLOWED_CLASSES_LABEL,
        hint: SPECIES_CLASS_POLICY_ALLOWED_CLASSES_HINT,
        visibility: expect.objectContaining({ dependsOn: ['classPolicy.mode'] }),
      }),
    )
    expect(dependent.dependents.fields[1]).toEqual(
      expect.objectContaining({
        type: 'combobox',
        name: 'classPolicy.classIds',
        label: SPECIES_CLASS_POLICY_FORBIDDEN_CLASSES_LABEL,
        hint: SPECIES_CLASS_POLICY_FORBIDDEN_CLASSES_HINT,
        visibility: expect.objectContaining({ dependsOn: ['classPolicy.mode'] }),
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
    const dependent = expectDependent(fields[0])
    expect(dependent).toMatchObject({
      kind: 'dependent',
      separator: 'subtle',
    })
    expect(dependent.dependents.fields[0]).toEqual(
      expect.objectContaining({
        name: 'maxCharacterLevel',
        defaultValue: String(campaignMax),
        hint: `Must be at most the campaign maximum (${campaignMax}).`,
      }),
    )
  })

  it('uses class-specific limits in a dependent stack with nested array', () => {
    const fields = speciesLevelLimitsFields({})
    const dependent = expectDependent(fields[1])
    expect(dependent).toMatchObject({
      kind: 'dependent',
    })
    expect(dependent.controller).toMatchObject({
      type: 'switch',
      name: ENABLE_CLASS_LEVEL_CAPS_FIELD,
      label: 'Class-specific limits',
      hint: 'Optionally limit how far this species can progress in individual classes.',
    })
    expect(dependent.dependents.fields[0]).toMatchObject({
      kind: 'array',
      name: 'classLevelCaps',
      addAction: { label: 'Add class limit' },
    })
  })
})

describe('mergeCharacterCreationFormDefaults', () => {
  it('fills missing multiclass policy defaults from contracts', () => {
    expect(mergeMulticlassingFormDefaults(undefined)).toEqual({
      policy: DEFAULT_SPECIES_MULTICLASS_POLICY,
      classPolicy: { mode: DEFAULT_SPECIES_CLASS_POLICY_MODE, classIds: [] },
    })
    expect(
      mergeMulticlassingFormDefaults({
        classPolicy: { mode: 'only', classIds: ['fighter'] },
      } as never),
    ).toEqual({
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

  it('rejects max character level above the campaign max', () => {
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

    expect(issues[0]?.message).toBe(
      levelValidationMessages.overCampaignMax({ maxLevel: MAX_CHARACTER_LEVEL }),
    )
    expect(issues[0]?.path).toEqual(['characterCreation', 'levelLimits', 'maxCharacterLevel'])
  })

  it('rejects class level cap above the campaign max', () => {
    const issues: Array<{ message?: string; path?: PropertyKey[] }> = []
    refineSpeciesCharacterCreationForm(
      {
        levelLimits: {
          limitMaxCharacterLevel: false,
          maxCharacterLevel: undefined,
          enableClassLevelCaps: true,
          classLevelCaps: [{ classId: 'wizard', maxLevel: 25 }],
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

    expect(issues[0]?.message).toBe(
      levelValidationMessages.overCampaignMax({ maxLevel: MAX_CHARACTER_LEVEL }),
    )
    expect(issues[0]?.path).toEqual([
      'characterCreation',
      'levelLimits',
      'classLevelCaps',
      0,
      'maxLevel',
    ])
  })
})

describe('default campaign rules', () => {
  it('includes resolved character configuration defaults', () => {
    expect(defaultCampaignRules().multiclassing).toEqual(defaultMulticlassingRules())
    expect(defaultCampaignRules().subclassing).toEqual(defaultSubclassingRules())
  })
})

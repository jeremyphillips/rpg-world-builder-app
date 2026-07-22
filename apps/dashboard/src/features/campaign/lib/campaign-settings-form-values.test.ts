import { describe, expect, it } from 'vitest'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'
import {
  defaultMulticlassingRules,
  defaultSubclassingRules,
  DEFAULT_MULTICLASSING_ENABLED,
  DEFAULT_PRIMARY_ABILITY_MINIMUM,
  DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
  DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
  DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
  DEFAULT_SUBCLASS_CHOICES_ENABLED,
  resolveCharacterCreationPatch,
  type Campaign,
  type CreatureTypeId,
} from '@rpg/contracts'

import {
  buildCreateCampaignInput,
  type CampaignCreateValues,
} from './campaign-settings-form-values'
import {
  buildUpdateCampaignInput,
  mapCampaignToSettingsValues,
} from './profile/campaign-profile-form-values'
import {
  buildCharacterCreationPatchInput,
  buildCharacterCreationPatchInputFromCreateWizard,
  mapRulesetPatchToRulesValues,
} from './rules/character-configuration/character-configuration-form-values'
import { languageProficiencyRulesDefaultValues } from './rules/character-configuration/language-proficiency-form-values'
import { mapStartingWealthToFormValues } from './rules/character-configuration/starting-wealth-form-values'

const defaultStartingWealth = mapStartingWealthToFormValues(
  getStandardStartingWealthRules('srd-cc-5.2.1'),
)

const campaign: Campaign = {
  id: 'c1',
  identity: {
    name: 'Sunless Citadel',
    description: 'A classic dungeon delve.',
    imageKey: 'banner.jpg',
  },
  configuration: {
    flavor: {
      playStyle: ['dungeon_crawl'],
      mood: ['heroic'],
      magicLevel: 'standard_fantasy',
      difficulty: 'dangerous',
    },
  },
  status: 'active',
  visibility: 'private',
  rulesetId: 'srd-cc-5.2.1',
  createdBy: 'u1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const defaultRules: CampaignCreateValues = {
  name: 'Sunless Citadel',
  description: 'A classic dungeon delve.',
  banner: [],
  startingLevel: 1,
  importedCharactersPolicy: 'disabled',
  playStyle: ['dungeon_crawl'],
  mood: ['heroic'],
  magicLevel: 'standard_fantasy',
  difficulty: 'dangerous',
}

const defaultMulticlassingFields = {
  multiclassingEnabled: DEFAULT_MULTICLASSING_ENABLED,
  primaryAbilityMinimumEnabled: DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
  primaryAbilityMinimumScore: DEFAULT_PRIMARY_ABILITY_MINIMUM,
  speciesMulticlassPolicyEnabled: DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
  speciesLevelLimitsEnabled: DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
  subclassChoicesEnabled: DEFAULT_SUBCLASS_CHOICES_ENABLED,
  startingWealth: defaultStartingWealth,
  ...languageProficiencyRulesDefaultValues(),
} as const

describe('mapCampaignToSettingsValues', () => {
  it('maps identity and flavor fields to the flat settings form shape', () => {
    expect(mapCampaignToSettingsValues(campaign)).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      banner: [],
      playStyle: ['dungeon_crawl'],
      mood: ['heroic'],
      magicLevel: 'standard_fantasy',
      difficulty: 'dangerous',
    })
  })

  it('falls back when flavor is absent', () => {
    const minimal: Campaign = {
      ...campaign,
      configuration: {},
    }

    expect(mapCampaignToSettingsValues(minimal)).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      banner: [],
      playStyle: undefined,
      mood: undefined,
      magicLevel: undefined,
      difficulty: undefined,
    })
  })
})

describe('buildCharacterCreationPatchInput', () => {
  it('maps flat rules fields to the nested patch shape', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 3,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: false,
        importedCharactersPolicy: 'approval_required',
        allowedCharacterCreatureTypes: ['humanoid'],
        ...defaultMulticlassingFields,
      }),
    ).toEqual({
      startingLevel: 3,
      importedCharacters: { policy: 'approval_required' },
    })
  })

  it('includes extended progression in progression when enabled', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: true,
        extendedTierName: 'Epic Destiny',
        extendedMaxLevel: 30,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid'],
        ...defaultMulticlassingFields,
      }),
    ).toEqual({
      startingLevel: 1,
      importedCharacters: { policy: 'disabled' },
      progression: {
        extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
      },
    })
  })

  it('includes creature type policy when not default', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: false,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid', 'construct'] as CreatureTypeId[],
        ...defaultMulticlassingFields,
      }),
    ).toMatchObject({
      species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid', 'construct'] } },
    })
  })

  it('omits creature type policy when default', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: false,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid'],
        ...defaultMulticlassingFields,
      }),
    ).not.toHaveProperty('species')
  })

  it('includes multiclassing overrides when not at defaults', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: false,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid'],
        multiclassingEnabled: false,
        primaryAbilityMinimumEnabled: true,
        primaryAbilityMinimumScore: 15,
        speciesMulticlassPolicyEnabled: true,
        speciesLevelLimitsEnabled: false,
        subclassChoicesEnabled: true,
        startingWealth: defaultStartingWealth,
        ...languageProficiencyRulesDefaultValues(),
      }),
    ).toEqual({
      startingLevel: 1,
      importedCharacters: { policy: 'disabled' },
      multiclassing: {
        enabled: false,
        requirements: {
          primaryAbilityMinimum: { minimumScore: 15 },
          speciesPolicy: { enabled: true },
        },
      },
    })
  })

  it('omits multiclassing when all values are defaults', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: false,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid'],
        ...defaultMulticlassingFields,
      }),
    ).not.toHaveProperty('multiclassing')
  })

  it('includes full multiclassing values when explicit multiclassing output is requested', () => {
    expect(
      buildCharacterCreationPatchInput(
        {
          startingLevel: 1,
          maxCharacterLevel: 20,
          extendedProgressionEnabled: false,
          importedCharactersPolicy: 'disabled',
          allowedCharacterCreatureTypes: ['humanoid'],
          multiclassingEnabled: true,
          primaryAbilityMinimumEnabled: true,
          primaryAbilityMinimumScore: 13,
          speciesMulticlassPolicyEnabled: true,
          speciesLevelLimitsEnabled: true,
          subclassChoicesEnabled: true,
          startingWealth: defaultStartingWealth,
          ...languageProficiencyRulesDefaultValues(),
        },
        { includeDefaultMulticlassing: true },
      ),
    ).toMatchObject({
      multiclassing: {
        enabled: true,
        requirements: {
          primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
          speciesPolicy: { enabled: true },
          speciesLevelLimits: { enabled: true },
        },
      },
    })
  })

  it('includes subclassing when disabled', () => {
    expect(
      buildCharacterCreationPatchInput({
        startingLevel: 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: false,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid'],
        ...defaultMulticlassingFields,
        subclassChoicesEnabled: false,
      }),
    ).toMatchObject({
      subclasses: { enabled: false },
    })
  })

  it('includes default subclassing when explicit subclassing output is requested', () => {
    expect(
      buildCharacterCreationPatchInput(
        {
          startingLevel: 1,
          maxCharacterLevel: 20,
          extendedProgressionEnabled: false,
          importedCharactersPolicy: 'disabled',
          allowedCharacterCreatureTypes: ['humanoid'],
          ...defaultMulticlassingFields,
        },
        { includeDefaultSubclassing: true },
      ),
    ).toMatchObject({
      subclasses: { enabled: true },
    })
  })
})

describe('buildCharacterCreationPatchInputFromCreateWizard', () => {
  it('merges create-wizard values with defaults before building the patch', () => {
    expect(
      buildCharacterCreationPatchInputFromCreateWizard({
        startingLevel: 3,
        importedCharactersPolicy: 'approval_required',
      }),
    ).toEqual({
      startingLevel: 3,
      importedCharacters: { policy: 'approval_required' },
    })
  })
})

describe('buildCreateCampaignInput', () => {
  it('maps the flat wizard values to the create payload including characterCreation and flavor', () => {
    const values: CampaignCreateValues = {
      ...defaultRules,
      startingLevel: 3,
      importedCharactersPolicy: 'approval_required',
    }

    expect(buildCreateCampaignInput(values, 'banner.webp', 'classic-adventure')).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      imageKey: 'banner.webp',
      campaignTemplateId: 'classic-adventure',
      characterCreation: {
        startingLevel: 3,
        importedCharacters: { policy: 'approval_required' },
      },
      flavor: {
        playStyle: ['dungeon_crawl'],
        mood: ['heroic'],
        magicLevel: 'standard_fantasy',
        difficulty: 'dangerous',
      },
    })
  })

  it('omits imageKey when no banner was uploaded', () => {
    expect(buildCreateCampaignInput(defaultRules)).not.toHaveProperty('imageKey')
  })
})

describe('mapRulesetPatchToRulesValues', () => {
  it('maps resolved patch data to flat rules form values', () => {
    expect(
      mapRulesetPatchToRulesValues({
        ...resolveCharacterCreationPatch(
          {
            startingLevel: 3,
            importedCharacters: { policy: 'approval_required' },
            progression: {
              maxCharacterLevel: 25,
              extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
            },
            species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid', 'fey'] } },
          },
          getStandardStartingWealthRules('srd-cc-5.2.1'),
        ),
        multiclassing: defaultMulticlassingRules(),
        subclasses: defaultSubclassingRules(),
      }),
    ).toEqual({
      startingLevel: 3,
      maxCharacterLevel: 25,
      extendedProgressionEnabled: true,
      extendedTierName: 'Epic Destiny',
      extendedMaxLevel: 30,
      importedCharactersPolicy: 'approval_required',
      allowedCharacterCreatureTypes: ['humanoid', 'fey'],
      multiclassingEnabled: true,
      primaryAbilityMinimumEnabled: true,
      primaryAbilityMinimumScore: 13,
      speciesMulticlassPolicyEnabled: false,
      speciesLevelLimitsEnabled: false,
      subclassChoicesEnabled: true,
      startingWealth: defaultStartingWealth,
      ...languageProficiencyRulesDefaultValues(),
    })
  })
})

describe('buildUpdateCampaignInput', () => {
  it('maps settings form values to identity and flavor only', () => {
    expect(
      buildUpdateCampaignInput(mapCampaignToSettingsValues(campaign), 'new-banner.webp'),
    ).toEqual({
      name: 'Sunless Citadel',
      description: 'A classic dungeon delve.',
      imageKey: 'new-banner.webp',
      flavor: {
        playStyle: ['dungeon_crawl'],
        mood: ['heroic'],
        magicLevel: 'standard_fantasy',
        difficulty: 'dangerous',
      },
    })
  })

  it('omits imageKey when no new banner was uploaded', () => {
    expect(buildUpdateCampaignInput(mapCampaignToSettingsValues(campaign))).not.toHaveProperty(
      'imageKey',
    )
  })
})

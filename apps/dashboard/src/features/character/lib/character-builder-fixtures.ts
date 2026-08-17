import {
  DEFAULT_ABILITY_GENERATION_RULES,
  DEFAULT_SYSTEM_RULESET_ID,
  defaultCampaignMechanicsPatch,
  indexCharacterBuildCatalog,
  resolveCharacterCreationPatch,
  type CampaignNpcBuildContext,
  type CampaignPcBuildContext,
  type CharacterBuildCatalog,
  type CharacterBuildCatalogIndex,
  type ClassStored,
  type StandaloneBuildContext,
} from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { pickClass, pickSkillProficiency, pickSpecies } from '@/test/fixtures/pick'
import { makeSpecies } from '@/test/fixtures/factories/species'

const emptyCatalog: StandaloneBuildContext['catalog'] = {
  species: [],
  classes: [],
  spells: [],
  equipment: [],
  skillProficiencies: [],
  organizations: [],
  languages: [],
}

const storedFighter = {
  ...pickClass('fighter'),
  primaryAbilities: ['str'],
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 2, from: ['athletics'] }],
      },
    },
  },
} as const satisfies ClassStored

const fighterClass = storedFighter

const dwarfSpecies = pickSpecies('dwarf')

/** Dwarf-shaped species without naming metadata — for unsupported-name-generation tests. */
export const unsupportedNamingDwarfSpecies = makeSpecies({
  id: 'srd-cc-5.2.1:dwarf-no-naming',
  slug: 'dwarf-no-naming',
  name: 'Dwarf (no naming)',
  source: 'system',
  campaignId: null,
  culture: undefined,
})

/** Homebrew species for naming-policy inheritance tests. */
export const homebrewSpeciesFixture = makeSpecies({
  id: 'homebrew:river-folk',
  slug: 'river-folk',
  name: 'River Folk',
  source: 'homebrew',
})

const athleticsSkill = pickSkillProficiency('athletics')

export const populatedBuilderCatalog = {
  species: [dwarfSpecies],
  classes: [fighterClass],
  spells: [],
  equipment: [],
  skillProficiencies: [athleticsSkill],
  organizations: [],
  languages: [...listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)],
} satisfies CharacterBuildCatalog

export function createStandaloneBuilderContextFixture(
  overrides: Partial<StandaloneBuildContext> = {},
): StandaloneBuildContext {
  const rulesetId = overrides.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID

  return {
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'pc',
    mode: 'dashboard',
    scope: { type: 'standalone', rulesetId },
    rulesScope: { type: 'ruleset', rulesetId },
    ownershipTarget: { type: 'user' },
    rulesetId,
    catalog: emptyCatalog,
    characterCreationRules: {
      ...resolveCharacterCreationPatch(undefined, getStandardStartingWealthRules(rulesetId)),
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    },
    permissions: { canCreateCharacter: true },
    ...overrides,
  }
}

export function createPopulatedStandaloneBuilderContextFixture(
  overrides: Partial<StandaloneBuildContext> = {},
): StandaloneBuildContext {
  return createStandaloneBuilderContextFixture({
    catalog: populatedBuilderCatalog,
    ...overrides,
  })
}

export function createStandaloneBuilderCatalogIndexFixture(
  context: StandaloneBuildContext = createStandaloneBuilderContextFixture(),
): CharacterBuildCatalogIndex {
  return indexCharacterBuildCatalog(context.catalog)
}

const TEST_CAMPAIGN_ID = 'campaign-test-1'

export function createCampaignNpcBuilderContextFixture(
  overrides: Partial<CampaignNpcBuildContext> = {},
): CampaignNpcBuildContext {
  const rulesetId = overrides.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID
  const campaignId = overrides.rulesScope?.campaignId ?? TEST_CAMPAIGN_ID

  return {
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'npc',
    mode: 'dashboard',
    scope: { type: 'campaign', campaignId, rulesetId },
    rulesScope: { type: 'campaign', campaignId, rulesetId },
    ownershipTarget: { type: 'campaign', campaignId },
    acquisition: { kind: 'campaign_npc', campaignId },
    rulesetId,
    catalog: emptyCatalog,
    characterCreationRules: {
      ...resolveCharacterCreationPatch(undefined, getStandardStartingWealthRules(rulesetId)),
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    },
    permissions: { canCreateCharacter: true },
    ...overrides,
  }
}

export function createCampaignPcBuilderContextFixture(
  overrides: Partial<CampaignPcBuildContext> = {},
): CampaignPcBuildContext {
  const rulesetId = overrides.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID
  const campaignId =
    overrides.rulesScope?.type === 'campaign' ? overrides.rulesScope.campaignId : TEST_CAMPAIGN_ID

  return {
    channel: 'build',
    surface: 'dashboard',
    characterKind: 'pc',
    mode: 'dashboard',
    scope: { type: 'campaign', campaignId, rulesetId },
    rulesScope: { type: 'campaign', campaignId, rulesetId },
    ownershipTarget: { type: 'user', userId: 'user-test-1' },
    acquisition: {
      kind: 'campaign_pc_onboarding',
      campaignId,
    },
    rulesetId,
    catalog: emptyCatalog,
    characterCreationRules: {
      ...resolveCharacterCreationPatch(undefined, getStandardStartingWealthRules(rulesetId)),
      startingLevel: 3,
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: defaultCampaignMechanicsPatch().armorClass,
    },
    permissions: { canCreateCharacter: true },
    ...overrides,
  }
}

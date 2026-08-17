import {
  DEFAULT_ABILITY_GENERATION_RULES,
  DEFAULT_SYSTEM_RULESET_ID,
  defaultCampaignMechanicsPatch,
  indexCharacterBuildCatalog,
  resolveCharacterCreationPatch,
  type CampaignNpcBuildContext,
  type CampaignPcBuildContext,
  type CharacterBuildCatalogIndex,
  type StandaloneBuildContext,
} from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'
import { populatedBuilderCatalog } from '@/test/fixtures/factories/additional/character-build-catalog'
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

export { populatedBuilderCatalog }

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

export function createCampaignNpcBuilderContextFixture(
  overrides: Partial<CampaignNpcBuildContext> = {},
): CampaignNpcBuildContext {
  const rulesetId = overrides.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID
  const campaignId = overrides.rulesScope?.campaignId ?? STORY_CAMPAIGN_ID

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
    overrides.rulesScope?.type === 'campaign' ? overrides.rulesScope.campaignId : STORY_CAMPAIGN_ID

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

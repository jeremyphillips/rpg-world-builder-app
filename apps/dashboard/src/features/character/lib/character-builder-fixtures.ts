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
  type SkillProficiency,
  type Species,
  type StandaloneBuildContext,
} from '@rpg/contracts'
import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

const emptyCatalog: StandaloneBuildContext['catalog'] = {
  species: [],
  classes: [],
  spells: [],
  equipment: [],
  skillProficiencies: [],
  languages: [],
}

const storedFighter = {
  id: 'srd-cc-5.2.1:fighter',
  slug: 'fighter',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light', 'medium'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 2, from: ['athletics'] }],
      },
    },
  },
  features: [],
} as const satisfies ClassStored

const fighterClass = storedFighter

const dwarfSpecies = {
  id: 'srd-cc-5.2.1:dwarf',
  slug: 'dwarf',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dwarf',
  description: '<p>Stout and hardy folk.</p>',
  creatureType: 'humanoid',
  sizes: ['medium'],
  movement: { walk: 30 },
  traits: [],
} as const satisfies Species

const athleticsSkill = {
  id: 'srd-cc-5.2.1:athletics',
  slug: 'athletics',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Athletics',
  ability: 'str',
  examples: ['Jump farther than normal', 'Stay afloat in rough water', 'Break something'],
} as const satisfies SkillProficiency

export const populatedBuilderCatalog = {
  species: [dwarfSpecies],
  classes: [fighterClass],
  spells: [],
  equipment: [],
  skillProficiencies: [athleticsSkill],
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

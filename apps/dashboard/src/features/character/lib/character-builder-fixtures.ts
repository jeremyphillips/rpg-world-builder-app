import {
  DEFAULT_ABILITY_GENERATION_RULES,
  DEFAULT_SYSTEM_RULESET_ID,
  defaultCampaignMechanicsPatch,
  indexCharacterBuildCatalog,
  resolveCharacterCreationPatch,
  withDerivedClassSkillFrom,
  type CharacterBuildCatalog,
  type CharacterBuildCatalogIndex,
  type ClassStored,
  type SkillProficiency,
  type Species,
  type StandaloneBuildContext,
} from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

const emptyCatalog: StandaloneBuildContext['catalog'] = {
  species: [],
  classes: [],
  spells: [],
  equipment: [],
  skillProficiencies: [],
}

const storedFighter = {
  id: 'srd-cc-5.2.1:fighter',
  slug: 'fighter',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: ['light', 'medium'],
    weapons: { categories: ['simple', 'martial'] },
    skills: { choose: 2 },
  },
  features: [],
} as const satisfies ClassStored

const fighterClass = withDerivedClassSkillFrom(storedFighter, [
  { slug: 'athletics', suggestedClasses: ['fighter'] },
])

const dwarfSpecies = {
  id: 'srd-cc-5.2.1:dwarf',
  slug: 'dwarf',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dwarf',
  description: '<p>Stout and hardy folk.</p>',
  creatureType: 'humanoid',
  sizes: ['medium'],
  speed: { walk: 30 },
  traits: [],
} as const satisfies Species

const athleticsSkill = {
  id: 'srd-cc-5.2.1:athletics',
  slug: 'athletics',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Athletics',
  ability: 'str',
  suggestedClasses: ['fighter'],
} as const satisfies SkillProficiency

export const populatedBuilderCatalog = {
  species: [dwarfSpecies],
  classes: [fighterClass],
  spells: [],
  equipment: [],
  skillProficiencies: [athleticsSkill],
} satisfies CharacterBuildCatalog

export function createStandaloneBuilderContextFixture(
  overrides: Partial<StandaloneBuildContext> = {},
): StandaloneBuildContext {
  const rulesetId = overrides.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID

  return {
    mode: 'dashboard',
    scope: { type: 'standalone', rulesetId },
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

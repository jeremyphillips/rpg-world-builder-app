import {
  DEFAULT_ABILITY_GENERATION_RULES,
  DEFAULT_SYSTEM_RULESET_ID,
  indexCharacterBuildCatalog,
  resolveCharacterCreationPatch,
  type CharacterBuildCatalogIndex,
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
    },
    permissions: { canCreateCharacter: true },
    ...overrides,
  }
}

export function createStandaloneBuilderCatalogIndexFixture(
  context: StandaloneBuildContext = createStandaloneBuilderContextFixture(),
): CharacterBuildCatalogIndex {
  return indexCharacterBuildCatalog(context.catalog)
}

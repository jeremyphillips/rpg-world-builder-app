import type { z } from 'zod'

import type { SystemRulesetId } from '../../primitives/ruleset'
import type { CharacterClass } from '../../content/classes/class'
import type { Equipment } from '../../content/equipment'
import type { SkillProficiency } from '../../content/skill-proficiency'
import type { Species } from '../../content/species'
import type { Spell } from '../../content/spell'
import { resolvedCampaignCharacterCreationPatchSchema } from '../../campaign/patches/campaign-character-creation-patch'
import { abilityGenerationRulesSchema } from './ability-generation'
import type {
  CharacterBuilderMode,
  CharacterBuildScope,
  StandaloneCharacterBuilderMode,
  StandaloneCharacterBuildScope,
} from './mode-scope'

// ---------------------------------------------------------------------------
// CharacterBuildContext — the normalized input the builder UI and resolvers
// consume. Consumers must not care whether rules came from standalone
// defaults or campaign patches; campaign scope later swaps the rules source
// and filters the catalog without touching this shape.
// ---------------------------------------------------------------------------

/**
 * Catalog lists as delivered by the API — arrays only at this boundary.
 * Resolvers and derive code look items up through
 * {@link indexCharacterBuildCatalog}, never by scanning these arrays.
 */
export type CharacterBuildCatalog = {
  species: Species[]
  classes: CharacterClass[]
  spells: Spell[]
  equipment: Equipment[]
  skillProficiencies: SkillProficiency[]
}

export type CharacterBuildCatalogIndex = {
  species: ReadonlyMap<string, Species>
  classes: ReadonlyMap<string, CharacterClass>
  spells: ReadonlyMap<string, Spell>
  equipment: ReadonlyMap<string, Equipment>
  skillProficiencies: ReadonlyMap<string, SkillProficiency>
}

function byId<T extends { id: string }>(items: readonly T[]): ReadonlyMap<string, T> {
  return new Map(items.map((item) => [item.id, item]))
}

/** Build once per catalog (memoize in the consuming hook), pass to resolvers/derive. */
export function indexCharacterBuildCatalog(
  catalog: CharacterBuildCatalog,
): CharacterBuildCatalogIndex {
  return {
    species: byId(catalog.species),
    classes: byId(catalog.classes),
    spells: byId(catalog.spells),
    equipment: byId(catalog.equipment),
    skillProficiencies: byId(catalog.skillProficiencies),
  }
}

/**
 * Character-creation rules the builder consumes: the resolved campaign patch
 * shape (standalone resolves it with no patch applied) plus ability
 * generation, which has no campaign patch surface yet.
 */
export const resolvedCharacterCreationRulesSchema =
  resolvedCampaignCharacterCreationPatchSchema.extend({
    abilityGeneration: abilityGenerationRulesSchema,
  })

export type ResolvedCharacterCreationRules = z.infer<typeof resolvedCharacterCreationRulesSchema>

export type CharacterBuilderPermissions = {
  canCreateCharacter: boolean
}

export type CharacterBuildContext = {
  mode: CharacterBuilderMode
  scope: CharacterBuildScope
  rulesetId: SystemRulesetId
  catalog: CharacterBuildCatalog
  characterCreationRules: ResolvedCharacterCreationRules
  permissions: CharacterBuilderPermissions
}

/** MVP instantiation — no campaign patch/membership context. */
export type StandaloneBuildContext = CharacterBuildContext & {
  mode: StandaloneCharacterBuilderMode
  scope: StandaloneCharacterBuildScope
}

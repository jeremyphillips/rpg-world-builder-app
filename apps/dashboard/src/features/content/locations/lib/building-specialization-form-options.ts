import {
  BUILDING_ARCHETYPE_IDS,
  getBuildingSpecializationTerms,
  type BuildingArchetype,
} from '@rpg/contracts'

/** Resolves registry specialization suggestions for the selected building archetype. */
export function resolveBuildingSpecializationSuggestions(
  values: Record<string, unknown>,
): readonly string[] {
  const archetype = values['classification.archetype']
  if (typeof archetype !== 'string') return []
  if (!BUILDING_ARCHETYPE_IDS.includes(archetype as BuildingArchetype)) return []
  return getBuildingSpecializationTerms(archetype as BuildingArchetype)
}

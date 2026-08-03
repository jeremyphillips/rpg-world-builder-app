import {
  formatBuildingFunctionFamilyLabels,
  getBuildingArchetypeLabel,
  getEffectiveBuildingFunctions,
  type BuildingClassification,
  type Location,
} from '@rpg/contracts'

import { buildBuildingArchetypeSearchTerms } from './building-archetype-form-options'

export function readLocationBuildingClassification(
  location: Location,
): BuildingClassification | undefined {
  if (location.kind !== 'structure' || location.structureType !== 'building') {
    return undefined
  }
  return location.classification
}

/** Broad discovery strings for the locations overview name search. */
export function getLocationOverviewSearchText(location: Location): readonly string[] {
  const parts: string[] = [location.name]
  const classification = readLocationBuildingClassification(location)

  if (!classification?.archetype) {
    return parts
  }

  parts.push(getBuildingArchetypeLabel(classification.archetype))

  if (classification.specialization) {
    parts.push(classification.specialization)
  }

  parts.push(
    ...buildBuildingArchetypeSearchTerms(classification.archetype),
    formatBuildingFunctionFamilyLabels(getEffectiveBuildingFunctions(classification)),
  )

  return parts
}

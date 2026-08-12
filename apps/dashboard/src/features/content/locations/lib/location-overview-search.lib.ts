import {
  formatBuildingFunctionFamilyLabels,
  getBuildingFacilityTypeLabel,
  getBuildingFormLabel,
  getEffectiveBuildingFunctions,
  type BuildingClassification,
  type Location,
} from '@rpg/contracts'

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

  if (!classification) {
    return parts
  }

  if (classification.form) parts.push(getBuildingFormLabel(classification.form))
  if (classification.facilityType) {
    parts.push(getBuildingFacilityTypeLabel(classification.facilityType))
  }
  const functionsLabel = formatBuildingFunctionFamilyLabels(
    getEffectiveBuildingFunctions(classification),
  )
  if (functionsLabel) parts.push(functionsLabel)

  return parts
}

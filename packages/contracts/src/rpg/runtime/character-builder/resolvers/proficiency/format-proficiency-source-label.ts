import type { CharacterBuildCatalogIndex } from '../../context'
import { LANGUAGE_GRANTS_SOURCE_ID } from '../../../character/languages'
import type { CharacterSelectionSource } from '../../../character/selection-sources'

export type ProficiencySourceRowKind =
  | 'default'
  | 'weaponCategory'
  | 'armorCategory'
  | 'toolCategory'

export type FormatProficiencySourceLabelOptions = {
  rowKind?: ProficiencySourceRowKind
}

function classNameForSource(
  source: CharacterSelectionSource,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  if (source.sourceId) {
    const characterClass = catalogIndex.classes.get(source.sourceId)
    if (characterClass) return characterClass.name
  }

  return 'Class'
}

function formatSingleProficiencySourceLabel(
  source: CharacterSelectionSource,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  switch (source.kind) {
    case 'classFeature':
    case 'subclassFeature':
      return `Granted by ${classNameForSource(source, catalogIndex)}`
    case 'characterCreation':
      return source.grantId === LANGUAGE_GRANTS_SOURCE_ID
        ? 'Granted by Origin Languages'
        : 'Granted by Character Creation'
    case 'speciesTrait':
      return 'Granted by Species'
    case 'heritageOption':
      return 'Granted by Heritage'
    case 'feat':
      return 'Granted by Feat'
    case 'manual':
      return 'Added manually'
    default:
      return 'Granted'
  }
}

function prefixForRowKind(rowKind: ProficiencySourceRowKind | undefined): string {
  switch (rowKind) {
    case 'weaponCategory':
      return 'Weapon category · '
    case 'armorCategory':
      return 'Armor training · '
    case 'toolCategory':
      return 'Tool proficiency · '
    default:
      return ''
  }
}

/** MVP proficiency provenance labels until BENCH-118 unifies with equipment formatting. */
export function formatProficiencySourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: CharacterBuildCatalogIndex,
  options: FormatProficiencySourceLabelOptions = {},
): string {
  if (!sources?.length) return 'Unknown source'

  const labels = sources.map((source) => formatSingleProficiencySourceLabel(source, catalogIndex))
  const uniqueLabels = [...new Set(labels)]
  const combined = uniqueLabels.join(', ')

  const prefix = prefixForRowKind(options.rowKind)
  if (!prefix) return combined

  if (uniqueLabels.length === 1 && uniqueLabels[0]?.startsWith('Granted by ')) {
    return `${prefix}${uniqueLabels[0]}`
  }

  return `${prefix}${combined}`
}

/** ChoiceSet selection provenance for proficiency step selected rows. */
export function formatProficiencyChoiceSourceLabel(choiceSetLabel: string): string {
  return `Chosen from ${choiceSetLabel}`
}

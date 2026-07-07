import { LANGUAGE_GRANTS_SOURCE_ID } from './languages'
import type { CharacterSelectionSource, CharacterSelectionSourceKind } from './selection-sources'

// ---------------------------------------------------------------------------
// Shared provenance labels for character rows (equipment, proficiencies, …).
// ---------------------------------------------------------------------------

export type SelectionSourceLabelCatalogIndex = {
  classes: ReadonlyMap<string, { name: string }>
}

export type SelectionSourceRowKind = 'default' | 'weaponCategory' | 'armorCategory' | 'toolCategory'

export type FormatSelectionSourceLabelOptions = {
  rowKind?: SelectionSourceRowKind
}

const STATIC_SELECTION_SOURCE_LABELS: Partial<Record<CharacterSelectionSourceKind, string>> = {
  speciesTrait: 'Granted by Species',
  heritageOption: 'Granted by Heritage',
  feat: 'Granted by Feat',
  manual: 'Added manually',
  startingGold: 'Purchased with starting gold',
  backgroundStartingEquipment: 'From background starting equipment',
  startingWealthTier: 'Granted by starting wealth',
  equipment: 'Starting equipment',
}

const CLASS_GRANT_SOURCE_KINDS = new Set<CharacterSelectionSourceKind>([
  'classFeature',
  'subclassFeature',
  'classSpellcasting',
])

function classNameForSource(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  if (source.sourceId) {
    const characterClass = catalogIndex.classes.get(source.sourceId)
    if (characterClass) return characterClass.name
  }

  return 'Class'
}

function formatCharacterCreationLabel(source: CharacterSelectionSource): string {
  return source.grantId === LANGUAGE_GRANTS_SOURCE_ID
    ? 'Granted by Origin Languages'
    : 'Granted by Character Creation'
}

function formatClassStartingEquipmentLabel(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  const characterClass = source.sourceId ? catalogIndex.classes.get(source.sourceId) : undefined
  const className = characterClass?.name ?? 'class'
  return `From ${className} starting equipment`
}

function formatSingleSelectionSourceLabel(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  const staticLabel = STATIC_SELECTION_SOURCE_LABELS[source.kind]
  if (staticLabel) return staticLabel

  if (CLASS_GRANT_SOURCE_KINDS.has(source.kind)) {
    return `Granted by ${classNameForSource(source, catalogIndex)}`
  }

  if (source.kind === 'characterCreation') {
    return formatCharacterCreationLabel(source)
  }

  if (source.kind === 'classStartingEquipment') {
    return formatClassStartingEquipmentLabel(source, catalogIndex)
  }

  return 'Granted'
}

function prefixForRowKind(rowKind: SelectionSourceRowKind | undefined): string {
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

/** Formats deduped provenance labels for one or more selection sources. */
export function formatSelectionSourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: SelectionSourceLabelCatalogIndex,
  options: FormatSelectionSourceLabelOptions = {},
): string {
  if (!sources?.length) return 'Unknown source'

  const labels = sources.map((source) => formatSingleSelectionSourceLabel(source, catalogIndex))
  const uniqueLabels = [...new Set(labels)]
  const combined = uniqueLabels.join(', ')

  const prefix = prefixForRowKind(options.rowKind)
  if (!prefix) return combined

  if (uniqueLabels.length === 1 && uniqueLabels[0]?.startsWith('Granted by ')) {
    return `${prefix}${uniqueLabels[0]}`
  }

  return `${prefix}${combined}`
}

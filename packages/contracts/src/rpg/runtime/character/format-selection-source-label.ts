import {
  getContentTypeSentenceForm,
  getContentTypeTerm,
} from '../../content/lib/content-type-terms'
import { resolveTraitName } from '../../content/lib/grants/trait-display'
import type { CharacterClass } from '../../content/classes/class'
import type { Species } from '../../content/species'
import {
  DEFAULT_LANGUAGE_PROFICIENCY_CHOICES,
  resolveOriginLanguageChoiceLabel,
} from '../../primitives/proficiency/character-creation-proficiency-rules'
import type { ResolvedCharacterCreationRules } from '../character-builder/context'
import { LANGUAGE_GRANTS_SOURCE_ID } from './sheet/languages'
import type {
  CharacterSelectionSource,
  CharacterSelectionSourceKind,
} from './sheet/selection-sources'
import type { VocabularyTerm } from '../../vocab/types'
import type { ChoiceSetOwnerKind, ChoiceSetProvenance } from '../character-builder/choice-set'

// ---------------------------------------------------------------------------
// Shared provenance labels for character rows (equipment, proficiencies, …).
// One resolver model, three presentation densities (compact / standard / grant-card).
// ---------------------------------------------------------------------------

/** Rules-configuration and character-creation defaults scoped to all characters. */
export const ORIGIN_PROVENANCE_TERM = {
  label: 'Origin',
  description: 'Character creation and rules-configuration defaults applied to every character.',
  sentence: {
    singular: 'origin',
    plural: 'origins',
  },
} as const satisfies VocabularyTerm

export const ORIGIN_PROVENANCE_LABEL = ORIGIN_PROVENANCE_TERM.label

type SelectionSourceClassCatalogEntry = Pick<CharacterClass, 'name'> &
  Partial<Pick<CharacterClass, 'features'>>

export type SelectionSourceLabelCatalogIndex = {
  classes: ReadonlyMap<string, SelectionSourceClassCatalogEntry>
  species?: ReadonlyMap<string, Species>
  /** Origin language choice label from character-creation rules. */
  originLanguageChoiceLabel?: string
}

/** Builds the catalog index consumed by selection-source label formatters. */
export function buildSelectionSourceLabelCatalogIndex(args: {
  catalogIndex: Pick<SelectionSourceLabelCatalogIndex, 'classes' | 'species'>
  characterCreationRules?: Pick<ResolvedCharacterCreationRules, 'proficiencyChoices'>
}): SelectionSourceLabelCatalogIndex {
  return {
    classes: args.catalogIndex.classes,
    species: args.catalogIndex.species,
    originLanguageChoiceLabel: args.characterCreationRules
      ? resolveOriginLanguageChoiceLabel(args.characterCreationRules.proficiencyChoices.languages)
      : undefined,
  }
}

export type SelectionSourceRowKind = 'default' | 'weaponCategory' | 'armorCategory' | 'toolCategory'

export type FormatSelectionSourceLabelOptions = {
  rowKind?: SelectionSourceRowKind
}

export type SelectionSourceProvenance = {
  sourceKind: CharacterSelectionSourceKind
  ownerKind?: ChoiceSetOwnerKind
  /** Nearest cause — feature, trait, or heritage option name. */
  primaryLabel: string
  /** Owner record name — class, species, subclass, heritage container. */
  ownerLabel?: string
  /** Right-hand context for grant-card density. */
  parentContext?: string
}

const STATIC_SELECTION_SOURCE_LABELS: Partial<Record<CharacterSelectionSourceKind, string>> = {
  speciesTrait: `Granted by ${getContentTypeTerm('species').label}`,
  heritageOption: 'Granted by Heritage',
  feat: `Granted by ${getContentTypeTerm('feats').label}`,
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

const GRANT_CARD_LABEL_JOIN = ' · ' as const
const MULTI_SOURCE_LABEL_JOIN = ', ' as const

function classNameForSource(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  if (source.sourceId) {
    const characterClass = catalogIndex.classes.get(source.sourceId)
    if (characterClass) return characterClass.name
  }

  return getContentTypeTerm('classes').label
}

function findClassFeature(
  characterClass: { features?: CharacterClass['features'] },
  grantId: string,
): { name: string } | undefined {
  return characterClass.features?.find((feature) => feature.id === grantId)
}

function findSpeciesTrait(species: Species, grantId: string) {
  return species.traits.find((trait) => trait.id === grantId)
}

function findHeritageOption(species: Species, grantId: string) {
  return species.heritage?.options.find((option) => option.id === grantId)
}

function genericKindLabel(kind: CharacterSelectionSourceKind): string {
  const staticLabel = STATIC_SELECTION_SOURCE_LABELS[kind]
  if (staticLabel) return staticLabel

  if (CLASS_GRANT_SOURCE_KINDS.has(kind)) {
    return `Granted by ${getContentTypeTerm('classes').label}`
  }

  if (kind === 'characterCreation') {
    return 'Granted by Character Creation'
  }

  if (kind === 'classStartingEquipment') {
    return 'From starting equipment'
  }

  return 'Granted'
}

function resolveClassFeatureProvenance(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): SelectionSourceProvenance {
  const characterClass = source.sourceId ? catalogIndex.classes.get(source.sourceId) : undefined
  const feature =
    characterClass && source.grantId ? findClassFeature(characterClass, source.grantId) : undefined
  const ownerLabel = characterClass?.name ?? classNameForSource(source, catalogIndex)

  return {
    sourceKind: 'classFeature',
    ownerKind: 'class',
    primaryLabel: feature?.name ?? ownerLabel,
    ownerLabel,
    parentContext: feature ? `${ownerLabel} feature` : undefined,
  }
}

function resolveSubclassFeatureProvenance(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): SelectionSourceProvenance {
  const ownerLabel = source.sourceId ? catalogIndex.classes.get(source.sourceId)?.name : undefined

  return {
    sourceKind: 'subclassFeature',
    ownerKind: 'subclass',
    primaryLabel: source.grantId ?? ownerLabel ?? getContentTypeTerm('classes').label,
    ownerLabel,
    parentContext: ownerLabel ? `${ownerLabel} subclass` : undefined,
  }
}

function resolveSpeciesTraitProvenance(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): SelectionSourceProvenance {
  const species = source.sourceId ? catalogIndex.species?.get(source.sourceId) : undefined
  const trait = species && source.grantId ? findSpeciesTrait(species, source.grantId) : undefined
  const ownerLabel = species?.name ?? getContentTypeTerm('species').label

  return {
    sourceKind: 'speciesTrait',
    ownerKind: 'species',
    primaryLabel: trait ? resolveTraitName(trait) : ownerLabel,
    ownerLabel,
    parentContext: trait ? `${ownerLabel} trait` : undefined,
  }
}

function resolveHeritageOptionProvenance(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): SelectionSourceProvenance {
  const species = source.sourceId ? catalogIndex.species?.get(source.sourceId) : undefined
  const option = species && source.grantId ? findHeritageOption(species, source.grantId) : undefined
  const heritageName = species?.heritage?.name
  const ownerLabel = heritageName ?? 'Heritage'

  return {
    sourceKind: 'heritageOption',
    ownerKind: 'heritage',
    primaryLabel: option ? resolveTraitName(option) : ownerLabel,
    ownerLabel,
    parentContext: heritageName,
  }
}

function resolveClassSpellcastingProvenance(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): SelectionSourceProvenance {
  const ownerLabel = classNameForSource(source, catalogIndex)

  return {
    sourceKind: 'classSpellcasting',
    ownerKind: 'class',
    primaryLabel: ownerLabel,
    ownerLabel,
    parentContext: `${ownerLabel} ${getContentTypeSentenceForm('classes')}`,
  }
}

function resolveOriginLanguageGrantLabel(catalogIndex: SelectionSourceLabelCatalogIndex): string {
  return catalogIndex.originLanguageChoiceLabel ?? DEFAULT_LANGUAGE_PROFICIENCY_CHOICES[0].label
}

function resolveCharacterCreationProvenance(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): SelectionSourceProvenance {
  if (source.grantId === LANGUAGE_GRANTS_SOURCE_ID) {
    const primaryLabel = resolveOriginLanguageGrantLabel(catalogIndex)

    return {
      sourceKind: 'characterCreation',
      ownerKind: 'origin',
      primaryLabel,
      ownerLabel: primaryLabel,
    }
  }

  return {
    sourceKind: 'characterCreation',
    ownerKind: 'origin',
    primaryLabel: 'Character Creation',
    ownerLabel: ORIGIN_PROVENANCE_LABEL,
    parentContext: ORIGIN_PROVENANCE_LABEL,
  }
}

function resolveDefaultProvenance(source: CharacterSelectionSource): SelectionSourceProvenance {
  const staticLabel = STATIC_SELECTION_SOURCE_LABELS[source.kind]
  const primaryLabel =
    staticLabel?.replace(/^Granted by /, '').replace(/^From /, '') ?? 'Unknown source'

  return {
    sourceKind: source.kind,
    primaryLabel,
  }
}

/** Resolves structured provenance for a single selection source. Catalog lookup happens once here. */
export function resolveSelectionSourceProvenance(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): SelectionSourceProvenance {
  switch (source.kind) {
    case 'classFeature':
      return resolveClassFeatureProvenance(source, catalogIndex)
    case 'subclassFeature':
      return resolveSubclassFeatureProvenance(source, catalogIndex)
    case 'speciesTrait':
      return resolveSpeciesTraitProvenance(source, catalogIndex)
    case 'heritageOption':
      return resolveHeritageOptionProvenance(source, catalogIndex)
    case 'classSpellcasting':
      return resolveClassSpellcastingProvenance(source, catalogIndex)
    case 'characterCreation':
      return resolveCharacterCreationProvenance(source, catalogIndex)
    default:
      return resolveDefaultProvenance(source)
  }
}

/** Parent-context phrasing for choice-block source lines — preserves existing choice copy. */
export function formatChoiceSetProvenanceParentContext(
  provenance: Pick<ChoiceSetProvenance, 'ownerKind' | 'ownerLabel'>,
): string | undefined {
  if (!provenance.ownerKind) return undefined

  if (provenance.ownerKind === 'origin') {
    return ORIGIN_PROVENANCE_TERM.label
  }

  if (!provenance.ownerLabel) return undefined

  switch (provenance.ownerKind) {
    case 'species':
      return `${provenance.ownerLabel} ${getContentTypeSentenceForm('species')} trait`
    case 'heritage':
      return `${provenance.ownerLabel} heritage`
    case 'class':
      return `${provenance.ownerLabel} ${getContentTypeSentenceForm('classes')}`
    case 'subclass':
      return `${provenance.ownerLabel} subclass`
    case 'feat':
      return `${provenance.ownerLabel} ${getContentTypeSentenceForm('feats')}`
    default:
      return undefined
  }
}

function formatClassStartingEquipmentLabel(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  const characterClass = source.sourceId ? catalogIndex.classes.get(source.sourceId) : undefined
  const className = characterClass?.name ?? getContentTypeSentenceForm('classes')
  return `From ${className} starting equipment`
}

function formatLegacySingleSelectionSourceLabel(
  provenance: SelectionSourceProvenance,
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  const staticLabel = STATIC_SELECTION_SOURCE_LABELS[source.kind]
  if (staticLabel) return staticLabel

  if (CLASS_GRANT_SOURCE_KINDS.has(source.kind)) {
    return `Granted by ${provenance.ownerLabel ?? classNameForSource(source, catalogIndex)}`
  }

  if (source.kind === 'characterCreation') {
    return `Granted by ${provenance.primaryLabel}`
  }

  if (source.kind === 'classStartingEquipment') {
    return formatClassStartingEquipmentLabel(source, catalogIndex)
  }

  return 'Granted'
}

function formatSingleSelectionSourceLabel(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  const provenance = resolveSelectionSourceProvenance(source, catalogIndex)
  return formatLegacySingleSelectionSourceLabel(provenance, source, catalogIndex)
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

function formatCompactSingleSelectionSourceLabel(
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  const provenance = resolveSelectionSourceProvenance(source, catalogIndex)

  if (CLASS_GRANT_SOURCE_KINDS.has(source.kind)) {
    return provenance.ownerLabel ?? classNameForSource(source, catalogIndex)
  }

  if (source.kind === 'characterCreation') {
    return ORIGIN_PROVENANCE_LABEL
  }

  if (source.kind === 'speciesTrait') {
    return getContentTypeTerm('species').label
  }

  if (source.kind === 'heritageOption') {
    return 'Heritage'
  }

  const staticLabel = STATIC_SELECTION_SOURCE_LABELS[source.kind]
  if (staticLabel) {
    return staticLabel.replace(/^Granted by /, '').replace(/^From /, '')
  }

  return 'Unknown source'
}

function formatStandardSingleLabel(
  provenance: SelectionSourceProvenance,
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  if (
    provenance.ownerLabel &&
    provenance.primaryLabel &&
    provenance.primaryLabel !== provenance.ownerLabel
  ) {
    return `${provenance.ownerLabel} · ${provenance.primaryLabel}`
  }

  if (provenance.ownerLabel) {
    return provenance.ownerLabel
  }

  const legacy = formatSingleSelectionSourceLabel(source, catalogIndex)
  if (legacy !== 'Granted') {
    return legacy.replace(/^Granted by /, '').replace(/^From /, '')
  }

  return provenance.primaryLabel || genericKindLabel(source.kind).replace(/^Granted by /, '')
}

function formatGrantCardSingleLabel(
  provenance: SelectionSourceProvenance,
  source: CharacterSelectionSource,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  if (provenance.primaryLabel && provenance.parentContext) {
    return `Granted by ${provenance.primaryLabel}${GRANT_CARD_LABEL_JOIN}${provenance.parentContext}`
  }

  if (provenance.primaryLabel) {
    return `Granted by ${provenance.primaryLabel}`
  }

  const legacy = formatSingleSelectionSourceLabel(source, catalogIndex)
  if (legacy !== 'Granted') return legacy

  return genericKindLabel(source.kind)
}

function dedupeLabels(labels: string[]): string[] {
  return [...new Set(labels)]
}

function joinMultiSourceLabels(labels: string[], joiner: string, emptyFallback: string): string {
  const uniqueLabels = dedupeLabels(labels)
  if (!uniqueLabels.length) return emptyFallback
  return uniqueLabels.join(joiner)
}

/** Formats deduped provenance labels for one or more selection sources. */
export function formatSelectionSourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: SelectionSourceLabelCatalogIndex,
  options: FormatSelectionSourceLabelOptions = {},
): string {
  if (!sources?.length) return 'Unknown source'

  const labels = sources.map((source) => formatSingleSelectionSourceLabel(source, catalogIndex))
  const uniqueLabels = dedupeLabels(labels)
  const combined = uniqueLabels.join(MULTI_SOURCE_LABEL_JOIN)

  const prefix = prefixForRowKind(options.rowKind)
  if (!prefix) return combined

  if (uniqueLabels.length === 1 && uniqueLabels[0]?.startsWith('Granted by ')) {
    return `${prefix}${uniqueLabels[0]}`
  }

  return `${prefix}${combined}`
}

/** Compact provenance labels for tight summary rows (class name, Origin, …). */
export function formatCompactSelectionSourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  if (!sources?.length) return 'Unknown source'

  const labels = sources.map((source) =>
    formatCompactSingleSelectionSourceLabel(source, catalogIndex),
  )
  return joinMultiSourceLabels(labels, MULTI_SOURCE_LABEL_JOIN, 'Unknown source')
}

/** Standard two-part provenance labels (`Owner · Feature`). */
export function formatStandardSelectionSourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  if (!sources?.length) return 'Unknown source'

  const labels = sources.map((source) => {
    const provenance = resolveSelectionSourceProvenance(source, catalogIndex)
    return formatStandardSingleLabel(provenance, source, catalogIndex)
  })

  return joinMultiSourceLabels(labels, MULTI_SOURCE_LABEL_JOIN, 'Unknown source')
}

/** Grant-card provenance labels (`Granted by Feature · Owner context`). */
export function formatGrantCardSelectionSourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: SelectionSourceLabelCatalogIndex,
): string {
  if (!sources?.length) return 'Unknown source'

  const labels = sources.map((source) => {
    const provenance = resolveSelectionSourceProvenance(source, catalogIndex)
    return formatGrantCardSingleLabel(provenance, source, catalogIndex)
  })

  return joinMultiSourceLabels(labels, GRANT_CARD_LABEL_JOIN, 'Unknown source')
}

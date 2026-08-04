import {
  formatAlignmentLabel,
  formatWealth,
  getSkillName,
  getToolCategoryLabel,
  type Alignment,
} from '@rpg/contracts'
import {
  CHARACTER_IMPORT_SERVER_OWNED_FIELDS,
  partitionDispositionEntries,
  type CharacterImportCoverageEntry,
  type CharacterImportCoverageState,
  type CharacterImportDispositionEntry,
  type CharacterImportDispositionReason,
  type CharacterImportExtraction,
  type CharacterImportFieldResult,
  type CharacterImportFieldStatus,
  type CharacterNarrativePreview,
  type RecognizedClassPreview,
  type RecognizedEquipmentItem,
  type RecognizedEntryStatus,
  type RecognizedLanguage,
  type RecognizedProficiency,
  type RecognizedSpeciesPreview,
  type RecognizedSpellPreview,
} from '@rpg/contracts/character-import'
import { getContentTypeCollectionLabel, getContentTypeItemLabel } from '@/features/content'
import type { SemanticTextEmphasis, SemanticTextTone } from '@rpg/ui'

/** Display copy when a source field has no mapped value. */
export const EXTRACTION_UNSET_DISPLAY_VALUE = 'Not set'

/** One step above default SemanticText (`text-xs`) for preview values. */
export const PREVIEW_VALUE_TEXT_CLASS = 'text-sm'

export const EXTRACTION_FIELD_LABELS = {
  name: 'Name',
  species: getContentTypeItemLabel('species'),
  classes: getContentTypeCollectionLabel('classes'),
  abilityScores: 'Abilities',
  alignment: 'Alignment',
  xp: 'XP',
  hitPoints: 'Hit points',
  languages: 'Languages',
  wealth: 'Wealth',
} as const satisfies Record<
  Exclude<keyof CharacterImportExtraction, 'proficiencies' | 'narrative' | 'equipment' | 'spells'>,
  string
>

export type ExtractionFieldKey = keyof typeof EXTRACTION_FIELD_LABELS

export const EXTRACTION_FIELD_KEYS = Object.keys(EXTRACTION_FIELD_LABELS) as ExtractionFieldKey[]

export const NARRATIVE_FIELD_LABELS = {
  personalityTraits: 'Personality traits',
  ideals: 'Ideals',
  bonds: 'Bonds',
  flaws: 'Flaws',
  backstory: 'Backstory',
} as const satisfies Record<keyof CharacterNarrativePreview, string>

export type NarrativeFieldKey = keyof typeof NARRATIVE_FIELD_LABELS

export const NARRATIVE_FIELD_KEYS = Object.keys(NARRATIVE_FIELD_LABELS) as NarrativeFieldKey[]

export const COVERAGE_READINESS_GROUPS = [
  {
    id: 'core',
    label: 'Core character',
    targetPaths: ['name', 'abilityScores', 'alignment', 'xp', 'hitPoints'],
  },
  {
    id: 'narrative',
    label: 'Narrative',
    targetPaths: ['narrative'],
  },
  {
    id: 'catalog',
    label: 'Catalog content',
    targetPaths: [
      'rulesetId',
      'classes',
      'species',
      'proficiencies',
      'equipment',
      'wealth',
      'spells',
      'feats',
    ],
  },
  {
    id: 'context',
    label: 'Save context',
    targetPaths: ['imageKey', 'campaignId'],
  },
] as const

export function isExtractionValueUnset(result: CharacterImportFieldResult<unknown>): boolean {
  return result.status !== 'mapped' || result.value == null
}

export function extractionValueTone(result: CharacterImportFieldResult<unknown>): SemanticTextTone {
  if (isExtractionValueUnset(result)) {
    switch (result.status) {
      case 'missing-source':
        return 'info'
      case 'invalid-value':
        return 'destructive'
      case 'unsupported':
      case 'unresolved-reference':
        return 'warning'
      default:
        return 'info'
    }
  }

  if (result.issues.length > 0) {
    return 'warning'
  }

  return 'neutral'
}

export function extractionValueEmphasis(
  result: CharacterImportFieldResult<unknown>,
): SemanticTextEmphasis {
  if (isExtractionValueUnset(result) && result.status === 'missing-source') {
    return 'low'
  }

  return 'medium'
}

export function extractionIssueTone(result: CharacterImportFieldResult<unknown>): SemanticTextTone {
  if (result.status === 'invalid-value') {
    return 'destructive'
  }

  if (result.status === 'unsupported' || result.status === 'unresolved-reference') {
    return 'warning'
  }

  if (result.issues.length > 0) {
    return 'warning'
  }

  return 'info'
}

export function shouldShowExtractionIssue(result: CharacterImportFieldResult<unknown>): boolean {
  if (result.status === 'missing-source') {
    return false
  }

  return result.issues.length > 0
}

/** @deprecated Use {@link extractionValueTone} */
export function extractionFieldTone(result: CharacterImportFieldResult<unknown>): SemanticTextTone {
  return extractionValueTone(result)
}

export function extractionIssueReason(status: CharacterImportFieldStatus): string {
  switch (status) {
    case 'missing-source':
      return 'Not present in the source character'
    case 'invalid-value':
      return 'Source value is not recognized'
    case 'unresolved-reference':
      return 'Requires a local catalog match'
    case 'unsupported':
      return 'Not supported by the local character contract'
    default:
      return 'No usable value exists'
  }
}

export function formatAbilityScores(
  scores: NonNullable<CharacterImportExtraction['abilityScores']['value']>,
): string {
  return `STR ${scores.str}, DEX ${scores.dex}, CON ${scores.con}, INT ${scores.int}, WIS ${scores.wis}, CHA ${scores.cha}`
}

export function formatAlignmentValue(alignment: Alignment): string {
  return formatAlignmentLabel(alignment)
}

export function formatSpeciesValue(species: RecognizedSpeciesPreview): string {
  const parts = [species.sourceValue]
  if (species.isSubRace && species.baseSpeciesName) {
    parts.push(`(base species: ${species.baseSpeciesName})`)
  }
  return parts.join(' ')
}

export function formatClassValue(entry: RecognizedClassPreview): string {
  const parts = [`${entry.sourceValue} · Level ${entry.level}`]
  if (entry.subclassSourceValue) {
    parts.push(`(${entry.subclassSourceValue})`)
  }
  return parts.join(' ')
}

export function formatClassesValue(classes: RecognizedClassPreview[]): string {
  return classes.map((entry) => formatClassValue(entry)).join('; ')
}

export function formatNarrativeFieldValue(
  narrative: CharacterNarrativePreview | undefined,
  field: NarrativeFieldKey,
): { displayValue: string; isUnset: boolean } {
  if (!narrative) {
    return { displayValue: EXTRACTION_UNSET_DISPLAY_VALUE, isUnset: true }
  }

  if (field === 'backstory') {
    const backstory = narrative.backstory?.trim()
    if (!backstory) {
      return { displayValue: EXTRACTION_UNSET_DISPLAY_VALUE, isUnset: true }
    }

    return { displayValue: backstory, isUnset: false }
  }

  const values = narrative[field]
  if (!values || values.length === 0) {
    return { displayValue: EXTRACTION_UNSET_DISPLAY_VALUE, isUnset: true }
  }

  return { displayValue: values.join('; '), isUnset: false }
}

export function narrativeFieldTone(isUnset: boolean): SemanticTextTone {
  return isUnset ? 'info' : 'neutral'
}

export function formatHitPointsValue(
  hitPoints: NonNullable<CharacterImportExtraction['hitPoints']['value']>,
): string {
  return `Current ${hitPoints.current} / ${hitPoints.base}, Temporary ${hitPoints.temporary}`
}

export function formatLanguagesValue(languages: RecognizedLanguage[]): string {
  return languages
    .map((entry) => entry.localValue ?? entry.sourceValue)
    .filter(Boolean)
    .join(', ')
}

export function formatProficiencyLabel(entry: RecognizedProficiency): string {
  if (entry.kind === 'tool' && entry.toolCategory) {
    return getToolCategoryLabel(entry.toolCategory)
  }

  if (entry.kind === 'skill') {
    const skillId = entry.skillId ?? entry.localValue ?? entry.sourceValue
    return getSkillName(skillId)
  }

  return entry.sourceLabel ?? entry.localValue ?? entry.sourceValue
}

export function formatProficienciesPreviewValue(proficiencies: RecognizedProficiency[]): string[] {
  return proficiencies.map((entry) => formatProficiencyLabel(entry)).filter(Boolean)
}

export function formatWealthValue(
  wealth: NonNullable<CharacterImportExtraction['wealth']['value']>,
): string {
  return formatWealth(wealth)
}

export function partitionCatalogMatchedItems<T extends { status: RecognizedEntryStatus }>(
  items: T[],
): { supported: T[]; unsupported: T[] } {
  const supported: T[] = []
  const unsupported: T[] = []

  for (const entry of items) {
    if (entry.status === 'mapped') {
      supported.push(entry)
      continue
    }

    unsupported.push(entry)
  }

  return { supported, unsupported }
}

export function formatEquipmentItemLabel(entry: RecognizedEquipmentItem): string {
  return entry.quantity > 1 ? `${entry.quantity}x ${entry.sourceLabel}` : entry.sourceLabel
}

export function partitionEquipmentItems(equipment: RecognizedEquipmentItem[]): {
  supported: RecognizedEquipmentItem[]
  unsupported: RecognizedEquipmentItem[]
} {
  const { supported, unsupported } = partitionCatalogMatchedItems(equipment)
  supported.sort((left, right) => left.sourceLabel.localeCompare(right.sourceLabel))
  unsupported.sort((left, right) => left.sourceLabel.localeCompare(right.sourceLabel))
  return { supported, unsupported }
}

export function formatSupportedEquipmentValue(equipment: RecognizedEquipmentItem[]): string {
  return equipment.map((entry) => formatEquipmentItemLabel(entry)).join(', ')
}

export function formatSpellPreviewLabel(spell: RecognizedSpellPreview): string {
  if (spell.sourceLevel == null) {
    return spell.sourceValue
  }

  const levelLabel = spell.sourceLevel === 0 ? 'cantrip' : `level ${spell.sourceLevel}`
  return `${spell.sourceValue} (${levelLabel})`
}

export function partitionSpellItems(spells: RecognizedSpellPreview[]): {
  supported: RecognizedSpellPreview[]
  unsupported: RecognizedSpellPreview[]
} {
  const { supported, unsupported } = partitionCatalogMatchedItems(spells)
  supported.sort((left, right) => left.sourceValue.localeCompare(right.sourceValue))
  unsupported.sort((left, right) => left.sourceValue.localeCompare(right.sourceValue))
  return { supported, unsupported }
}

export function formatSupportedSpellsValue(spells: RecognizedSpellPreview[]): string {
  return spells.map((entry) => formatSpellPreviewLabel(entry)).join(', ')
}

export function formatEquipmentValue(equipment: RecognizedEquipmentItem[]): string {
  return formatSupportedEquipmentValue(equipment)
}

const EXTRACTION_DISPLAY_FORMATTERS: {
  [K in ExtractionFieldKey]: (result: CharacterImportExtraction[K]) => string
} = {
  name: (result) => result.value ?? EXTRACTION_UNSET_DISPLAY_VALUE,
  species: (result) =>
    result.value ? formatSpeciesValue(result.value) : EXTRACTION_UNSET_DISPLAY_VALUE,
  classes: (result) =>
    result.value ? formatClassesValue(result.value) : EXTRACTION_UNSET_DISPLAY_VALUE,
  abilityScores: (result) =>
    result.value ? formatAbilityScores(result.value) : EXTRACTION_UNSET_DISPLAY_VALUE,
  alignment: (result) =>
    result.value ? formatAlignmentValue(result.value) : EXTRACTION_UNSET_DISPLAY_VALUE,
  xp: (result) => (result.value != null ? String(result.value) : EXTRACTION_UNSET_DISPLAY_VALUE),
  hitPoints: (result) =>
    result.value ? formatHitPointsValue(result.value) : EXTRACTION_UNSET_DISPLAY_VALUE,
  languages: (result) =>
    result.value ? formatLanguagesValue(result.value) : EXTRACTION_UNSET_DISPLAY_VALUE,
  wealth: (result) =>
    result.value ? formatWealthValue(result.value) : EXTRACTION_UNSET_DISPLAY_VALUE,
}

export function formatExtractionDisplayValue<K extends ExtractionFieldKey>(
  field: K,
  result: CharacterImportExtraction[K],
): string {
  if (result.status !== 'mapped' || result.value == null) {
    return EXTRACTION_UNSET_DISPLAY_VALUE
  }

  return EXTRACTION_DISPLAY_FORMATTERS[field](result)
}

export function coverageStateTone(state: CharacterImportCoverageState): SemanticTextTone {
  switch (state) {
    case 'mapped':
      return 'success'
    case 'deferred':
    case 'unresolved-reference':
      return 'warning'
    case 'server-owned':
      return 'info'
    case 'not-applicable':
      return 'neutral'
    default:
      return 'neutral'
  }
}

export function groupCoverageEntries(entries: CharacterImportCoverageEntry[]): Array<{
  id: (typeof COVERAGE_READINESS_GROUPS)[number]['id']
  label: string
  entries: CharacterImportCoverageEntry[]
}> {
  const grouped = new Map<string, CharacterImportCoverageEntry[]>()

  for (const group of COVERAGE_READINESS_GROUPS) {
    grouped.set(group.id, [])
  }

  const fallback = grouped.get('catalog') ?? []

  for (const entry of entries) {
    const group = COVERAGE_READINESS_GROUPS.find((candidate) =>
      candidate.targetPaths.includes(entry.targetPath as never),
    )
    const bucket = group ? (grouped.get(group.id) ?? fallback) : fallback
    bucket.push(entry)
  }

  return COVERAGE_READINESS_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    entries: grouped.get(group.id) ?? [],
  })).filter((group) => group.entries.length > 0)
}

export function partitionCoverageEntries(coverage: CharacterImportCoverageEntry[]): {
  readiness: CharacterImportCoverageEntry[]
  providedWhenSaved: CharacterImportCoverageEntry[]
} {
  const serverOwned = new Set<string>(CHARACTER_IMPORT_SERVER_OWNED_FIELDS)

  return {
    readiness: coverage.filter((entry) => !serverOwned.has(entry.targetPath)),
    providedWhenSaved: coverage.filter((entry) => serverOwned.has(entry.targetPath)),
  }
}

export function formatCoverageStateLabel(state: CharacterImportCoverageState): string {
  switch (state) {
    case 'mapped':
      return 'Mapped'
    case 'deferred':
      return 'Deferred'
    case 'unresolved-reference':
      return 'Unresolved reference'
    case 'server-owned':
      return 'Provided when saved'
    case 'not-applicable':
      return 'Not applicable'
    default:
      return state
  }
}

export function formatDispositionReasonLabel(reason: CharacterImportDispositionReason): string {
  switch (reason) {
    case 'derived-from-class':
      return 'derived from local class'
    case 'resolved-from-local-content':
      return 'resolved from local content'
    case 'derived-value':
      return 'derived value'
    case 'duplicate-source':
      return 'duplicate source'
    case 'provider-metadata':
      return 'provider metadata'
    case 'runtime-state':
      return 'runtime state'
    case 'not-in-local-contract':
      return 'not in local contract'
    case 'requires-catalog-resolution':
      return 'requires catalog resolution'
    default:
      return reason
  }
}

export function formatDispositionSummary(entry: CharacterImportDispositionEntry): string {
  return `${entry.sourceValue} — ${formatDispositionReasonLabel(entry.reason)}`
}

export { partitionDispositionEntries }

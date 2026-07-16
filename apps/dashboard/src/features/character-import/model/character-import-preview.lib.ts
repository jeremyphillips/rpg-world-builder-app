import {
  formatAlignmentLabel,
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
  type RecognizedEquipmentItem,
  type RecognizedLanguage,
  type RecognizedProficiency,
  type RecognizedSpeciesPreview,
} from '@rpg/contracts/character-import'
import type { SemanticTextTone } from '@rpg/ui'

export const EXTRACTION_FIELD_LABELS = {
  name: 'Name',
  species: 'Species',
  abilityScores: 'Abilities',
  alignment: 'Alignment',
  xp: 'XP',
  narrative: 'Narrative',
  hitPoints: 'Hit points',
  languages: 'Languages',
  equipment: 'Equipment',
} as const satisfies Record<Exclude<keyof CharacterImportExtraction, 'proficiencies'>, string>

export type ExtractionFieldKey = keyof typeof EXTRACTION_FIELD_LABELS

export const EXTRACTION_FIELD_KEYS = Object.keys(EXTRACTION_FIELD_LABELS) as ExtractionFieldKey[]

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

export function extractionFieldTone(result: CharacterImportFieldResult<unknown>): SemanticTextTone {
  if (result.status === 'mapped' && result.issues.length > 0) {
    return 'caution'
  }

  switch (result.status) {
    case 'mapped':
      return 'neutral'
    case 'missing-source':
    case 'invalid-value':
      return 'negative'
    case 'unsupported':
    case 'unresolved-reference':
      return 'caution'
    default:
      return 'neutral'
  }
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
  if (species.localValue) {
    parts.push(`→ ${species.localValue}`)
  }
  return parts.join(' ')
}

export function formatNarrativeValue(narrative: CharacterNarrativePreview): string {
  const parts: string[] = []
  if (narrative.personalityTraits?.length) {
    parts.push(`Traits: ${narrative.personalityTraits.join('; ')}`)
  }
  if (narrative.ideals?.length) {
    parts.push(`Ideals: ${narrative.ideals.join('; ')}`)
  }
  if (narrative.bonds?.length) {
    parts.push(`Bonds: ${narrative.bonds.join('; ')}`)
  }
  if (narrative.flaws?.length) {
    parts.push(`Flaws: ${narrative.flaws.join('; ')}`)
  }
  if (narrative.backstory) {
    parts.push(`Backstory: ${narrative.backstory}`)
  }
  return parts.join(' | ')
}

export function formatHitPointsValue(
  hitPoints: NonNullable<CharacterImportExtraction['hitPoints']['value']>,
): string {
  return `Base ${hitPoints.base}, Temporary ${hitPoints.temporary}`
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

export function formatEquipmentValue(equipment: RecognizedEquipmentItem[]): string {
  return equipment
    .map((entry) =>
      entry.quantity > 1 ? `${entry.quantity}x ${entry.sourceLabel}` : entry.sourceLabel,
    )
    .join(', ')
}

const EXTRACTION_DISPLAY_FORMATTERS: {
  [K in ExtractionFieldKey]: (result: CharacterImportExtraction[K]) => string
} = {
  name: (result) => result.value ?? 'Undefined',
  species: (result) => (result.value ? formatSpeciesValue(result.value) : 'Undefined'),
  abilityScores: (result) => (result.value ? formatAbilityScores(result.value) : 'Undefined'),
  alignment: (result) => (result.value ? formatAlignmentValue(result.value) : 'Undefined'),
  xp: (result) => (result.value != null ? String(result.value) : 'Undefined'),
  narrative: (result) => (result.value ? formatNarrativeValue(result.value) : 'Undefined'),
  hitPoints: (result) => (result.value ? formatHitPointsValue(result.value) : 'Undefined'),
  languages: (result) => (result.value ? formatLanguagesValue(result.value) : 'Undefined'),
  equipment: (result) => (result.value ? formatEquipmentValue(result.value) : 'Undefined'),
}

export function formatExtractionDisplayValue<K extends ExtractionFieldKey>(
  field: K,
  result: CharacterImportExtraction[K],
): string {
  if (result.status !== 'mapped' || result.value == null) {
    return 'Undefined'
  }

  return EXTRACTION_DISPLAY_FORMATTERS[field](result)
}

export function coverageStateTone(state: CharacterImportCoverageState): SemanticTextTone {
  switch (state) {
    case 'mapped':
      return 'positive'
    case 'deferred':
    case 'unresolved-reference':
      return 'caution'
    case 'server-owned':
      return 'informative'
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

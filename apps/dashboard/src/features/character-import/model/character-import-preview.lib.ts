import { formatAlignmentLabel, type Alignment } from '@rpg/contracts'
import {
  CHARACTER_IMPORT_SERVER_OWNED_FIELDS,
  type CharacterImportCoverageEntry,
  type CharacterImportCoverageState,
  type CharacterImportExtraction,
  type CharacterImportFieldResult,
  type CharacterImportFieldStatus,
  type CharacterNarrativePreview,
  type RecognizedLanguage,
  type RecognizedProficiency,
} from '@rpg/contracts/character-import'
import type { SemanticTextTone } from '@rpg/ui'

export const EXTRACTION_FIELD_LABELS = {
  name: 'Name',
  abilityScores: 'Abilities',
  alignment: 'Alignment',
  xp: 'XP',
  narrative: 'Narrative',
  hitPoints: 'Hit points',
  languages: 'Languages',
  proficiencies: 'Proficiencies',
} as const satisfies Record<keyof CharacterImportExtraction, string>

export type ExtractionFieldKey = keyof typeof EXTRACTION_FIELD_LABELS

export const EXTRACTION_FIELD_KEYS = Object.keys(EXTRACTION_FIELD_LABELS) as ExtractionFieldKey[]

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

export function formatProficienciesValue(proficiencies: RecognizedProficiency[]): string {
  return proficiencies
    .map((entry) => {
      const label = entry.localValue ?? entry.sourceValue
      if (entry.status === 'unsupported') {
        return `${label} (unsupported)`
      }
      return label
    })
    .join(', ')
}

const EXTRACTION_DISPLAY_FORMATTERS: {
  [K in ExtractionFieldKey]: (result: CharacterImportExtraction[K]) => string
} = {
  name: (result) => result.value ?? 'Undefined',
  abilityScores: (result) => (result.value ? formatAbilityScores(result.value) : 'Undefined'),
  alignment: (result) => (result.value ? formatAlignmentValue(result.value) : 'Undefined'),
  xp: (result) => (result.value != null ? String(result.value) : 'Undefined'),
  narrative: (result) => (result.value ? formatNarrativeValue(result.value) : 'Undefined'),
  hitPoints: (result) => (result.value ? formatHitPointsValue(result.value) : 'Undefined'),
  languages: (result) => (result.value ? formatLanguagesValue(result.value) : 'Undefined'),
  proficiencies: (result) => (result.value ? formatProficienciesValue(result.value) : 'Undefined'),
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

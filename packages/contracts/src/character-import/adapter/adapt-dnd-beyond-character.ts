// fallow-ignore-file complexity
import type { Alignment } from '../../rpg/vocab/alignment'
import type { CharacterAbilityScores } from '../../rpg/runtime/character/core'
import type {
  DndBeyondCharacterPayload,
  DndBeyondModifier,
} from '../dnd-beyond/dnd-beyond-character.schema'
import {
  buildCharacterImportCoverage,
  buildServerOwnedCoverageEntries,
} from './character-import-coverage-manifest'
import type { CharacterImportSource } from './character-import-result.schema'
import type {
  CharacterImportResult,
  CharacterImportSourceCapability,
} from './character-import-result.schema'
import type {
  CharacterHitPointsPreview,
  CharacterImportFieldResult,
  CharacterNarrativePreview,
  RecognizedLanguage,
  RecognizedProficiency,
} from './character-import-preview-types'
import { fieldResult, mappedFieldResult } from './character-import-preview-types'

// ---------------------------------------------------------------------------
// D&D Beyond → provider-neutral import adapter (pure; no HTTP).
// ---------------------------------------------------------------------------

const DND_BEYOND_STAT_ID_TO_ABILITY = {
  1: 'str',
  2: 'dex',
  3: 'con',
  4: 'int',
  5: 'wis',
  6: 'cha',
} as const satisfies Record<number, keyof CharacterAbilityScores>

const DND_BEYOND_ALIGNMENT_ID_TO_LOCAL: Record<number, Alignment> = {
  1: 'lg',
  2: 'ng',
  3: 'cg',
  4: 'ln',
  5: 'n',
  6: 'cn',
  7: 'le',
  8: 'ne',
  9: 'ce',
}

const ABILITY_SCORE_BONUS_SUBTYPE_TO_ABILITY: Record<string, keyof CharacterAbilityScores> = {
  'strength-score': 'str',
  'dexterity-score': 'dex',
  'constitution-score': 'con',
  'intelligence-score': 'int',
  'wisdom-score': 'wis',
  'charisma-score': 'cha',
}

const DND_BEYOND_MODIFIER_GROUPS = [
  'race',
  'class',
  'background',
  'item',
  'feat',
  'condition',
] as const

const SKILL_SUBTYPES = new Set([
  'acrobatics',
  'animal-handling',
  'arcana',
  'athletics',
  'deception',
  'history',
  'insight',
  'intimidation',
  'investigation',
  'medicine',
  'nature',
  'perception',
  'performance',
  'persuasion',
  'religion',
  'sleight-of-hand',
  'stealth',
  'survival',
])

const WEAPON_CATEGORY_SUBTYPES: Record<string, string> = {
  'simple-weapons': 'simple',
  'martial-weapons': 'martial',
}

const ARMOR_CATEGORY_SUBTYPES: Record<string, string> = {
  'light-armor': 'light',
  'medium-armor': 'medium',
  'heavy-armor': 'heavy',
  shields: 'shields',
  shield: 'shields',
}

const TOOL_SUBTYPE_SUFFIXES = ['-supplies', '-tools', '-kit', '-instruments'] as const

type ModifierRef = {
  group: string
  modifier: DndBeyondModifier
  path: string
}

function collectModifiers(payload: DndBeyondCharacterPayload): ModifierRef[] {
  const refs: ModifierRef[] = []
  const modifiers = payload.modifiers
  if (!modifiers) return refs

  for (const group of DND_BEYOND_MODIFIER_GROUPS) {
    const entries = modifiers[group]
    if (!entries) continue
    entries.forEach((modifier, index) => {
      refs.push({
        group,
        modifier,
        path: `data.modifiers.${group}[${index}]`,
      })
    })
  }

  return refs
}

function readStatValue(
  rows: DndBeyondCharacterPayload['stats'],
  statId: number,
): number | undefined {
  const row = rows?.find((entry) => entry.id === statId)
  return row?.value ?? undefined
}

function extractName(payload: DndBeyondCharacterPayload): CharacterImportFieldResult<string> {
  const sourcePaths = ['data.name']
  const name = payload.name?.trim()
  if (!name) {
    return fieldResult('missing-source', sourcePaths, [
      'Name is not present in the source character.',
    ])
  }
  return mappedFieldResult(name, sourcePaths)
}

function extractAbilityScores(
  payload: DndBeyondCharacterPayload,
): CharacterImportFieldResult<CharacterAbilityScores> {
  const sourcePaths = ['data.stats', 'data.bonusStats', 'data.overrideStats', 'data.modifiers']

  const scores = {} as CharacterAbilityScores
  const issues: string[] = []

  for (const [statIdRaw, ability] of Object.entries(DND_BEYOND_STAT_ID_TO_ABILITY)) {
    const statId = Number(statIdRaw)
    const override = readStatValue(payload.overrideStats, statId)
    if (override != null) {
      scores[ability] = override
      continue
    }

    const base = readStatValue(payload.stats, statId)
    if (base == null) {
      issues.push(`Missing base stat for ${ability}.`)
      continue
    }

    const bonus = readStatValue(payload.bonusStats, statId) ?? 0
    let total = base + bonus

    for (const { modifier, path } of collectModifiers(payload)) {
      if (modifier.type !== 'bonus') continue
      const mappedAbility = ABILITY_SCORE_BONUS_SUBTYPE_TO_ABILITY[modifier.subType]
      if (mappedAbility !== ability) continue
      if (modifier.value == null) continue
      total += modifier.value
      if (!sourcePaths.includes(path)) {
        sourcePaths.push(path)
      }
    }

    scores[ability] = total
  }

  const requiredAbilities = Object.values(DND_BEYOND_STAT_ID_TO_ABILITY)
  const missingAbility = requiredAbilities.find((ability) => scores[ability] == null)
  if (missingAbility || issues.length > 0) {
    return fieldResult('invalid-value', sourcePaths, [
      ...issues,
      ...(missingAbility ? [`Could not derive a score for ${missingAbility}.`] : []),
    ])
  }

  return mappedFieldResult(scores, sourcePaths)
}

function extractAlignment(
  payload: DndBeyondCharacterPayload,
): CharacterImportFieldResult<Alignment> {
  const sourcePaths = ['data.alignmentId']
  const alignmentId = payload.alignmentId

  if (alignmentId == null) {
    return fieldResult('missing-source', sourcePaths, [
      'Alignment is not set on the source character.',
    ])
  }

  const alignment = DND_BEYOND_ALIGNMENT_ID_TO_LOCAL[alignmentId]
  if (!alignment) {
    return fieldResult('invalid-value', sourcePaths, [
      `Source alignment id ${alignmentId} is not recognized.`,
    ])
  }

  return mappedFieldResult(alignment, sourcePaths)
}

function extractXp(payload: DndBeyondCharacterPayload): CharacterImportFieldResult<number> {
  const sourcePaths = ['data.currentXp']
  if (payload.currentXp == null) {
    return fieldResult('missing-source', sourcePaths, [
      'Current XP is not present in the source character.',
    ])
  }
  return mappedFieldResult(payload.currentXp, sourcePaths)
}

function normalizeNarrativeStringArray(value: string | null | undefined): string[] | undefined {
  if (value == null) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const segments = trimmed
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  return segments.length > 0 ? segments : [trimmed]
}

function extractNarrative(
  payload: DndBeyondCharacterPayload,
): CharacterImportFieldResult<CharacterNarrativePreview> {
  const sourcePaths: string[] = []
  const narrative: CharacterNarrativePreview = {}

  const traits = payload.traits
  if (traits?.personalityTraits) {
    const personalityTraits = normalizeNarrativeStringArray(traits.personalityTraits)
    if (personalityTraits) {
      narrative.personalityTraits = personalityTraits
      sourcePaths.push('data.traits.personalityTraits')
    }
  }
  if (traits?.ideals) {
    const ideals = normalizeNarrativeStringArray(traits.ideals)
    if (ideals) {
      narrative.ideals = ideals
      sourcePaths.push('data.traits.ideals')
    }
  }
  if (traits?.bonds) {
    const bonds = normalizeNarrativeStringArray(traits.bonds)
    if (bonds) {
      narrative.bonds = bonds
      sourcePaths.push('data.traits.bonds')
    }
  }
  if (traits?.flaws) {
    const flaws = normalizeNarrativeStringArray(traits.flaws)
    if (flaws) {
      narrative.flaws = flaws
      sourcePaths.push('data.traits.flaws')
    }
  }

  const backstory = payload.notes?.backstory?.trim()
  if (backstory) {
    narrative.backstory = backstory
    sourcePaths.push('data.notes.backstory')
  }

  if (Object.keys(narrative).length === 0) {
    return fieldResult(
      'missing-source',
      ['data.traits', 'data.notes.backstory'],
      ['No personal narrative fields were present in the source character.'],
    )
  }

  return mappedFieldResult(narrative, sourcePaths)
}

function extractHitPoints(
  payload: DndBeyondCharacterPayload,
): CharacterImportFieldResult<CharacterHitPointsPreview> {
  const sourcePaths = [
    'data.baseHitPoints',
    'data.bonusHitPoints',
    'data.overrideHitPoints',
    'data.temporaryHitPoints',
  ]

  if (payload.baseHitPoints == null && payload.overrideHitPoints == null) {
    return fieldResult('missing-source', sourcePaths, [
      'Hit point inputs were not present in the source character.',
    ])
  }

  const base =
    payload.overrideHitPoints ?? (payload.baseHitPoints ?? 0) + (payload.bonusHitPoints ?? 0)
  const temporary = payload.temporaryHitPoints ?? 0

  const hitPoints: CharacterHitPointsPreview = {
    base,
    temporary,
  }

  return mappedFieldResult(hitPoints, sourcePaths)
}

function mapLanguageSubType(subType: string): string {
  return subType.trim().toLowerCase()
}

function extractLanguages(
  payload: DndBeyondCharacterPayload,
): CharacterImportFieldResult<RecognizedLanguage[]> {
  const sourcePaths: string[] = []
  const languages: RecognizedLanguage[] = []
  const seenLocal = new Set<string>()
  const issues: string[] = []

  for (const { group, modifier, path } of collectModifiers(payload)) {
    if (modifier.type !== 'language') continue
    sourcePaths.push(path)

    const sourceValue = modifier.subType?.trim()
    if (!sourceValue) {
      issues.push(`Language modifier at ${path} is missing a subtype.`)
      languages.push({
        sourceValue: '',
        sourceGroup: group,
        status: 'invalid-value',
      })
      continue
    }

    const localValue = mapLanguageSubType(sourceValue)
    if (!localValue) {
      languages.push({
        sourceValue,
        sourceGroup: group,
        status: 'invalid-value',
      })
      continue
    }

    if (seenLocal.has(localValue)) continue
    seenLocal.add(localValue)

    languages.push({
      sourceValue,
      localValue,
      sourceGroup: group,
      status: 'mapped',
    })
  }

  if (languages.length === 0) {
    return fieldResult(
      'missing-source',
      ['data.modifiers'],
      ['No language modifiers were found in the source character.'],
    )
  }

  const hasMapped = languages.some((entry) => entry.status === 'mapped')
  if (!hasMapped) {
    return fieldResult(
      'invalid-value',
      sourcePaths,
      issues.length > 0
        ? issues
        : ['Language modifiers were present but none could be recognized.'],
    )
  }

  return {
    status: 'mapped',
    value: languages,
    sourcePaths,
    issues,
  }
}

function isToolSubtype(subType: string): boolean {
  return TOOL_SUBTYPE_SUFFIXES.some((suffix) => subType.endsWith(suffix))
}

function classifyProficiency(
  subType: string,
): Pick<RecognizedProficiency, 'kind' | 'localValue' | 'status'> {
  if (subType.endsWith('-saving-throws')) {
    return { kind: 'savingThrow', status: 'unsupported' }
  }

  const weaponCategory = WEAPON_CATEGORY_SUBTYPES[subType]
  if (weaponCategory) {
    return { kind: 'weapon', localValue: weaponCategory, status: 'mapped' }
  }

  const armorCategory = ARMOR_CATEGORY_SUBTYPES[subType]
  if (armorCategory) {
    return { kind: 'armor', localValue: armorCategory, status: 'mapped' }
  }

  if (SKILL_SUBTYPES.has(subType)) {
    return { kind: 'skill', localValue: subType, status: 'mapped' }
  }

  if (isToolSubtype(subType)) {
    return { kind: 'tool', localValue: subType, status: 'mapped' }
  }

  return { kind: 'skill', status: 'unresolved-reference' }
}

function proficiencyDedupeKey(entry: RecognizedProficiency): string {
  return `${entry.kind}:${entry.localValue ?? ''}:${entry.sourceValue}`
}

function extractProficiencies(
  payload: DndBeyondCharacterPayload,
): CharacterImportFieldResult<RecognizedProficiency[]> {
  const sourcePaths: string[] = []
  const proficiencies: RecognizedProficiency[] = []
  const seen = new Set<string>()
  const issues: string[] = []

  for (const { group, modifier, path } of collectModifiers(payload)) {
    if (modifier.type !== 'proficiency') continue
    sourcePaths.push(path)

    const sourceValue = modifier.subType?.trim()
    if (!sourceValue) {
      issues.push(`Proficiency modifier at ${path} is missing a subtype.`)
      continue
    }

    const classified = classifyProficiency(sourceValue)
    const entry: RecognizedProficiency = {
      kind: classified.kind,
      sourceValue,
      localValue: classified.localValue,
      sourceGroup: group,
      status: classified.status,
      rank: 'proficient',
    }

    const key = proficiencyDedupeKey(entry)
    if (seen.has(key)) continue
    seen.add(key)
    proficiencies.push(entry)

    if (classified.status === 'unsupported') {
      issues.push(
        `Saving throw proficiency "${sourceValue}" is not supported by the local character contract.`,
      )
    } else if (classified.status === 'unresolved-reference') {
      issues.push(`Proficiency subtype "${sourceValue}" could not be classified.`)
    }
  }

  for (const [index, custom] of (payload.customProficiencies ?? []).entries()) {
    const path = `data.customProficiencies[${index}]`
    sourcePaths.push(path)
    const sourceValue = custom.subType?.trim() || custom.name?.trim() || custom.type?.trim()
    if (!sourceValue) {
      issues.push(`Custom proficiency at ${path} is missing a recognizable label.`)
      continue
    }

    const classified = classifyProficiency(sourceValue.toLowerCase())
    const entry: RecognizedProficiency = {
      kind: classified.kind,
      sourceValue,
      localValue: classified.localValue,
      sourceGroup: 'custom',
      status: classified.status,
      rank: 'proficient',
    }
    const key = proficiencyDedupeKey(entry)
    if (seen.has(key)) continue
    seen.add(key)
    proficiencies.push(entry)
  }

  if (proficiencies.length === 0) {
    return fieldResult(
      'missing-source',
      ['data.modifiers', 'data.customProficiencies'],
      ['No proficiency modifiers were found in the source character.'],
    )
  }

  const hasMapped = proficiencies.some((entry) => entry.status === 'mapped')
  if (!hasMapped) {
    return fieldResult('unsupported', sourcePaths, issues)
  }

  return {
    status: 'mapped',
    value: proficiencies,
    sourcePaths,
    issues,
  }
}

function collectAvailableSourceData(
  payload: DndBeyondCharacterPayload,
): CharacterImportSourceCapability[] {
  const capabilities: CharacterImportSourceCapability[] = []

  if (payload.adjustmentXp != null && payload.adjustmentXp !== 0) {
    capabilities.push({
      path: 'data.adjustmentXp',
      category: 'runtime',
      value: payload.adjustmentXp,
    })
  }

  if (payload.removedHitPoints != null && payload.removedHitPoints !== 0) {
    capabilities.push({
      path: 'data.removedHitPoints',
      category: 'runtime',
      value: payload.removedHitPoints,
    })
  }

  for (const { modifier, path } of collectModifiers(payload)) {
    if (modifier.type === 'bonus' && modifier.subType === 'hit-points-per-level') {
      capabilities.push({
        path,
        category: 'derived',
        value: modifier.value,
      })
    }
  }

  if (payload.notes?.allies) {
    capabilities.push({
      path: 'data.notes.allies',
      category: 'presentation',
      value: payload.notes.allies,
    })
  }
  if (payload.notes?.enemies) {
    capabilities.push({
      path: 'data.notes.enemies',
      category: 'presentation',
      value: payload.notes.enemies,
    })
  }
  if (payload.notes?.organizations) {
    capabilities.push({
      path: 'data.notes.organizations',
      category: 'presentation',
      value: payload.notes.organizations,
    })
  }
  if (payload.traits?.appearance) {
    capabilities.push({
      path: 'data.traits.appearance',
      category: 'presentation',
      value: payload.traits.appearance,
    })
  }

  return capabilities
}

export function adaptDndBeyondCharacter(
  payload: DndBeyondCharacterPayload,
  source: CharacterImportSource,
): CharacterImportResult {
  const extraction = {
    name: extractName(payload),
    abilityScores: extractAbilityScores(payload),
    alignment: extractAlignment(payload),
    xp: extractXp(payload),
    narrative: extractNarrative(payload),
    hitPoints: extractHitPoints(payload),
    languages: extractLanguages(payload),
    proficiencies: extractProficiencies(payload),
  }

  const coverage = [
    ...buildCharacterImportCoverage(extraction, payload),
    ...buildServerOwnedCoverageEntries(),
  ]

  return {
    source,
    extraction,
    coverage,
    availableSourceData: collectAvailableSourceData(payload),
  }
}

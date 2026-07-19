// fallow-ignore-file complexity
import type { CoinWealth } from '../../rpg/primitives/wealth'
import type { Alignment } from '../../rpg/vocab/alignment'
import type { CharacterAbilityScores } from '../../rpg/runtime/character/core'
import type { DndBeyondCharacterPayload, DndBeyondModifier } from './dnd-beyond-character.schema'
import {
  buildCharacterImportCoverage,
  buildServerOwnedCoverageEntries,
} from '../adapter/character-import-coverage-manifest'
import type {
  CharacterImportResult,
  CharacterImportSourceCapability,
  DndBeyondCharacterImportSource,
} from '../adapter/character-import-result.schema'
import type {
  CharacterHitPointsPreview,
  CharacterImportFieldResult,
  CharacterImportProficienciesPreview,
  CharacterNarrativePreview,
  RecognizedClassPreview,
  RecognizedEquipmentItem,
  RecognizedLanguage,
  RecognizedProficiency,
  RecognizedSpeciesPreview,
  RecognizedSpellPreview,
} from '../adapter/character-import-preview-types'
import { fieldResult, mappedFieldResult } from '../adapter/character-import-preview-types'
import type { CharacterImportDispositionEntry } from '../adapter/character-import-disposition'
import {
  inferLocalClassId,
  inferLocalClassSlug,
  inferLocalSubclassId,
  inferLocalSubclassSlug,
  readDndBeyondClassLabel,
  readDndBeyondSubclassLabel,
} from './dnd-beyond-class-mapping'
import type { DndBeyondEquipmentNameIndex } from './dnd-beyond-equipment-mapping'
import { resolveLocalEquipmentFromName } from './dnd-beyond-equipment-mapping'
import type { DndBeyondSpellNameIndex } from './dnd-beyond-spell-mapping'
import { resolveLocalSpellFromName } from './dnd-beyond-spell-mapping'
import { mapDndBeyondCurrenciesToWealth } from './dnd-beyond-wealth-mapping'
import { mapDndBeyondToolSubtype } from './dnd-beyond-tool-mapping'
import {
  inferLocalSpeciesId,
  inferLocalSpeciesSlug,
  readDndBeyondSpeciesLabel,
} from './dnd-beyond-species-mapping'
import { resolveDndBeyondProficiencyDisposition } from './proficiency-dispositions'

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

const DND_BEYOND_ALIGNMENT_NAME_TO_LOCAL: Record<string, Alignment> = {
  'lawful good': 'lg',
  'neutral good': 'ng',
  'chaotic good': 'cg',
  'lawful neutral': 'ln',
  'true neutral': 'n',
  neutral: 'n',
  'chaotic neutral': 'cn',
  'lawful evil': 'le',
  'neutral evil': 'ne',
  'chaotic evil': 'ce',
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

const TOOL_SUBTYPE_SUFFIXES = ['-supplies', '-tools', '-kit', '-instruments'] as const

type ClassifiedProficiency = Pick<
  RecognizedProficiency,
  'kind' | 'localValue' | 'skillId' | 'toolId' | 'toolCategory' | 'status'
>

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

function extractSpecies(
  payload: DndBeyondCharacterPayload,
): CharacterImportFieldResult<RecognizedSpeciesPreview> {
  const sourcePaths = ['data.race']
  const race = payload.race

  if (!race) {
    return fieldResult('missing-source', sourcePaths, [
      'Species is not set on the source character. D&D Beyond stores species on data.race.',
    ])
  }

  const sourceLabel = readDndBeyondSpeciesLabel(race)
  if (!sourceLabel) {
    return fieldResult('invalid-value', sourcePaths, [
      'Race data is present but missing a recognizable species name.',
    ])
  }

  const localSlug = inferLocalSpeciesSlug(race)
  const localValue = inferLocalSpeciesId(race)

  const species: RecognizedSpeciesPreview = {
    sourceValue: sourceLabel,
    sourceSlug: race.slug ?? undefined,
    sourceRaceId: race.entityRaceId ?? race.baseRaceId ?? undefined,
    baseSpeciesName: race.baseRaceName?.trim() || race.baseName?.trim() || undefined,
    isSubRace: race.isSubRace ?? undefined,
    localSlug,
    localValue,
    status: localSlug ? 'mapped' : 'unresolved-reference',
  }

  return mappedFieldResult(species, sourcePaths)
}

function extractClasses(
  payload: DndBeyondCharacterPayload,
): CharacterImportFieldResult<RecognizedClassPreview[]> {
  const sourcePaths = ['data.classes']
  const classes = payload.classes ?? []

  if (classes.length === 0) {
    return fieldResult('missing-source', sourcePaths, [
      'No classes were found on the source character.',
    ])
  }

  const previews: RecognizedClassPreview[] = []
  const issues: string[] = []

  for (const [index, dndClass] of classes.entries()) {
    const path = `data.classes[${index}]`
    const sourceLabel = readDndBeyondClassLabel(dndClass)

    if (!sourceLabel) {
      issues.push(`Class at ${path} is missing a recognizable name.`)
      continue
    }

    sourcePaths.push(path)

    const localSlug = inferLocalClassSlug(dndClass)
    const localValue = inferLocalClassId(dndClass)
    const subclassLabel = readDndBeyondSubclassLabel(dndClass)
    const subclassLocalSlug = inferLocalSubclassSlug(dndClass)
    const subclassLocalValue = inferLocalSubclassId(dndClass)

    previews.push({
      sourceValue: sourceLabel,
      sourceSlug: dndClass.definition?.slug ?? undefined,
      sourceClassId: dndClass.definition?.id ?? dndClass.definitionId ?? undefined,
      level: dndClass.level,
      subclassSourceValue: subclassLabel,
      subclassSourceSlug: dndClass.subclassDefinition?.slug ?? undefined,
      subclassLocalSlug,
      subclassLocalValue,
      localSlug,
      localValue,
      status: localSlug ? 'mapped' : 'unresolved-reference',
    })
  }

  if (previews.length === 0) {
    return fieldResult('invalid-value', sourcePaths, issues)
  }

  return {
    status: 'mapped',
    value: previews,
    sourcePaths,
    issues,
  }
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

function mapAlignmentName(value: string): Alignment | undefined {
  return DND_BEYOND_ALIGNMENT_NAME_TO_LOCAL[value.trim().toLowerCase()]
}

function extractAlignment(
  payload: DndBeyondCharacterPayload,
): CharacterImportFieldResult<Alignment> {
  const sourcePaths = ['data.alignmentId', 'data.alignment']
  const alignmentId = payload.alignmentId

  if (alignmentId != null && alignmentId !== 0) {
    const alignment = DND_BEYOND_ALIGNMENT_ID_TO_LOCAL[alignmentId]
    if (!alignment) {
      return fieldResult('invalid-value', sourcePaths, [
        `Source alignment id ${alignmentId} is not recognized.`,
      ])
    }

    return mappedFieldResult(alignment, ['data.alignmentId'])
  }

  const alignmentName = payload.alignment?.trim()
  if (alignmentName) {
    const alignment = mapAlignmentName(alignmentName)
    if (!alignment) {
      return fieldResult('invalid-value', sourcePaths, [
        `Source alignment "${alignmentName}" is not recognized.`,
      ])
    }

    return mappedFieldResult(alignment, ['data.alignment'])
  }

  return fieldResult('missing-source', sourcePaths, [
    'Alignment is not set on the source character.',
  ])
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
    current: base,
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

function classifyProficiency(subType: string): ClassifiedProficiency {
  if (SKILL_SUBTYPES.has(subType)) {
    return {
      kind: 'skill',
      skillId: subType,
      localValue: subType,
      status: 'mapped',
    }
  }

  const toolMapping = mapDndBeyondToolSubtype(subType)
  if (toolMapping) {
    return {
      kind: 'tool',
      toolId: toolMapping.toolId,
      toolCategory: toolMapping.toolCategory,
      localValue: toolMapping.toolCategory,
      status: 'mapped',
    }
  }

  if (isToolSubtype(subType)) {
    return { kind: 'tool', status: 'unresolved-reference' }
  }

  return { kind: 'skill', status: 'unresolved-reference' }
}

function proficiencyPreviewKey(entry: RecognizedProficiency): string {
  if (entry.kind === 'tool') {
    return `tool:${entry.toolCategory ?? entry.sourceValue}`
  }

  return `skill:${entry.skillId ?? entry.localValue ?? entry.sourceValue}`
}

function extractProficiencies(
  payload: DndBeyondCharacterPayload,
  dispositions: CharacterImportDispositionEntry[],
): CharacterImportFieldResult<CharacterImportProficienciesPreview> {
  const sourcePaths: string[] = []
  const skills: RecognizedProficiency[] = []
  const tools: RecognizedProficiency[] = []
  const seenSkills = new Set<string>()
  const seenTools = new Set<string>()
  const issues: string[] = []

  const recordDisposition = (
    path: string,
    sourceValue: string,
    classified: ClassifiedProficiency,
  ) => {
    if (classified.status === 'unresolved-reference') {
      dispositions.push({
        sourcePath: path,
        sourceValue,
        targetPath: 'proficiencies',
        disposition: 'unresolved-reference',
        reason: 'requires-catalog-resolution',
        message: `Proficiency subtype "${sourceValue}" requires local catalog resolution.`,
      })
      return
    }

    dispositions.push({
      sourcePath: path,
      sourceValue,
      targetPath: 'proficiencies',
      disposition: 'unsupported',
      reason: 'not-in-local-contract',
      message: `Proficiency subtype "${sourceValue}" is not supported by the local character contract.`,
    })
  }

  const addProficiency = (entry: RecognizedProficiency) => {
    const key = proficiencyPreviewKey(entry)
    if (entry.kind === 'tool') {
      if (seenTools.has(key)) return
      seenTools.add(key)
      tools.push(entry)
      return
    }

    if (seenSkills.has(key)) return
    seenSkills.add(key)
    skills.push(entry)
  }

  for (const { group, modifier, path } of collectModifiers(payload)) {
    if (modifier.type !== 'proficiency') continue
    sourcePaths.push(path)

    const sourceValue = modifier.subType?.trim()
    if (!sourceValue) {
      issues.push(`Proficiency modifier at ${path} is missing a subtype.`)
      continue
    }

    const normalizedSubType = sourceValue.toLowerCase()
    const ignoredRule = resolveDndBeyondProficiencyDisposition(normalizedSubType)
    if (ignoredRule) {
      dispositions.push({
        sourcePath: path,
        sourceValue,
        targetPath: ignoredRule.targetPath,
        disposition: ignoredRule.disposition,
        reason: ignoredRule.reason,
        message: ignoredRule.message,
      })
      continue
    }

    const classified = classifyProficiency(normalizedSubType)
    if (classified.status !== 'mapped') {
      recordDisposition(path, sourceValue, classified)
      issues.push(`Proficiency subtype "${sourceValue}" could not be mapped for preview.`)
      continue
    }

    addProficiency({
      kind: classified.kind,
      sourceValue,
      sourceLabel: modifier.friendlySubtypeName?.trim() || undefined,
      localValue: classified.localValue,
      skillId: classified.skillId,
      toolId: classified.toolId,
      toolCategory: classified.toolCategory,
      sourceGroup: group,
      status: classified.status,
      rank: 'proficient',
    })
  }

  for (const [index, custom] of (payload.customProficiencies ?? []).entries()) {
    const path = `data.customProficiencies[${index}]`
    sourcePaths.push(path)
    const sourceValue = custom.subType?.trim() || custom.name?.trim() || custom.type?.trim()
    if (!sourceValue) {
      issues.push(`Custom proficiency at ${path} is missing a recognizable label.`)
      continue
    }

    const normalizedSubType = sourceValue.toLowerCase()
    const ignoredRule = resolveDndBeyondProficiencyDisposition(normalizedSubType)
    if (ignoredRule) {
      dispositions.push({
        sourcePath: path,
        sourceValue,
        targetPath: ignoredRule.targetPath,
        disposition: ignoredRule.disposition,
        reason: ignoredRule.reason,
        message: ignoredRule.message,
      })
      continue
    }

    const classified = classifyProficiency(normalizedSubType)
    if (classified.status !== 'mapped') {
      recordDisposition(path, sourceValue, classified)
      continue
    }

    addProficiency({
      kind: classified.kind,
      sourceValue,
      sourceLabel: custom.name?.trim() || undefined,
      localValue: classified.localValue,
      skillId: classified.skillId,
      toolId: classified.toolId,
      toolCategory: classified.toolCategory,
      sourceGroup: 'custom',
      status: classified.status,
      rank: 'proficient',
    })
  }

  const preview = { skills, tools }

  if (skills.length === 0 && tools.length === 0 && dispositions.length === 0) {
    return fieldResult(
      'missing-source',
      ['data.modifiers', 'data.customProficiencies'],
      ['No proficiency modifiers were found in the source character.'],
    )
  }

  if (skills.length === 0 && tools.length === 0) {
    return fieldResult('unsupported', sourcePaths, issues)
  }

  return {
    status: 'mapped',
    value: preview,
    sourcePaths,
    issues,
  }
}

function extractEquipment(
  payload: DndBeyondCharacterPayload,
  equipmentNameIndex?: DndBeyondEquipmentNameIndex,
): CharacterImportFieldResult<RecognizedEquipmentItem[]> {
  const sourcePaths: string[] = []
  const aggregated = new Map<string, RecognizedEquipmentItem>()

  for (const [index, item] of (payload.inventory ?? []).entries()) {
    const path = `data.inventory[${index}]`
    const name = item.definition?.name?.trim()
    if (!name) continue

    sourcePaths.push(path)
    const key = name.toLowerCase()
    const quantity = item.quantity ?? 1
    const existing = aggregated.get(key)
    const catalogMatch = equipmentNameIndex
      ? resolveLocalEquipmentFromName(name, equipmentNameIndex)
      : undefined

    if (existing) {
      existing.quantity += quantity
      if (item.equipped) existing.equipped = true
      continue
    }

    aggregated.set(key, {
      sourceValue: name,
      sourceLabel: name,
      quantity,
      equipped: item.equipped ?? undefined,
      localValue: catalogMatch?.localValue,
      status: equipmentNameIndex ? (catalogMatch ? 'mapped' : 'unresolved-reference') : 'mapped',
    })
  }

  const equipment = [...aggregated.values()].sort((left, right) =>
    left.sourceLabel.localeCompare(right.sourceLabel),
  )

  if (equipment.length === 0) {
    return fieldResult(
      'missing-source',
      ['data.inventory'],
      ['No inventory items were found in the source character.'],
    )
  }

  return mappedFieldResult(equipment, sourcePaths)
}

function extractWealth(payload: DndBeyondCharacterPayload): CharacterImportFieldResult<CoinWealth> {
  const sourcePaths = ['data.currencies']

  if (!payload.currencies) {
    return fieldResult('missing-source', sourcePaths, [
      'No currency data was found on the source character.',
    ])
  }

  return mappedFieldResult(mapDndBeyondCurrenciesToWealth(payload.currencies), sourcePaths)
}

function extractSpells(
  payload: DndBeyondCharacterPayload,
  spellNameIndex?: DndBeyondSpellNameIndex,
): CharacterImportFieldResult<RecognizedSpellPreview[]> {
  const sourcePaths: string[] = []
  const spells: RecognizedSpellPreview[] = []
  const seen = new Set<string>()

  for (const [groupIndex, group] of (payload.classSpells ?? []).entries()) {
    for (const [spellIndex, spell] of (group.spells ?? []).entries()) {
      const path = `data.classSpells[${groupIndex}].spells[${spellIndex}]`
      const name = spell.definition?.name?.trim()

      if (!name) continue

      sourcePaths.push(path)

      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)

      const catalogMatch = spellNameIndex
        ? resolveLocalSpellFromName(name, spellNameIndex)
        : undefined

      spells.push({
        sourceValue: name,
        sourceLevel: spell.definition?.level ?? undefined,
        prepared: spell.prepared ?? spell.alwaysPrepared ?? undefined,
        localSlug: catalogMatch?.localSlug,
        localValue: catalogMatch?.localValue,
        status: spellNameIndex ? (catalogMatch ? 'mapped' : 'unresolved-reference') : 'mapped',
      })
    }
  }

  spells.sort((left, right) => left.sourceValue.localeCompare(right.sourceValue))

  if (spells.length === 0) {
    return fieldResult(
      'missing-source',
      ['data.classSpells'],
      ['No class spells were found on the source character.'],
    )
  }

  return mappedFieldResult(spells, sourcePaths)
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

export type AdaptDndBeyondCharacterOptions = {
  equipmentNameIndex?: DndBeyondEquipmentNameIndex
  spellNameIndex?: DndBeyondSpellNameIndex
}

export function adaptDndBeyondCharacter(
  payload: DndBeyondCharacterPayload,
  source: DndBeyondCharacterImportSource,
  options: AdaptDndBeyondCharacterOptions = {},
): CharacterImportResult {
  const dispositions: CharacterImportDispositionEntry[] = []

  const extraction = {
    name: extractName(payload),
    species: extractSpecies(payload),
    classes: extractClasses(payload),
    abilityScores: extractAbilityScores(payload),
    alignment: extractAlignment(payload),
    xp: extractXp(payload),
    narrative: extractNarrative(payload),
    hitPoints: extractHitPoints(payload),
    languages: extractLanguages(payload),
    proficiencies: extractProficiencies(payload, dispositions),
    equipment: extractEquipment(payload, options.equipmentNameIndex),
    wealth: extractWealth(payload),
    spells: extractSpells(payload, options.spellNameIndex),
  }

  const coverage = [
    ...buildCharacterImportCoverage(extraction, payload),
    ...buildServerOwnedCoverageEntries(),
  ]

  return {
    source,
    extraction,
    coverage,
    dispositions,
    availableSourceData: collectAvailableSourceData(payload),
  }
}

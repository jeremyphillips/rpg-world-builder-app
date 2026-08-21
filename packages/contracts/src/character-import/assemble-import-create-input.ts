import type { CharacterBuildCatalogIndex } from '../rpg/runtime/character-builder/context'
import { createCharacterInputSchema } from '../rpg/runtime/character/create-input'
import type { CreateCharacterInput } from '../rpg/runtime/character/create-input'
import {
  appendEquipmentEntry,
  EMPTY_CHARACTER_EQUIPMENT,
  type CharacterEquipment,
} from '../rpg/runtime/character/sheet/equipment-inventory'
import type { CharacterProficiencies } from '../rpg/runtime/character/sheet/proficiencies'
import type { CharacterSpellEntry } from '../rpg/runtime/character/sheet/spells'
import type { CharacterSelectionSource } from '../rpg/runtime/character/sheet/selection-sources'
import type { Alignment } from '../rpg/vocab/alignment'
import type { SystemRulesetId } from '../rpg/primitives/ruleset'
import type { CharacterImportResult } from './adapter/character-import-result.schema'
import type {
  RecognizedClassPreview,
  RecognizedEquipmentItem,
  RecognizedLanguage,
  RecognizedProficiency,
  RecognizedSpellPreview,
} from './adapter/character-import-preview-types'
import { CharacterImportFinalizationError } from './character-import-finalization-error'

const IMPORT_SELECTION_SOURCE: CharacterSelectionSource = { kind: 'manual' }

export type CharacterImportFinalizationIssue = {
  code: string
  message: string
  path?: string
}

export type CharacterImportFinalizeOptions = {
  rulesetId: SystemRulesetId
  catalogIndex: CharacterBuildCatalogIndex
  /** Used when the provider omits alignment (common for D&D Beyond). */
  defaultAlignment?: Alignment
}

function issue(code: string, message: string, path?: string): CharacterImportFinalizationIssue {
  return { code, message, path }
}

function requireMappedValue<T>(
  fieldPath: string,
  label: string,
  status: string,
  value: T | undefined,
): T {
  if (status !== 'mapped' || value == null) {
    throw new CharacterImportFinalizationError([
      issue(
        'import_field_unmapped',
        `${label} must be mapped before import can be saved.`,
        fieldPath,
      ),
    ])
  }

  return value
}

function assembleImportedClasses(
  classes: RecognizedClassPreview[],
): CreateCharacterInput['classes'] {
  const mapped = classes.filter((entry) => entry.status === 'mapped' && entry.localValue)

  if (mapped.length === 0) {
    throw new CharacterImportFinalizationError([
      issue(
        'import_classes_unmapped',
        'At least one class must match the local catalog before import can be saved.',
        'classes',
      ),
    ])
  }

  return mapped.map((entry) => ({
    classId: entry.localValue!,
    subclassId: entry.subclassLocalValue,
    level: entry.level,
  }))
}

function assembleImportedSpecies(
  species: NonNullable<CharacterImportResult['extraction']['species']['value']>,
): CreateCharacterInput['species'] {
  if (species.status !== 'mapped' || !species.localValue) {
    throw new CharacterImportFinalizationError([
      issue(
        'import_species_unmapped',
        'Species must match the local catalog before import can be saved.',
        'species.id',
      ),
    ])
  }

  return { id: species.localValue }
}

function mapSkillToolRank(rank: RecognizedProficiency['rank']): 'proficient' | 'expertise' {
  return rank === 'expertise' ? 'expertise' : 'proficient'
}

function assembleImportedProficiencies(
  skills: RecognizedProficiency[],
  tools: RecognizedProficiency[],
  languages: RecognizedLanguage[],
): CharacterProficiencies {
  return {
    skills: skills
      .filter((entry) => entry.status === 'mapped' && entry.skillId)
      .map((entry) => ({
        skill: entry.skillId!,
        rank: mapSkillToolRank(entry.rank),
        sources: [IMPORT_SELECTION_SOURCE],
      })),
    tools: tools
      .filter((entry) => entry.status === 'mapped' && (entry.toolId || entry.toolCategory))
      .map((entry) => ({
        ...(entry.toolId ? { toolId: entry.toolId } : { toolCategory: entry.toolCategory! }),
        rank: mapSkillToolRank(entry.rank),
        sources: [IMPORT_SELECTION_SOURCE],
      })),
    weapons: [],
    armor: [],
    languages: languages
      .filter((entry) => entry.status === 'mapped' && entry.localValue)
      .map((entry) => ({
        language: entry.localValue!,
        sources: [IMPORT_SELECTION_SOURCE],
      })),
  }
}

function assembleImportedEquipment(
  items: RecognizedEquipmentItem[],
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterEquipment {
  let inventory = EMPTY_CHARACTER_EQUIPMENT

  for (const item of items) {
    if (item.status !== 'mapped' || !item.localValue) continue

    const equipment = catalogIndex.equipment.get(item.localValue)
    if (!equipment) continue

    inventory = appendEquipmentEntry(inventory, equipment, {
      equipmentId: item.localValue,
      quantity: item.quantity,
      equipped: item.equipped,
      sources: [IMPORT_SELECTION_SOURCE],
    })
  }

  return inventory
}

function assembleImportedSpells(spells: RecognizedSpellPreview[]): CharacterSpellEntry[] {
  return spells
    .filter((entry) => entry.status === 'mapped' && entry.localValue)
    .map((entry) => ({
      spellId: entry.localValue!,
      sources: [IMPORT_SELECTION_SOURCE],
      access: { classKnown: true },
      selection: entry.prepared ? { prepared: true } : undefined,
    }))
}

function resolveImportedAlignment(
  extraction: CharacterImportResult['extraction'],
  options: CharacterImportFinalizeOptions,
): Alignment {
  if (extraction.alignment.status === 'mapped' && extraction.alignment.value) {
    return extraction.alignment.value
  }

  if (options.defaultAlignment) {
    return options.defaultAlignment
  }

  throw new CharacterImportFinalizationError([
    issue(
      'import_alignment_unmapped',
      'Alignment must be mapped or a defaultAlignment option must be provided before import can be saved.',
      'alignment',
    ),
  ])
}

const EMPTY_IMPORTED_WEALTH = { cp: 0, sp: 0, gp: 0, pp: 0 } as const

type CharacterImportExtraction = CharacterImportResult['extraction']

function resolveImportedXp(extraction: CharacterImportExtraction): number | null {
  if (extraction.xp.status !== 'mapped') return null
  return extraction.xp.value ?? null
}

function resolveImportedWealth(extraction: CharacterImportExtraction) {
  return extraction.wealth.status === 'mapped'
    ? (extraction.wealth.value ?? EMPTY_IMPORTED_WEALTH)
    : EMPTY_IMPORTED_WEALTH
}

function resolveImportedNarrative(extraction: CharacterImportExtraction) {
  return extraction.narrative.status === 'mapped' ? extraction.narrative.value : undefined
}

function buildImportCreateCharacterInput(
  extraction: CharacterImportExtraction,
  options: CharacterImportFinalizeOptions,
  required: {
    name: string
    abilityScores: CreateCharacterInput['abilityScores']
    hitPoints: CreateCharacterInput['hitPoints']
  },
): CreateCharacterInput {
  const proficienciesPreview = extraction.proficiencies.value ?? { skills: [], tools: [] }
  const languages = extraction.languages.value ?? []

  return {
    characterType: 'pc',
    name: required.name.trim(),
    rulesetId: options.rulesetId,
    classes: assembleImportedClasses(extraction.classes.value ?? []),
    species: assembleImportedSpecies(
      extraction.species.value ?? {
        sourceValue: '',
        status: 'unresolved-reference',
      },
    ),
    alignment: resolveImportedAlignment(extraction, options),
    xp: resolveImportedXp(extraction),
    abilityScores: required.abilityScores,
    hitPoints: required.hitPoints,
    proficiencies: assembleImportedProficiencies(
      proficienciesPreview.skills,
      proficienciesPreview.tools,
      languages,
    ),
    spells: assembleImportedSpells(extraction.spells.value ?? []),
    equipment: assembleImportedEquipment(extraction.equipment.value ?? [], options.catalogIndex),
    wealth: resolveImportedWealth(extraction),
    narrative: resolveImportedNarrative(extraction),
    connections: { organizations: [], locations: [] },
    feats: [],
  }
}

/**
 * Maps a preview `CharacterImportResult` to a `CreateCharacterInput`.
 *
 * Growth direction:
 * - Keep adaptation in `adaptDndBeyondCharacter()`; only map already-extracted fields here.
 * - Add kind-specific wrappers (`finalizeNpcCharacterImport`) instead of branching in this function.
 * - When new sheet fields ship, extend assembly helpers and coverage manifest together.
 */
export function assembleImportCreateCharacterInput(
  result: CharacterImportResult,
  options: CharacterImportFinalizeOptions,
): CreateCharacterInput {
  const { extraction } = result
  const name = requireMappedValue('name', 'Name', extraction.name.status, extraction.name.value)
  const abilityScores = requireMappedValue(
    'abilityScores',
    'Ability scores',
    extraction.abilityScores.status,
    extraction.abilityScores.value,
  )
  const hitPoints = requireMappedValue(
    'hitPoints',
    'Hit points',
    extraction.hitPoints.status,
    extraction.hitPoints.value,
  )

  const input = buildImportCreateCharacterInput(extraction, options, {
    name,
    abilityScores,
    hitPoints,
  })

  return createCharacterInputSchema.parse(input)
}

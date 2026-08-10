import {
  NEUTRAL_EQUIPMENT_RECOMMENDATION,
  assembleCharacterProficiencies,
  buildSpellPickerCompactSummary,
  compareEquipmentPickerItemsByRecommendation,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  listReachableSpellOptions,
  listReachableStartingWeapons,
  normalizeAutomaticNpcBuildConstraints,
  resolveEquipmentPickerItems,
  type CharacterBuildContext,
  type EquipmentPickerItem,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { buildEquipmentPickerRowViewModel } from '@/features/content'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'

export type QuickNpcWeaponRequirementOption = {
  option: FieldOption
  pickerItem: EquipmentPickerItem
  row: ReturnType<typeof buildEquipmentPickerRowViewModel>
}

export type QuickNpcSpellRequirementOption = {
  option: FieldOption
  compactSummary: ReturnType<typeof buildSpellPickerCompactSummary>
}

export type QuickNpcRequirementOptionSets = {
  weapons: QuickNpcWeaponRequirementOption[]
  spells: QuickNpcSpellRequirementOption[]
}

function buildQuickNpcWeaponRequirementOptions(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): QuickNpcWeaponRequirementOption[] {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const characterClass = catalogIndex.classes.get(args.setup.classId)
  if (!characterClass) return []

  const reachable = listReachableStartingWeapons({
    seed: { classId: args.setup.classId },
    context: args.context,
  })
  const equipment = reachable
    .map((weapon) => catalogIndex.equipment.get(weapon.id))
    .filter((row): row is NonNullable<typeof row> => row !== undefined)

  const draft = createEmptyCharacterBuilderDraft()
  draft.class = { classId: args.setup.classId, level: args.setup.level }
  draft.species = { speciesId: args.setup.speciesId }

  const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, [], characterClass)
  const pickerItems = resolveEquipmentPickerItems({
    equipment,
    proficiencies,
    recommendations: new Map(equipment.map((row) => [row.id, NEUTRAL_EQUIPMENT_RECOMMENDATION])),
  })

  return [...pickerItems].sort(compareEquipmentPickerItemsByRecommendation).map((pickerItem) => ({
    option: { value: pickerItem.equipment.id, label: pickerItem.equipment.name },
    pickerItem,
    row: buildEquipmentPickerRowViewModel(pickerItem.equipment),
  }))
}

function buildQuickNpcSpellRequirementOptions(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): QuickNpcSpellRequirementOption[] {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const reachable = listReachableSpellOptions({
    seed: { classId: args.setup.classId, level: args.setup.level },
    context: args.context,
  })

  return reachable
    .map((spellOption) => {
      const spell = catalogIndex.spells.get(spellOption.id)
      if (!spell) return null
      return {
        option: { value: spell.id, label: spell.name },
        compactSummary: buildSpellPickerCompactSummary(spell),
      }
    })
    .filter((entry): entry is QuickNpcSpellRequirementOption => entry !== null)
}

export function buildQuickNpcRequirementOptionSets(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): QuickNpcRequirementOptionSets {
  return {
    weapons: buildQuickNpcWeaponRequirementOptions(args),
    spells: buildQuickNpcSpellRequirementOptions(args),
  }
}

export function resolveQuickNpcRequirementCategories(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): { weapons: FieldOption[]; spells: FieldOption[] } {
  const sets = buildQuickNpcRequirementOptionSets(args)
  return {
    weapons: sets.weapons.map((entry) => entry.option),
    spells: sets.spells.map((entry) => entry.option),
  }
}

export function buildQuickNpcConstraintsFromArrays(args: {
  requiredWeaponIds: readonly string[]
  requiredSpellIds: readonly string[]
}) {
  return normalizeAutomaticNpcBuildConstraints({
    requiredWeaponIds: [...args.requiredWeaponIds],
    requiredSpellIds: [...args.requiredSpellIds],
  })
}

export function countQuickNpcConfiguredRequirementsFromArrays(args: {
  requiredWeaponIds: readonly string[]
  requiredSpellIds: readonly string[]
}): number {
  return args.requiredWeaponIds.length + args.requiredSpellIds.length
}

export function intersectQuickNpcRequirementIds(args: {
  requiredWeaponIds: readonly string[]
  requiredSpellIds: readonly string[]
  reachableWeaponIds: ReadonlySet<string>
  reachableSpellIds: ReadonlySet<string>
}): { requiredWeaponIds: string[]; requiredSpellIds: string[] } | undefined {
  const requiredWeaponIds = args.requiredWeaponIds.filter((id) => args.reachableWeaponIds.has(id))
  const requiredSpellIds = args.requiredSpellIds.filter((id) => args.reachableSpellIds.has(id))

  if (
    requiredWeaponIds.length === args.requiredWeaponIds.length &&
    requiredSpellIds.length === args.requiredSpellIds.length
  ) {
    return undefined
  }

  return { requiredWeaponIds, requiredSpellIds }
}

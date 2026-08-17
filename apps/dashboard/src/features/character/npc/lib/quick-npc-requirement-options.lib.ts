import {
  buildSpellPickerCompactSummary,
  compareEquipmentPickerItemsByRecommendation,
  indexCharacterBuildCatalog,
  listReachableSpellOptions,
  normalizeAutomaticNpcBuildConstraints,
  resolvePlayableBuilderContent,
  type CharacterBuildContext,
  type EquipmentPickerItem,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import {
  buildEquipmentPickerRecommendationContext,
  buildMinimalCharacterBuilderDraftForRecommendations,
} from '@/features/character/lib/equipment/equipment-picker-recommendation-context.lib'

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

function sortPickerItems(
  items: EquipmentPickerItem[],
  browseSortContext: ReturnType<
    typeof buildEquipmentPickerRecommendationContext
  >['browseSortContext'],
): EquipmentPickerItem[] {
  return [...items].sort((left, right) =>
    compareEquipmentPickerItemsByRecommendation(left, right, browseSortContext),
  )
}

/** Single resolver for campaign-available weapon requirement options. */
export function resolveQuickNpcWeaponRequirementOptions(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): QuickNpcWeaponRequirementOption[] {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const characterClass = catalogIndex.classes.get(args.setup.classId)
  if (!characterClass) return []

  const equipment = resolvePlayableBuilderContent(args.context).equipment.filter(
    (row) => row.kind === 'weapon',
  )
  const draft = buildMinimalCharacterBuilderDraftForRecommendations({
    speciesId: args.setup.speciesId,
    classId: args.setup.classId,
    level: args.setup.level,
  })
  const { items, browseSortContext } = buildEquipmentPickerRecommendationContext({
    equipment,
    draft,
    characterClass,
    catalogIndex,
  })

  return sortPickerItems(items, browseSortContext).map((pickerItem) => ({
    option: { value: pickerItem.equipment.id, label: pickerItem.equipment.name },
    pickerItem,
    row: buildEquipmentPickerRowViewModel(pickerItem.equipment),
  }))
}

export function resolveQuickNpcWeaponValidIds(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): ReadonlySet<string> {
  return new Set(resolveQuickNpcWeaponRequirementOptions(args).map((entry) => entry.option.value))
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
    weapons: resolveQuickNpcWeaponRequirementOptions(args),
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

export function resolveQuickNpcRequirementValidIds(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): { weaponIds: ReadonlySet<string>; spellIds: ReadonlySet<string> } {
  const sets = buildQuickNpcRequirementOptionSets(args)
  return {
    weaponIds: new Set(sets.weapons.map((entry) => entry.option.value)),
    spellIds: new Set(sets.spells.map((entry) => entry.option.value)),
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
  validWeaponIds: ReadonlySet<string>
  validSpellIds: ReadonlySet<string>
}): { requiredWeaponIds: string[]; requiredSpellIds: string[] } | undefined {
  const requiredWeaponIds = args.requiredWeaponIds.filter((id) => args.validWeaponIds.has(id))
  const requiredSpellIds = args.requiredSpellIds.filter((id) => args.validSpellIds.has(id))

  if (
    requiredWeaponIds.length === args.requiredWeaponIds.length &&
    requiredSpellIds.length === args.requiredSpellIds.length
  ) {
    return undefined
  }

  return { requiredWeaponIds, requiredSpellIds }
}

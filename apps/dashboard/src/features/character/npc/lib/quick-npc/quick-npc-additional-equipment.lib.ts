import {
  compareEquipmentPickerItemsByRecommendation,
  indexCharacterBuildCatalog,
  isEquipmentPickerSupportedEquipment,
  optionIdentitiesOverlap,
  resolvePlayableBuilderContent,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type EquipmentPickerItem,
  type EquipmentPickerSupportedKind,
} from '@rpg/contracts'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import {
  buildEquipmentPickerRecommendationContext,
  buildMinimalCharacterBuilderDraftForRecommendations,
} from '@/features/character/lib/equipment/equipment-picker-recommendation-context.lib'
import { resolveEquipmentKindFilterOptions } from '@/features/character/components/equipment/picker/drawer/equipment-picker-drawer.lib'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'

export type QuickNpcAdditionalEquipmentOption = {
  option: { value: string; label: string }
  pickerItem: EquipmentPickerItem
  row: ReturnType<typeof buildEquipmentPickerRowViewModel>
}

export function splitQuickNpcAdditionalEquipmentIds(args: {
  additionalEquipmentIds: readonly string[]
  catalogIndex: CharacterBuildCatalogIndex
}): { requiredWeaponIds: string[]; manualEquipmentGrantIds: string[] } {
  const requiredWeaponIds: string[] = []
  const manualEquipmentGrantIds: string[] = []

  for (const equipmentId of args.additionalEquipmentIds) {
    const equipment = args.catalogIndex.equipment.get(equipmentId)
    if (!equipment) continue
    if (equipment.kind === 'weapon') {
      requiredWeaponIds.push(equipmentId)
    } else {
      manualEquipmentGrantIds.push(equipmentId)
    }
  }

  return { requiredWeaponIds, manualEquipmentGrantIds }
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

export function resolveQuickNpcAdditionalEquipmentOptions(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): QuickNpcAdditionalEquipmentOption[] {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const characterClass = catalogIndex.classes.get(args.setup.classId)
  if (!characterClass) return []

  const equipment = resolvePlayableBuilderContent(args.context).equipment.filter((row) =>
    isEquipmentPickerSupportedEquipment(row),
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

export function resolveQuickNpcAdditionalEquipmentValidIds(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): ReadonlySet<string> {
  return new Set(resolveQuickNpcAdditionalEquipmentOptions(args).map((entry) => entry.option.value))
}

export function resolveQuickNpcAdditionalEquipmentKindOptions(args: {
  entries: readonly QuickNpcAdditionalEquipmentOption[]
  selectedIds: readonly string[]
  excludedIds: readonly string[]
}): EquipmentPickerSupportedKind[] {
  const available = args.entries.filter(
    (entry) =>
      !args.selectedIds.some((id) => optionIdentitiesOverlap(id, entry.option.value)) &&
      !args.excludedIds.some((id) => optionIdentitiesOverlap(id, entry.option.value)),
  )
  return resolveEquipmentKindFilterOptions(available.map((entry) => entry.pickerItem))
}

export function filterQuickNpcAdditionalEquipmentByKind(
  entries: readonly QuickNpcAdditionalEquipmentOption[],
  kind: EquipmentPickerSupportedKind,
  selectedIds: readonly string[],
  excludedIds: readonly string[],
): QuickNpcAdditionalEquipmentOption[] {
  return entries.filter(
    (entry) =>
      entry.pickerItem.equipment.kind === kind &&
      !selectedIds.some((id) => optionIdentitiesOverlap(id, entry.option.value)) &&
      !excludedIds.some((id) => optionIdentitiesOverlap(id, entry.option.value)),
  )
}

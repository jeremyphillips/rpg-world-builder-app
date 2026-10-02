import {
  getNpcTemplateEntry,
  indexCharacterBuildCatalog,
  isEquipmentPickerSupportedEquipment,
  resolveNpcTemplateEffectiveEquipmentPreferences,
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
import { sortEquipmentPickerItems } from '@/features/character/lib/equipment/sort-equipment-picker-items.lib'
import { resolveEquipmentKindFilterOptions } from '@/features/character/components/equipment/picker/drawer/equipment-picker-drawer.lib'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'
import { projectQuickNpcEquipmentAllocations } from './quick-npc-equipment-supply.lib'

export type QuickNpcAdditionalEquipmentOption = {
  option: { value: string; label: string }
  pickerItem: EquipmentPickerItem
  row: ReturnType<typeof buildEquipmentPickerRowViewModel>
}

export function splitQuickNpcAdditionalEquipmentIds(args: {
  equipmentSelections: readonly {
    equipmentId: string
    quantity: number
    origin: 'role-default' | 'manual'
  }[]
  catalogIndex: CharacterBuildCatalogIndex
  /** Classless rows sum every origin. Classed rows keep only manual additions. */
  constrainManualWeapons: boolean
}): { requiredWeaponIds: string[]; manualEquipmentGrantIds: string[] } {
  const projected = projectQuickNpcEquipmentAllocations({
    equipmentSelections: args.equipmentSelections.map((row) => ({
      equipmentId: row.equipmentId,
      quantity: row.quantity,
      origin: row.origin,
    })),
    catalogIndex: args.catalogIndex,
    classed: args.constrainManualWeapons,
  })
  return {
    requiredWeaponIds: projected.requiredWeaponIds,
    manualEquipmentGrantIds: projected.manualEquipmentGrantIds,
  }
}

export function resolveQuickNpcAdditionalEquipmentOptions(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): QuickNpcAdditionalEquipmentOption[] {
  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const characterClass = catalogIndex.classes.get(args.setup.classId)
  const equipment = resolvePlayableBuilderContent(args.context).equipment.filter((row) =>
    isEquipmentPickerSupportedEquipment(row),
  )
  if (!characterClass) {
    return [...equipment]
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((row) => ({
        option: { value: row.id, label: row.name },
        pickerItem: {
          equipment: row,
          state: {
            isAvailable: true,
            isRecommended: false,
            disabledReasons: [],
            isProficient: false,
            isWithinRemainingBudget: true,
            purchaseAvailability: { status: 'available' as const },
            recommendation: {
              tier: 'neutral' as const,
              reasons: [],
              specificity: 'broad_pool' as const,
            },
          },
        },
        row: buildEquipmentPickerRowViewModel(row),
      }))
  }
  const draft = buildMinimalCharacterBuilderDraftForRecommendations({
    speciesId: args.setup.speciesId,
    classId: args.setup.classId,
    level: args.setup.level,
  })
  const roleId = args.setup.npcTemplateId
  const { items, browseSortContext } = buildEquipmentPickerRecommendationContext({
    equipment,
    draft,
    characterClass,
    catalogIndex,
    ...(roleId
      ? {
          recommendationContext: {
            roleId,
            roleEquipmentPreferenceSlugs: resolveNpcTemplateEffectiveEquipmentPreferences(
              getNpcTemplateEntry(roleId)?.recommendations.equipment,
            ),
          },
        }
      : {}),
  })

  return sortEquipmentPickerItems(items, browseSortContext).map((pickerItem) => ({
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

export function resolveQuickNpcAdditionalEquipmentKindOptions(
  entries: readonly QuickNpcAdditionalEquipmentOption[],
): EquipmentPickerSupportedKind[] {
  return resolveEquipmentKindFilterOptions(entries.map((entry) => entry.pickerItem))
}

export function filterQuickNpcAdditionalEquipmentByKind(
  entries: readonly QuickNpcAdditionalEquipmentOption[],
  kind: EquipmentPickerSupportedKind,
): QuickNpcAdditionalEquipmentOption[] {
  return entries.filter((entry) => entry.pickerItem.equipment.kind === kind)
}

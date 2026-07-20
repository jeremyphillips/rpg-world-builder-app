'use client'

import { useMemo } from 'react'

import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  EquipmentPickerItem,
} from '@rpg/contracts'

import {
  formatMagicItemGrantProgressLabel,
  isMagicItemPickerItemVisible,
  readMagicItemGrantQuantity,
  resolveEquipmentAcquisitionContext,
  resolveEquipmentPickerWorkflowModes,
  resolveEquipmentStepAcquisitionState,
  shouldShowMagicItemGrants,
  type EquipmentPickerWorkflowMode,
} from '../../lib/equipment-step.lib'
import type { CharacterBuildCatalogIndex } from '@rpg/contracts'

export function useEquipmentMagicItemWorkflow(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  pickerItems: readonly EquipmentPickerItem[]
  pickerWorkflowMode: EquipmentPickerWorkflowMode
  showPurchaseWorkflow: boolean
  focusedAllowanceId?: string
}) {
  const acquisition = useMemo(
    () =>
      resolveEquipmentStepAcquisitionState({
        draft: args.draft,
        context: args.context,
        catalogIndex: args.catalogIndex,
      }),
    [args.catalogIndex, args.context, args.draft],
  )

  const showMagicItemGrants = shouldShowMagicItemGrants(acquisition)
  const pickerWorkflowModes = useMemo(
    () =>
      resolveEquipmentPickerWorkflowModes({
        showPurchase: args.showPurchaseWorkflow,
        showMagicItems: showMagicItemGrants,
      }),
    [args.showPurchaseWorkflow, showMagicItemGrants],
  )
  const magicItemProgressLabel = useMemo(
    () => formatMagicItemGrantProgressLabel(acquisition.progress),
    [acquisition.progress],
  )
  const filteredPickerItems = useMemo(() => {
    if (args.pickerWorkflowMode !== 'magic_items') return args.pickerItems

    return args.pickerItems.filter((item) =>
      isMagicItemPickerItemVisible({
        equipment: item.equipment,
        draft: args.draft,
        context: resolveEquipmentAcquisitionContext({
          context: args.context,
          catalogIndex: args.catalogIndex,
        }),
        focusedAllowanceId: args.focusedAllowanceId,
      }),
    )
  }, [acquisition, args.draft, args.focusedAllowanceId, args.pickerItems, args.pickerWorkflowMode])

  const ownedGrantQuantities = useMemo(() => {
    const quantities: Record<string, number> = {}
    for (const item of args.pickerItems) {
      const qty = readMagicItemGrantQuantity(args.draft, item.equipment.id)
      if (qty > 0) quantities[item.equipment.id] = qty
    }
    return quantities
  }, [args.draft, args.pickerItems])

  return {
    acquisition,
    showMagicItemGrants,
    pickerWorkflowModes,
    magicItemProgressLabel,
    filteredPickerItems,
    ownedGrantQuantities,
  }
}

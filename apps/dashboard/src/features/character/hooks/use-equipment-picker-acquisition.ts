import { useCallback, useMemo } from 'react'

import {
  applyEquipmentStepAction,
  resolveEquipmentAcquisitionActionState,
  resolveEquipmentAcquisitionBuilderContext,
  standardStartingWealthTableId,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type EquipmentBudgetSummary,
} from '@rpg/contracts'

import {
  resolveEquipmentAcquisitionContext,
  type EquipmentPickerWorkflowMode,
} from '../lib/equipment/equipment-step.lib'
import { buildEquipmentPickerOwnershipIndex } from '../lib/equipment/equipment-ownership-index.lib'
import { buildEquipmentPickerRowActionViewModel } from '../components/equipment/picker/equipment-picker-action.lib'
import type { EquipmentPickerItem } from '../components/equipment/picker/drawer/equipment-picker-drawer.types'
import type { CharacterBuildCatalogIndex } from '@rpg/contracts'

export function useEquipmentPickerAcquisition(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  showBudget: boolean
  workflowMode: EquipmentPickerWorkflowMode
  focusedAllowanceId?: string
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onFallbackAdd?: (item: EquipmentPickerItem, quantity: number) => void
}) {
  const {
    draft,
    context,
    catalogIndex,
    budget,
    showBudget,
    workflowMode,
    focusedAllowanceId,
    onDraftChange,
    onFallbackAdd,
  } = args

  const acquisitionContext = useMemo(
    () =>
      resolveEquipmentAcquisitionBuilderContext({
        context,
        catalogIndex,
        startingWealthTableId: standardStartingWealthTableId(context.rulesetId),
      }),
    [catalogIndex, context],
  )

  const applyEquipmentAction = useCallback(
    (action: Parameters<typeof applyEquipmentStepAction>[0]['action']) => {
      const result = applyEquipmentStepAction({
        draft,
        catalogIndex,
        budget,
        acquisitionContext,
        action,
      })
      if (result.status === 'applied') onDraftChange(result.patch)
      return result
    },
    [acquisitionContext, budget, catalogIndex, draft, onDraftChange],
  )

  const resolveRowActionViewModel = useCallback(
    (pickerArgs: {
      equipment: Parameters<typeof resolveEquipmentAcquisitionActionState>[0]['equipment']
      workflowMode: EquipmentPickerWorkflowMode
      requestedQuantity: number
    }) =>
      buildEquipmentPickerRowActionViewModel(
        resolveEquipmentAcquisitionActionState({
          draft,
          context: resolveEquipmentAcquisitionContext({ context, catalogIndex }),
          equipment: pickerArgs.equipment,
          workflowMode: pickerArgs.workflowMode,
          requestedQuantity: pickerArgs.requestedQuantity,
          focusedAllowanceId,
        }),
        { budget },
      ),
    [budget, catalogIndex, context, draft, focusedAllowanceId],
  )

  const ownership = useMemo(
    () =>
      buildEquipmentPickerOwnershipIndex({
        draft,
        catalogIndex,
        ...(budget ? { budget } : {}),
        options: {
          rulesetId: context.rulesetId,
          ...(context.characterCreationRules?.startingWealth
            ? { startingWealth: context.characterCreationRules.startingWealth }
            : {}),
        },
      }),
    [budget, catalogIndex, context, draft],
  )

  const handleApplyMagicItemAcquisition = useCallback(
    ({ equipmentId, requestedQuantity }: { equipmentId: string; requestedQuantity: number }) => {
      const result = applyEquipmentAction({
        kind: 'acquire_magic_item',
        equipmentId,
        requestedQuantity,
      })
      return result.status === 'applied'
    },
    [applyEquipmentAction],
  )

  const handleApplyPurchase = useCallback(
    ({ equipmentId, requestedQuantity }: { equipmentId: string; requestedQuantity: number }) => {
      if (!showBudget) return

      applyEquipmentAction({
        kind: 'apply_purchase_intent',
        equipmentId,
        requestedQuantity,
      })
    },
    [applyEquipmentAction, showBudget],
  )

  const handleReleaseGrant = useCallback(
    ({
      allowanceId,
      equipmentId,
      quantity,
    }: {
      allowanceId: string
      equipmentId: string
      quantity: number
    }) => {
      applyEquipmentAction({
        kind: 'release_magic_item_grant',
        allowanceId,
        equipmentId,
        quantity,
      })
    },
    [applyEquipmentAction],
  )

  const handleRemovePurchase = useCallback(
    ({ purchaseId, quantity }: { purchaseId: string; quantity: number }) => {
      applyEquipmentAction({
        kind: 'remove_purchase_quantity',
        purchaseId,
        quantity,
      })
    },
    [applyEquipmentAction],
  )

  /** Aggregate target across the item's editable purchase records. */
  const handleSetPurchasedQuantity = useCallback(
    (item: EquipmentPickerItem, total: number) => {
      applyEquipmentAction({
        kind: 'set_equipment_purchased_quantity',
        equipmentId: item.equipment.id,
        quantity: total,
      })
    },
    [applyEquipmentAction],
  )

  const handleReleaseChoice = useCallback(
    (item: EquipmentPickerItem, allowanceId: string) => {
      handleReleaseGrant({ allowanceId, equipmentId: item.equipment.id, quantity: 1 })
    },
    [handleReleaseGrant],
  )

  const handleRemovePurchaseOne = useCallback(
    (item: EquipmentPickerItem) => {
      const owned = ownership.get(item.equipment.id)?.editablePurchased.quantity ?? 0
      if (owned <= 0) return
      handleSetPurchasedQuantity(item, owned - 1)
    },
    [handleSetPurchasedQuantity, ownership],
  )

  const handleCommitAdd = useCallback(
    (item: EquipmentPickerItem): boolean | void => {
      if (workflowMode === 'magic_items') {
        return handleApplyMagicItemAcquisition({
          equipmentId: item.equipment.id,
          requestedQuantity: 1,
        })
      }

      if (showBudget) {
        handleApplyPurchase({ equipmentId: item.equipment.id, requestedQuantity: 1 })
        return true
      }

      onFallbackAdd?.(item, 1)
      return true
    },
    [handleApplyMagicItemAcquisition, handleApplyPurchase, onFallbackAdd, showBudget, workflowMode],
  )

  return {
    ownership,
    resolveRowActionViewModel,
    handleApplyMagicItemAcquisition,
    handleApplyPurchase,
    handleReleaseGrant,
    handleRemovePurchase,
    handleSetPurchasedQuantity,
    handleReleaseChoice,
    handleRemovePurchaseOne,
    handleCommitAdd,
  }
}

import { useCallback, useMemo } from 'react'

import {
  applyEquipmentStepAction,
  readMagicItemSelections,
  resolveEquipmentAcquisitionActionState,
  resolveEquipmentAcquisitionBuilderContext,
  resolveEquipmentPurchaseId,
  standardStartingWealthTableId,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type EquipmentBudgetSummary,
} from '@rpg/contracts'

import {
  resolveEquipmentAcquisitionContext,
  type EquipmentPickerWorkflowMode,
} from '../lib/equipment/equipment-step.lib'
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

  const resolveGrantManageSources = useCallback(
    (equipmentId: string) => {
      const grants = readMagicItemSelections(draft)
        .filter((row) => row.equipmentId === equipmentId)
        .map((row) => ({ allowanceId: row.allowanceId, quantity: row.quantity }))

      const purchases = (draft.equipment?.purchases ?? [])
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => row.equipmentId === equipmentId)
        .map(({ row, index }) => ({
          purchaseId: resolveEquipmentPurchaseId(draft.equipment?.purchases ?? [], index),
          quantity: row.quantity,
        }))

      return { grants, purchases }
    },
    [draft],
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

  const handleCommitAdd = useCallback(
    (item: EquipmentPickerItem, quantity: number): boolean | void => {
      if (workflowMode === 'magic_items') {
        return handleApplyMagicItemAcquisition({
          equipmentId: item.equipment.id,
          requestedQuantity: quantity,
        })
      }

      if (showBudget) {
        handleApplyPurchase({ equipmentId: item.equipment.id, requestedQuantity: quantity })
        return true
      }

      onFallbackAdd?.(item, quantity)
      return true
    },
    [handleApplyMagicItemAcquisition, handleApplyPurchase, onFallbackAdd, showBudget, workflowMode],
  )

  return {
    resolveRowActionViewModel,
    resolveGrantManageSources,
    handleApplyMagicItemAcquisition,
    handleApplyPurchase,
    handleReleaseGrant,
    handleRemovePurchase,
    handleCommitAdd,
  }
}

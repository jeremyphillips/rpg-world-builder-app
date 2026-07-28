'use client'

import { useCallback, useMemo, type ComponentProps } from 'react'

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
} from '../../lib/equipment-step.lib'
import { buildEquipmentPickerRowActionViewModel } from '../equipment/equipment-picker-action.lib'
import type { EquipmentPickerDrawer } from '../equipment/equipment-picker-drawer.client'
import type { CharacterBuildCatalogIndex } from '@rpg/contracts'

export function useEquipmentPickerAcquisition(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  showBudget: boolean
  focusedAllowanceId?: string
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}) {
  const { draft, context, catalogIndex, budget, showBudget, focusedAllowanceId, onDraftChange } =
    args

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

  const handleApplyMagicItemAcquisition: NonNullable<
    ComponentProps<typeof EquipmentPickerDrawer>['onApplyMagicItemAcquisition']
  > = useCallback(
    ({ equipmentId, requestedQuantity }) => {
      const result = applyEquipmentAction({
        kind: 'acquire_magic_item',
        equipmentId,
        requestedQuantity,
      })
      return result.status === 'applied'
    },
    [applyEquipmentAction],
  )

  const handleApplyPurchase: NonNullable<
    ComponentProps<typeof EquipmentPickerDrawer>['onApplyPurchase']
  > = useCallback(
    ({ equipmentId, requestedQuantity }) => {
      if (!showBudget) return

      applyEquipmentAction({
        kind: 'apply_purchase_intent',
        equipmentId,
        requestedQuantity,
      })
    },
    [applyEquipmentAction, showBudget],
  )

  const handleReleaseGrant: NonNullable<
    ComponentProps<typeof EquipmentPickerDrawer>['onReleaseGrant']
  > = useCallback(
    ({ allowanceId, equipmentId, quantity }) => {
      applyEquipmentAction({
        kind: 'release_magic_item_grant',
        allowanceId,
        equipmentId,
        quantity,
      })
    },
    [applyEquipmentAction],
  )

  const handleRemovePurchase: NonNullable<
    ComponentProps<typeof EquipmentPickerDrawer>['onRemovePurchase']
  > = useCallback(
    ({ purchaseId, quantity }) => {
      applyEquipmentAction({
        kind: 'remove_purchase_quantity',
        purchaseId,
        quantity,
      })
    },
    [applyEquipmentAction],
  )

  return {
    resolveRowActionViewModel,
    resolveGrantManageSources,
    handleApplyMagicItemAcquisition,
    handleApplyPurchase,
    handleReleaseGrant,
    handleRemovePurchase,
  }
}

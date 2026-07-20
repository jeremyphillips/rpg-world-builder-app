'use client'

import { useCallback, useMemo, type ComponentProps } from 'react'

import {
  readMagicItemSelections,
  resolveEquipmentAcquisitionActionState,
  resolveEquipmentPurchaseId,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type EquipmentBudgetSummary,
} from '@rpg/contracts'

import {
  buildEquipmentPurchaseIntentPatch,
  buildMagicItemAcquisitionPatch,
  buildMagicItemGrantReleasePatch,
  buildMagicItemPurchaseRemovalPatch,
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
    () => resolveEquipmentAcquisitionContext({ context, catalogIndex }),
    [catalogIndex, context],
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
          context: acquisitionContext,
          equipment: pickerArgs.equipment,
          workflowMode: pickerArgs.workflowMode,
          requestedQuantity: pickerArgs.requestedQuantity,
          focusedAllowanceId,
        }),
        { budget },
      ),
    [acquisitionContext, budget, draft, focusedAllowanceId],
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
      const patch = buildMagicItemAcquisitionPatch({
        draft,
        context,
        catalogIndex,
        equipmentId,
        requestedQuantity,
      })
      if (patch) onDraftChange(patch)
    },
    [catalogIndex, context, draft, onDraftChange],
  )

  const handleApplyPurchase: NonNullable<
    ComponentProps<typeof EquipmentPickerDrawer>['onApplyPurchase']
  > = useCallback(
    ({ equipmentId, requestedQuantity }) => {
      if (!showBudget) return

      const patch = buildEquipmentPurchaseIntentPatch({
        draft,
        context,
        catalogIndex,
        equipmentId,
        requestedQuantity,
      })
      if (patch) onDraftChange(patch)
    },
    [catalogIndex, context, draft, onDraftChange, showBudget],
  )

  const handleReleaseGrant: NonNullable<
    ComponentProps<typeof EquipmentPickerDrawer>['onReleaseGrant']
  > = useCallback(
    ({ allowanceId, equipmentId, quantity }) => {
      const patch = buildMagicItemGrantReleasePatch({
        draft,
        allowanceId,
        equipmentId,
        quantity,
      })
      if (patch) onDraftChange(patch)
    },
    [draft, onDraftChange],
  )

  const handleRemovePurchase: NonNullable<
    ComponentProps<typeof EquipmentPickerDrawer>['onRemovePurchase']
  > = useCallback(
    ({ purchaseId, quantity }) => {
      const patch = buildMagicItemPurchaseRemovalPatch({
        draft,
        catalogIndex,
        purchaseId,
        quantity,
        budget,
      })
      if (patch) onDraftChange(patch)
    },
    [budget, catalogIndex, draft, onDraftChange],
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

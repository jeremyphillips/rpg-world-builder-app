import type { Equipment } from '../../../../content/equipment'
import type { CharacterBuilderDraft } from '../../draft'
import { deriveEquipmentBudgetSummary } from './equipment-budget'
import type {
  EquipmentAcquisitionActionState,
  EquipmentAcquisitionBuilderContext,
} from './equipment-acquisition-types'
import { resolveEquipmentAcquisitionPlan } from './resolve-equipment-acquisition-plan'
import { resolveEquipmentAcquisitionQuantityBounds } from './resolve-equipment-acquisition-quantity-bounds'
import { resolveEquipmentPickerRowCapabilities } from './resolve-equipment-picker-row-capabilities'
import { resolveEquipmentPurchaseAvailability } from './resolve-equipment-purchase-availability'
import { resolveMagicItemGrantEligibility } from './resolve-magic-item-grant-eligibility'

export type EquipmentAcquisitionWorkflowMode = 'purchase' | 'magic_items'

export function resolveEquipmentAcquisitionActionState(args: {
  draft: CharacterBuilderDraft
  context: EquipmentAcquisitionBuilderContext
  equipment: Equipment
  workflowMode: EquipmentAcquisitionWorkflowMode
  requestedQuantity: number
  focusedAllowanceId?: string
}): EquipmentAcquisitionActionState {
  const { draft, context, equipment, workflowMode, requestedQuantity, focusedAllowanceId } = args

  if (workflowMode === 'purchase') {
    const budget = deriveEquipmentBudgetSummary(draft, context.catalogIndex, {
      startingWealth: context.startingWealth,
    })

    return {
      kind: 'purchase',
      availability: resolveEquipmentPurchaseAvailability({
        equipment,
        budget,
        requestedQuantity,
      }),
    }
  }

  const eligibility = resolveMagicItemGrantEligibility({
    equipment,
    draft,
    context,
    focusedAllowanceId,
  })
  const quantityBounds = resolveEquipmentAcquisitionQuantityBounds({ equipment, draft, context })
  const plan = resolveEquipmentAcquisitionPlan({
    draft,
    context,
    equipment,
    requestedQuantity,
  })
  const capabilities = resolveEquipmentPickerRowCapabilities({
    equipment,
    draft,
    eligibility,
    quantityBounds,
    context,
  })

  return {
    kind: 'magic_item_grant',
    eligibility,
    plan,
    capabilities,
    quantityBounds,
  }
}

import type { Equipment } from '../../../../content/equipment'
import type { CharacterBuilderDraft } from '../../draft'
import type {
  EquipmentAcquisitionBlocker,
  EquipmentAcquisitionBuilderContext,
  EquipmentPickerRowCapabilities,
} from './equipment-acquisition-types'
import type { MagicItemGrantEligibility } from './equipment-acquisition-types'
import type { EquipmentAcquisitionQuantityBounds } from './equipment-acquisition-types'
import { resolveEquipmentAcquisitionPlan } from './resolve-equipment-acquisition-plan'
import {
  readMagicItemSelections,
  totalSelectedForEquipment,
} from './resolve-magic-item-grant-progress'

function readEquipmentOwnership(draft: CharacterBuilderDraft, equipmentId: string) {
  const grantQuantity = totalSelectedForEquipment(readMagicItemSelections(draft), equipmentId)
  const purchaseQuantity = (draft.equipment?.purchases ?? [])
    .filter((row) => row.equipmentId === equipmentId)
    .reduce((sum, row) => sum + row.quantity, 0)

  return { grantQuantity, purchaseQuantity }
}

function resolveAddBlockedReason(args: {
  canAdd: boolean
  canExpand: boolean
  quantityBounds: EquipmentAcquisitionQuantityBounds
  planAtOne: ReturnType<typeof resolveEquipmentAcquisitionPlan>
}): EquipmentAcquisitionBlocker | undefined {
  if (args.canAdd || !args.canExpand) return undefined
  if (args.quantityBounds.maxAdditionalQuantity === 0) {
    return { code: 'duplicate_not_allowed' }
  }

  return args.planAtOne.blockers[0] ?? { code: 'no_matching_grant' }
}

export function resolveEquipmentPickerRowCapabilities(args: {
  equipment: Equipment
  draft: CharacterBuilderDraft
  eligibility: MagicItemGrantEligibility
  quantityBounds: EquipmentAcquisitionQuantityBounds
  context: EquipmentAcquisitionBuilderContext
}): EquipmentPickerRowCapabilities {
  const { equipment, draft, eligibility, quantityBounds, context } = args
  const { grantQuantity, purchaseQuantity } = readEquipmentOwnership(draft, equipment.id)
  const canManage = grantQuantity > 0 || purchaseQuantity > 0
  const planAtOne = resolveEquipmentAcquisitionPlan({
    draft,
    context,
    equipment,
    requestedQuantity: 1,
  })
  const canAdd =
    quantityBounds.maxAdditionalQuantity > 0 &&
    (eligibility.eligible || planAtOne.fulfilledQuantity > 0)
  const canExpand = canManage || canAdd || eligibility.eligible

  return {
    canExpand,
    canAdd,
    canManage,
    addBlockedReason: resolveAddBlockedReason({
      canAdd,
      canExpand,
      quantityBounds,
      planAtOne,
    }),
  }
}

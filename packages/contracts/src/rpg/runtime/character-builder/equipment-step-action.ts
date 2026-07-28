import type { CharacterBuilderDraft } from './draft'
import type { EquipmentPackageSwitchEvaluation } from './equipment-package-switch'
import type { EquipmentAcquisitionBlocker } from './resolvers/equipment/equipment-acquisition-types'

// ---------------------------------------------------------------------------
// Equipment step command API — canonical draft mutations (Phase B).
// Presentation maps issue/blocker codes at the dashboard boundary.
// ---------------------------------------------------------------------------

export type EquipmentStepAction = {
  kind: 'set_purchase_quantity'
  purchaseId: string
  quantity: number
}

export type EquipmentStepActionIssue =
  | { code: 'equipment_channel_missing' }
  | { code: 'purchase_not_found'; reference: { purchaseId: string } }
  | { code: 'equipment_not_in_catalog'; reference: { equipmentId: string } }
  | { code: 'quantity_not_editable'; reference: { purchaseId: string } }
  | { code: 'quantity_out_of_range'; reference: { purchaseId: string; quantity: number } }

export type EquipmentStepActionResult =
  | { status: 'applied'; patch: Partial<CharacterBuilderDraft> }
  | { status: 'needs_resolution'; resolution: EquipmentPackageSwitchEvaluation }
  | { status: 'blocked'; blockers: EquipmentAcquisitionBlocker[] }
  | { status: 'invalid'; issues: EquipmentStepActionIssue[] }

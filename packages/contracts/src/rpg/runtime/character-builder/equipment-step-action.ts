import type { CharacterBuilderDraft } from './draft'
import type { EquipmentPackageSwitchEvaluation } from './equipment-package-switch'
import type { EquipmentAcquisitionBlocker } from './resolvers/equipment/equipment-acquisition-types'

// ---------------------------------------------------------------------------
// Equipment step command API — canonical draft mutations.
// Presentation maps issue/blocker codes at the dashboard boundary.
// ---------------------------------------------------------------------------

export type EquipmentStepRemoveTarget =
  | { kind: 'package'; packageItemKey: string }
  | { kind: 'purchase'; purchaseId: string }
  | { kind: 'magicItemGrant'; allowanceId: string; equipmentId: string }

export type EquipmentStepAction =
  | { kind: 'set_purchase_quantity'; purchaseId: string; quantity: number }
  | { kind: 'skip_starting_equipment' }
  | {
      kind: 'select_package'
      optionId: string
      choiceSetId: string
      nestedSelections: CharacterBuilderDraft['choiceSelections']
    }
  | {
      kind: 'add_purchase'
      equipmentId: string
      sourceMode: NonNullable<CharacterBuilderDraft['equipment']>['purchases'][number]['sourceMode']
      quantity?: number
    }
  | { kind: 'remove_entry'; target: EquipmentStepRemoveTarget }
  | { kind: 'acquire_magic_item'; equipmentId: string; requestedQuantity: number }
  | { kind: 'apply_purchase_intent'; equipmentId: string; requestedQuantity: number }
  | {
      kind: 'release_magic_item_grant'
      allowanceId: string
      equipmentId: string
      quantity: number
    }
  | { kind: 'remove_purchase_quantity'; purchaseId: string; quantity: number }

export type EquipmentStepActionIssue =
  | { code: 'equipment_channel_missing' }
  | { code: 'purchase_not_found'; reference: { purchaseId: string } }
  | { code: 'equipment_not_in_catalog'; reference: { equipmentId: string } }
  | { code: 'quantity_not_editable'; reference: { purchaseId: string } }
  | { code: 'quantity_out_of_range'; reference: { purchaseId: string; quantity: number } }
  | { code: 'class_not_in_catalog' }
  | { code: 'option_not_in_catalog'; reference: { optionId: string } }
  | { code: 'grant_not_found'; reference: { allowanceId: string; equipmentId: string } }
  | { code: 'acquisition_context_missing' }
  | { code: 'quantity_not_allowed'; reference: { equipmentId: string } }

export type EquipmentStepActionResult =
  | { status: 'applied'; patch: Partial<CharacterBuilderDraft> }
  | { status: 'needs_resolution'; resolution: EquipmentPackageSwitchEvaluation }
  | { status: 'blocked'; blockers: EquipmentAcquisitionBlocker[] }
  | { status: 'invalid'; issues: EquipmentStepActionIssue[] }

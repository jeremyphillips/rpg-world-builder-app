import type { SystemRulesetId } from '../../../../primitives/ruleset'
import type { StartingWealthRules } from '../../../../campaign/rules/starting-wealth'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { EquipmentBudgetSummary } from './equipment-budget'
import type {
  MagicItemAllowance,
  MagicItemGrantProgress,
} from '../../equipment/magic-item-selection'
import type { EquipmentPurchaseAvailability } from './resolve-equipment-purchase-availability'

// ---------------------------------------------------------------------------
// Builder context for acquisition intents — re-derived on every command.
// ---------------------------------------------------------------------------

export type EquipmentAcquisitionBuilderContext = {
  catalogIndex: CharacterBuildCatalogIndex
  rulesetId: SystemRulesetId
  startingWealthTableId: string
  startingWealth: StartingWealthRules
}

// ---------------------------------------------------------------------------
// Acquisition plan — derived preview; never passed as authority to apply.
// ---------------------------------------------------------------------------

export type EquipmentAcquisitionGrantAllocation = {
  allowanceId: string
  quantity: number
}

export type EquipmentAcquisitionBlocker =
  | { code: 'no_matching_grant' }
  | { code: 'no_market_price' }
  | { code: 'cannot_afford'; shortfallCp: number }
  | { code: 'duplicate_not_allowed' }

export type EquipmentAcquisitionPartialAction = {
  /** Quantity to pass to a fresh apply intent — preview only, not a mutation payload. */
  requestedQuantity: number
  grantQuantity: number
  purchaseQuantity: number
  totalCostCp: number
}

export type EquipmentAcquisitionPlan = {
  requestedQuantity: number
  fulfilledQuantity: number
  unfulfilledQuantity: number
  grantAllocations: EquipmentAcquisitionGrantAllocation[]
  purchaseQuantity: number
  totalCostCp: number
  unitCostCp?: number
  canApplyRequestedQuantity: boolean
  blockers: EquipmentAcquisitionBlocker[]
  /** Resource-limited partial preview when fulfilled < requested but apply is still valid. */
  partialAction?: EquipmentAcquisitionPartialAction
}

export type EquipmentAcquisitionQuantityBounds = {
  maxAdditionalQuantity: number
}

export type MagicItemGrantEligibility =
  | { eligible: true; allowanceId: string }
  | {
      eligible: false
      reason: 'not_magic_item' | 'rarity_mismatch' | 'allowance_full'
    }

export type EquipmentPickerRowCapabilities = {
  canExpand: boolean
  canAdd: boolean
  canManage: boolean
  addBlockedReason?: EquipmentAcquisitionBlocker
}

export type EquipmentAcquisitionActionState =
  | { kind: 'purchase'; availability: EquipmentPurchaseAvailability }
  | {
      kind: 'magic_item_grant'
      eligibility: MagicItemGrantEligibility
      plan: EquipmentAcquisitionPlan
      capabilities: EquipmentPickerRowCapabilities
      quantityBounds: EquipmentAcquisitionQuantityBounds
    }

export type ApplyEquipmentIntentResult = {
  draft: CharacterBuilderDraft
  plan: EquipmentAcquisitionPlan
  applied: boolean
}

// ---------------------------------------------------------------------------
// Picker action mode — dashboard maps structured reasons to UI.
// ---------------------------------------------------------------------------

export type EquipmentPickerActionMode =
  | { kind: 'purchase'; availability: EquipmentPurchaseAvailability }
  | {
      kind: 'magic_item_grant'
      progress: MagicItemGrantProgress[]
      plan?: EquipmentAcquisitionPlan
    }

// ---------------------------------------------------------------------------
// Inventory display — aggregate provenance for presentation only.
// ---------------------------------------------------------------------------

export type EquipmentSourceAllocation = {
  kind: 'classStartingEquipment' | 'startingGold' | 'startingWealthTier' | 'manual'
  sourceId?: string
  grantId?: string
  allowanceId?: string
  quantity: number
}

export type ResolvedInventoryEntryView = {
  equipmentId: string
  quantity: number
  sources: EquipmentSourceAllocation[]
}

export type ResolvedMagicItemAcquisitionState = {
  allowances: MagicItemAllowance[]
  progress: MagicItemGrantProgress[]
  budget?: EquipmentBudgetSummary
}

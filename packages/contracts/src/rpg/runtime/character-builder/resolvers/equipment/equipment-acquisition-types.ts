import type { SystemRulesetId } from '../../../../primitives/ruleset'
import type { StartingWealthRules } from '../../../../campaign/rules/starting-wealth'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import type { EquipmentBudgetSummary } from './equipment-budget'
import type { MagicItemAllowance, MagicItemGrantProgress } from '../../magic-item-selection'
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

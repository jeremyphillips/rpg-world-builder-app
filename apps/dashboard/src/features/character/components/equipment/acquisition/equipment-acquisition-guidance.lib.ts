import {
  copperToWealth,
  formatWealth,
  formatWealthAsGold,
  type EquipmentBudgetSummary,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import type { EquipmentStepFundingState } from '../../../lib/equipment/equipment-step.lib'

export const EQUIPMENT_UNRESOLVED_FUNDING_HEADING = 'Starting funds not set'

export const EQUIPMENT_UNRESOLVED_FUNDING_DESCRIPTION =
  'Choose a starting equipment option to determine your available funds.'

export function formatEquipmentUnresolvedFundingSelectedLabel(pendingCostCp: number): string {
  return `${formatWealth(copperToWealth(pendingCostCp))} selected`
}

export function formatEquipmentBudgetGuidanceCopy(budget: EquipmentBudgetSummary): {
  heading: string
  description: string
} {
  return {
    heading: `${formatWealthAsGold(budget.remaining)} remaining`,
    description: joinInlineMetadata([
      `${formatWealthAsGold(budget.starting)} starting`,
      `${formatWealthAsGold(budget.spent)} spent`,
    ]),
  }
}

/** The funding card to show, if any. Unresolved funding shows even without a purchase workflow. */
export function resolveFundingGuidanceCard(
  fundingState: EquipmentStepFundingState,
  showPurchaseWorkflow: boolean,
): Exclude<EquipmentStepFundingState, { kind: 'none' }> | undefined {
  if (fundingState.kind === 'unresolved') return fundingState
  if (fundingState.kind === 'funded' && showPurchaseWorkflow) return fundingState
  return undefined
}

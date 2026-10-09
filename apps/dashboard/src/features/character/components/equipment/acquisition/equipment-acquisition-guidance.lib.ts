import {
  copperToWealth,
  formatInlineWealth,
  resolveEquipmentMagicItemSlots,
  type EquipmentBudgetSummary,
  type EquipmentMagicItemSlot,
  type MagicItemAllowance,
  type MagicItemGrantProgress,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import type { EquipmentStepFundingState } from '../../../lib/equipment/equipment-step.lib'
import { formatMagicItemChoiceRarityPhrase } from '../../../lib/equipment/magic-item-choice-label.lib'

export const EQUIPMENT_UNRESOLVED_FUNDING_HEADING = 'Starting funds not set'

export const EQUIPMENT_UNRESOLVED_FUNDING_DESCRIPTION =
  'Choose a starting equipment option to determine your available funds.'

export const EQUIPMENT_MAGIC_ITEMS_RESOURCE_HEADING = 'Magic items'

export function formatEquipmentUnresolvedFundingSelectedLabel(pendingCostCp: number): string {
  return `${formatInlineWealth(copperToWealth(pendingCostCp))} selected`
}

export type EquipmentBudgetGuidanceCopy = {
  heading: string
  subheading: string
}

export function formatEquipmentBudgetGuidanceCopy(
  budget: EquipmentBudgetSummary,
): EquipmentBudgetGuidanceCopy {
  return {
    heading: `${formatInlineWealth(budget.remaining)} remaining`,
    subheading: joinInlineMetadata([
      `${formatInlineWealth(budget.starting)} budget`,
      `${formatInlineWealth(budget.spent)} spent`,
    ]),
  }
}

export function formatEquipmentMagicItemSlotPresentation(slot: EquipmentMagicItemSlot): {
  lead: string
  detail?: string
  accessibleName: string
} {
  const lead = formatMagicItemChoiceRarityPhrase(
    slot.rarity,
    slot.rarityMode === 'maximum' ? 'up_to' : 'exact',
  )

  if (slot.fulfilled) {
    return { lead, accessibleName: `${lead}, complete` }
  }

  const detail = `${slot.remaining} ${slot.rarityMode === 'maximum' ? 'available' : 'remaining'}`
  return {
    lead,
    detail,
    accessibleName: joinInlineMetadata([lead, detail]),
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

export type EquipmentAcquisitionGuidanceAction = 'browse' | 'browse-magic' | 'manage-magic'

export type EquipmentAcquisitionGuidanceView = {
  unresolvedPendingCostCp?: number
  currency?: {
    heading: string
    subheading: string
  }
  slots?: readonly EquipmentMagicItemSlot[]
  currencyAction?: Extract<EquipmentAcquisitionGuidanceAction, 'browse'>
  magicItemsAction?: Extract<EquipmentAcquisitionGuidanceAction, 'browse-magic' | 'manage-magic'>
}

type EquipmentAcquisitionGuidanceViewInput = {
  showPurchaseWorkflow: boolean
  fundingState: EquipmentStepFundingState
  showMagicItemGrants: boolean
  magicItemAllowances: readonly MagicItemAllowance[]
  magicItemProgress: readonly MagicItemGrantProgress[]
}

function resolveGuidanceSlots(
  input: EquipmentAcquisitionGuidanceViewInput,
): readonly EquipmentMagicItemSlot[] {
  if (!input.showMagicItemGrants) return []
  return resolveEquipmentMagicItemSlots({
    allowances: input.magicItemAllowances,
    progress: input.magicItemProgress,
  })
}

function resolveGuidanceCurrency(
  fundingCard: ReturnType<typeof resolveFundingGuidanceCard>,
): EquipmentAcquisitionGuidanceView['currency'] {
  if (fundingCard?.kind !== 'funded') return undefined
  return formatEquipmentBudgetGuidanceCopy(fundingCard.budget)
}

function resolveGuidanceUnresolvedCost(
  fundingCard: ReturnType<typeof resolveFundingGuidanceCard>,
): number | undefined {
  if (fundingCard?.kind !== 'unresolved') return undefined
  return fundingCard.pendingCostCp
}

function resolveMagicItemsAction(
  slots: readonly EquipmentMagicItemSlot[],
): EquipmentAcquisitionGuidanceView['magicItemsAction'] {
  if (slots.length === 0) return undefined
  const hasChoiceCapacity = slots.some((slot) => slot.remaining > 0)
  return hasChoiceCapacity ? 'browse-magic' : 'manage-magic'
}

function hasGuidanceContent(view: {
  unresolvedPendingCostCp?: number
  currency?: EquipmentAcquisitionGuidanceView['currency']
  hasMagic: boolean
}): boolean {
  return view.unresolvedPendingCostCp !== undefined || view.currency !== undefined || view.hasMagic
}

/** What the step guidance section renders. Empty when neither funds nor magic slots exist. */
export function resolveEquipmentAcquisitionGuidanceView(
  input: EquipmentAcquisitionGuidanceViewInput,
): EquipmentAcquisitionGuidanceView | undefined {
  const fundingCard = resolveFundingGuidanceCard(input.fundingState, input.showPurchaseWorkflow)
  const slots = resolveGuidanceSlots(input)
  const currency = resolveGuidanceCurrency(fundingCard)
  const unresolvedPendingCostCp = resolveGuidanceUnresolvedCost(fundingCard)
  const hasMagic = slots.length > 0

  if (!hasGuidanceContent({ unresolvedPendingCostCp, currency, hasMagic })) return undefined

  return {
    unresolvedPendingCostCp,
    currency,
    slots: hasMagic ? slots : undefined,
    currencyAction: currency ? 'browse' : undefined,
    magicItemsAction: resolveMagicItemsAction(slots),
  }
}

import type {
  Equipment,
  MagicItemAcquiredCopyCap,
  MagicItemGrantProgress,
  MagicItemRarity,
} from '@rpg/contracts'
import { copperToDisplayWealth, formatWealth } from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import type {
  EntityAnatomyTrailingSecondary,
  EquipmentPickerRowViewModel,
} from '@/features/content'

import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'
import {
  EQUIPMENT_INVENTORY_GRANT_SOURCE_LABEL,
  EQUIPMENT_INVENTORY_PACKAGE_SOURCE_LABEL,
  EQUIPMENT_INVENTORY_RELEASE_ONE_LABEL,
  EQUIPMENT_INVENTORY_REMOVE_ONE_PURCHASE_LABEL,
  formatEquipmentInventorySourceQuantity,
} from '../../../../lib/equipment/equipment-step.lib'
import {
  formatMagicItemChoiceLabel,
  formatMagicItemChoiceRarityPhrase,
  formatMagicItemChoicesAlreadyUsed,
  formatNoMagicItemChoicesLabel,
  listExhaustedMagicItemChoiceRarities,
} from '../../../../lib/equipment/magic-item-choice-label.lib'
import type {
  EquipmentOwnership,
  EquipmentOwnershipChoice,
} from '../../../../lib/equipment/equipment-ownership-index.lib'
import {
  selectionBlocker,
  type SelectionBlockerReason,
  type SelectionStatusEntry,
} from '../../../../lib/selection-row-status'
import type { EquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL,
  EQUIPMENT_PICKER_UNAVAILABLE_HERE_LABEL,
} from '../drawer/equipment-picker-drawer.types'

export const EQUIPMENT_PICKER_PURCHASED_LABEL = 'Purchased'
export const EQUIPMENT_PICKER_CONVERTED_LABEL = 'Converted'

/**
 * The single acquisition affordance in the card header.
 *
 * - `add` — one more copy through the workflow's channel.
 * - `disabled` — a labeled action that cannot commit (for example Not for sale,
 *   or no remaining magic-item choices). `tooltip` explains a filled choice.
 * - `stepper` — owns the aggregate editable purchased quantity.
 * - `release` / `remove` — the item is at its acquired-copy cap, so the header
 *   acts on the one counted contribution instead of adding.
 */
export type EquipmentPickerHeaderControl =
  | { kind: 'add'; disabled: boolean }
  | { kind: 'disabled'; label: string; tooltip?: string }
  | { kind: 'stepper'; value: number; max: number }
  | { kind: 'release'; allowanceId: string }
  | { kind: 'remove'; purchaseId: string }
  | { kind: 'none' }

/** Provenance action target — the row binds the handler, the lib names the intent. */
export type EquipmentPickerProvenanceTarget =
  | { kind: 'release_choice'; allowanceId: string }
  | { kind: 'remove_purchase_one' }

export type EquipmentPickerProvenanceSegment =
  | { kind: 'text'; label: string }
  | {
      kind: 'action'
      key: string
      label: string
      ariaLabel: string
      target: EquipmentPickerProvenanceTarget
    }

export type EquipmentPickerItemPresentation = {
  /** Cost of the next copy — unit price, or the rarity choice in magic-items mode. */
  priceSlot?: EntityAnatomyTrailingSecondary
  /** Availability and affordability blockers; rendered with the row's selection presentation. */
  blockers?: readonly SelectionStatusEntry[]
  control: EquipmentPickerHeaderControl
  provenance: readonly EquipmentPickerProvenanceSegment[]
}

type EquipmentAcquisitionBlocker = NonNullable<
  Extract<
    EquipmentPickerRowActionViewModel,
    { kind: 'magic_item_grant' }
  >['capabilities']['addBlockedReason']
>

export const EQUIPMENT_ACQUISITION_BLOCKER_REASON = {
  no_matching_grant: 'acquisition_blocked',
  duplicate_not_allowed: 'acquisition_blocked',
  no_market_price: 'not_purchasable',
  cannot_afford: 'unaffordable',
} as const satisfies Record<EquipmentAcquisitionBlocker['code'], SelectionBlockerReason>

export function equipmentAcquisitionBlockerReason(
  code: EquipmentAcquisitionBlocker['code'],
): SelectionBlockerReason {
  return EQUIPMENT_ACQUISITION_BLOCKER_REASON[code]
}

export function formatEquipmentPickerHeaderTrailingLabel(args: {
  blocker: EquipmentAcquisitionBlocker
  rarity?: MagicItemRarity
}): string {
  switch (args.blocker.code) {
    case 'no_matching_grant':
      return args.rarity ? formatNoMagicItemChoicesLabel(args.rarity) : 'Unavailable'
    case 'no_market_price':
      return EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL
    case 'cannot_afford':
      return EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL
    default:
      return 'Unavailable'
  }
}

/** The cap only drives the header when exactly one acquired copy fills it. */
function isAtAcquiredCopyCap(copyCap: MagicItemAcquiredCopyCap | undefined): boolean {
  return copyCap !== undefined && copyCap.max === 1 && copyCap.used === 1
}

function cappedControl(ownership: EquipmentOwnership): EquipmentPickerHeaderControl {
  const choice = ownership.choices[0]
  if (choice) return { kind: 'release', allowanceId: choice.allowanceId }

  const purchase = ownership.contributions.find(
    (contribution) => contribution.kind === 'purchase' && contribution.quantity > 0,
  )
  if (purchase?.kind === 'purchase') return { kind: 'remove', purchaseId: purchase.purchaseId }

  return { kind: 'none' }
}

function choiceSegmentLabel(choice: EquipmentOwnershipChoice): string {
  return formatMagicItemChoiceLabel(choice.quantity, choice.rarity, choice.requirement)
}

function releaseSegment(choice: EquipmentOwnershipChoice): EquipmentPickerProvenanceSegment {
  return {
    kind: 'action',
    key: `release:${choice.allowanceId}`,
    label: EQUIPMENT_INVENTORY_RELEASE_ONE_LABEL,
    ariaLabel: `${EQUIPMENT_INVENTORY_RELEASE_ONE_LABEL} ${formatMagicItemChoiceRarityPhrase(
      choice.rarity,
      choice.requirement,
    )} choice`,
    target: { kind: 'release_choice', allowanceId: choice.allowanceId },
  }
}

function purchasedSegmentLabel(ownership: EquipmentOwnership): string {
  const { quantity, spendCp } = ownership.editablePurchased
  const base =
    quantity > 1
      ? `${EQUIPMENT_PICKER_PURCHASED_LABEL} ×${quantity}`
      : EQUIPMENT_PICKER_PURCHASED_LABEL
  if (spendCp <= 0) return base
  return joinInlineMetadata([base, formatWealth(copperToDisplayWealth(spendCp))])
}

function appendPackageProvenance(
  segments: EquipmentPickerProvenanceSegment[],
  packageQuantity: number,
): void {
  if (packageQuantity <= 0) return
  segments.push({
    kind: 'text',
    label:
      packageQuantity === 1
        ? EQUIPMENT_INVENTORY_PACKAGE_SOURCE_LABEL
        : formatEquipmentInventorySourceQuantity(
            EQUIPMENT_INVENTORY_PACKAGE_SOURCE_LABEL,
            packageQuantity,
          ),
  })
}

function appendGrantProvenance(
  segments: EquipmentPickerProvenanceSegment[],
  grantQuantity: number,
): void {
  if (grantQuantity <= 0) return
  segments.push({
    kind: 'text',
    label: formatEquipmentInventorySourceQuantity(
      EQUIPMENT_INVENTORY_GRANT_SOURCE_LABEL,
      grantQuantity,
    ),
  })
}

function appendChoiceProvenance(
  segments: EquipmentPickerProvenanceSegment[],
  choices: readonly EquipmentOwnershipChoice[],
  control: EquipmentPickerHeaderControl,
): void {
  for (const choice of choices) {
    segments.push({ kind: 'text', label: choiceSegmentLabel(choice) })
    const headerOwnsThisChoice =
      control.kind === 'release' && control.allowanceId === choice.allowanceId
    if (!headerOwnsThisChoice) segments.push(releaseSegment(choice))
  }
}

function appendLockedPurchasedProvenance(
  segments: EquipmentPickerProvenanceSegment[],
  lockedQuantity: number,
): void {
  if (lockedQuantity <= 0) return
  segments.push({
    kind: 'text',
    label: formatEquipmentInventorySourceQuantity(EQUIPMENT_PICKER_CONVERTED_LABEL, lockedQuantity),
  })
}

function appendEditablePurchasedProvenance(
  segments: EquipmentPickerProvenanceSegment[],
  ownership: EquipmentOwnership,
  control: EquipmentPickerHeaderControl,
  workflowMode: EquipmentPickerWorkflowMode,
): void {
  if (ownership.editablePurchased.quantity <= 0 || control.kind === 'stepper') return
  segments.push({ kind: 'text', label: purchasedSegmentLabel(ownership) })
  if (workflowMode !== 'magic_items' || control.kind === 'remove') return
  segments.push({
    kind: 'action',
    key: 'remove-purchase-one',
    label: EQUIPMENT_INVENTORY_REMOVE_ONE_PURCHASE_LABEL,
    ariaLabel: `${EQUIPMENT_INVENTORY_REMOVE_ONE_PURCHASE_LABEL} purchased copy`,
    target: { kind: 'remove_purchase_one' },
  })
}

function resolveProvenance(args: {
  ownership: EquipmentOwnership
  control: EquipmentPickerHeaderControl
  workflowMode: EquipmentPickerWorkflowMode
}): EquipmentPickerProvenanceSegment[] {
  const { ownership, control, workflowMode } = args
  const segments: EquipmentPickerProvenanceSegment[] = []

  appendPackageProvenance(segments, ownership.packageQuantity)
  appendGrantProvenance(segments, ownership.grantQuantity)
  appendChoiceProvenance(segments, ownership.choices, control)
  appendLockedPurchasedProvenance(segments, ownership.lockedPurchased.quantity)
  appendEditablePurchasedProvenance(segments, ownership, control, workflowMode)

  return segments
}

function resolvePurchaseControl(args: {
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'purchase' }>
  ownership: EquipmentOwnership
  maxPurchaseQuantity: number
}): EquipmentPickerHeaderControl {
  const { rowActionVm, ownership, maxPurchaseQuantity } = args
  const purchased = ownership.editablePurchased.quantity

  if (purchased > 0) {
    // A blocked row (unaffordable next copy) pins max at the current aggregate so
    // the stepper can still decrement.
    const ceiling = rowActionVm.disabled ? purchased : Math.max(maxPurchaseQuantity, purchased)
    return { kind: 'stepper', value: purchased, max: ceiling }
  }

  return { kind: 'add', disabled: rowActionVm.disabled }
}

function resolvePurchasePresentation(args: {
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'purchase' }>
  row: EquipmentPickerRowViewModel
  ownership: EquipmentOwnership
  workflowMode: EquipmentPickerWorkflowMode
  maxPurchaseQuantity: number
}): EquipmentPickerItemPresentation {
  const { rowActionVm, row, ownership, workflowMode, maxPurchaseQuantity } = args
  const { availability } = rowActionVm

  if (availability.status === 'unavailableForPurchase') {
    if (availability.reason === 'no_market_price') {
      const control: EquipmentPickerHeaderControl = {
        kind: 'disabled',
        label: EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL,
      }
      return {
        control,
        provenance: resolveProvenance({ ownership, control, workflowMode }),
      }
    }

    const control: EquipmentPickerHeaderControl = { kind: 'none' }
    return {
      blockers: [selectionBlocker('unavailable', EQUIPMENT_PICKER_UNAVAILABLE_HERE_LABEL)],
      control,
      provenance: resolveProvenance({ ownership, control, workflowMode }),
    }
  }

  const control = resolvePurchaseControl({ rowActionVm, ownership, maxPurchaseQuantity })
  const priceLabel = row.priceLabel || undefined
  const provenance = resolveProvenance({ ownership, control, workflowMode })

  if (availability.status === 'unaffordable' && !priceLabel) {
    return {
      blockers: [selectionBlocker('unaffordable', EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL)],
      control,
      provenance,
    }
  }

  return {
    ...(priceLabel ? { priceSlot: { kind: 'price' as const, label: priceLabel } } : {}),
    control,
    provenance,
  }
}

function resolveMagicItemHeaderBlocker(args: {
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'magic_item_grant' }>
  rarity: MagicItemRarity | undefined
}): EquipmentAcquisitionBlocker | { code: 'no_matching_grant' } | undefined {
  const blocker =
    args.rowActionVm.capabilities.addBlockedReason ?? args.rowActionVm.plan.blockers[0]
  if (blocker && blocker.code !== 'duplicate_not_allowed') return blocker
  if (args.rarity) return { code: 'no_matching_grant' }
  return undefined
}

function shouldShowMagicItemChoiceUnavailableAction(args: {
  rarity: MagicItemRarity | undefined
  headerBlocker: EquipmentAcquisitionBlocker | { code: 'no_matching_grant' } | undefined
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
}): args is {
  rarity: MagicItemRarity
  headerBlocker: EquipmentAcquisitionBlocker | { code: 'no_matching_grant' }
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
} {
  const { rarity, headerBlocker, magicItemGrantProgress } = args
  if (!rarity || !headerBlocker) return false
  if (headerBlocker.code === 'no_matching_grant') return true

  const exhausted = listExhaustedMagicItemChoiceRarities({
    itemRarity: rarity,
    progress: magicItemGrantProgress ?? [],
  })
  if (!exhausted.includes(rarity)) return false

  return headerBlocker.code === 'no_market_price' || headerBlocker.code === 'cannot_afford'
}

function resolveMagicItemChoiceUnavailableControl(args: {
  rarity: MagicItemRarity
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
}): EquipmentPickerHeaderControl {
  const exhausted = listExhaustedMagicItemChoiceRarities({
    itemRarity: args.rarity,
    progress: args.magicItemGrantProgress ?? [],
  })
  const tooltip = exhausted.length > 0 ? formatMagicItemChoicesAlreadyUsed(exhausted) : undefined

  return {
    kind: 'disabled',
    label: formatNoMagicItemChoicesLabel(args.rarity),
    ...(tooltip ? { tooltip } : {}),
  }
}

function resolveMagicItemBlockedPresentation(args: {
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'magic_item_grant' }>
  rarity: MagicItemRarity | undefined
  ownership: EquipmentOwnership
  workflowMode: EquipmentPickerWorkflowMode
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
}): EquipmentPickerItemPresentation {
  const { rowActionVm, rarity, ownership, workflowMode, magicItemGrantProgress } = args
  const headerBlocker = resolveMagicItemHeaderBlocker({ rowActionVm, rarity })

  const magicItemChoiceUnavailable = {
    rarity,
    headerBlocker,
    magicItemGrantProgress,
  }
  if (shouldShowMagicItemChoiceUnavailableAction(magicItemChoiceUnavailable)) {
    const control = resolveMagicItemChoiceUnavailableControl({
      rarity: magicItemChoiceUnavailable.rarity,
      magicItemGrantProgress: magicItemChoiceUnavailable.magicItemGrantProgress,
    })
    return {
      control,
      provenance: resolveProvenance({ ownership, control, workflowMode }),
    }
  }

  const control: EquipmentPickerHeaderControl = { kind: 'none' }
  const provenance = resolveProvenance({ ownership, control, workflowMode })
  if (!headerBlocker) return { control, provenance }

  return {
    blockers: [
      selectionBlocker(
        equipmentAcquisitionBlockerReason(headerBlocker.code),
        formatEquipmentPickerHeaderTrailingLabel({ blocker: headerBlocker, rarity }),
      ),
    ],
    control,
    provenance,
  }
}

/** Magic-items mode buys nothing: Add spends a choice, and runs out when choices do. */
function resolveMagicItemPresentation(args: {
  rowActionVm: Extract<EquipmentPickerRowActionViewModel, { kind: 'magic_item_grant' }>
  equipment: Equipment
  ownership: EquipmentOwnership
  workflowMode: EquipmentPickerWorkflowMode
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
}): EquipmentPickerItemPresentation {
  const { rowActionVm, equipment, ownership, workflowMode, magicItemGrantProgress } = args
  const rarity = equipment.kind === 'magic_item' ? equipment.rarity : undefined
  const grantQuantity = rowActionVm.plan.grantAllocations.reduce(
    (sum, allocation) => sum + allocation.quantity,
    0,
  )

  if (rowActionVm.capabilities.canAdd && grantQuantity > 0 && rarity) {
    const control: EquipmentPickerHeaderControl = { kind: 'add', disabled: false }
    return {
      priceSlot: { kind: 'grantPreview', label: formatMagicItemChoiceLabel(grantQuantity, rarity) },
      control,
      provenance: resolveProvenance({ ownership, control, workflowMode }),
    }
  }

  return resolveMagicItemBlockedPresentation({
    rowActionVm,
    rarity,
    ownership,
    workflowMode,
    magicItemGrantProgress,
  })
}

export function resolveEquipmentPickerItemPresentation(args: {
  equipment: Equipment
  row: EquipmentPickerRowViewModel
  workflowMode: EquipmentPickerWorkflowMode
  rowActionVm: EquipmentPickerRowActionViewModel
  ownership: EquipmentOwnership
  copyCap?: MagicItemAcquiredCopyCap
  /** Budget- and cap-limited aggregate ceiling for the purchase stepper. */
  maxPurchaseQuantity?: number
  /** Filled choice buckets that the disabled action's tooltip can name. */
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
}): EquipmentPickerItemPresentation {
  const { equipment, row, workflowMode, rowActionVm, ownership, copyCap } = args

  if (isAtAcquiredCopyCap(copyCap)) {
    const control = cappedControl(ownership)
    return { control, provenance: resolveProvenance({ ownership, control, workflowMode }) }
  }

  if (workflowMode === 'purchase' && rowActionVm.kind === 'purchase') {
    return resolvePurchasePresentation({
      rowActionVm,
      row,
      ownership,
      workflowMode,
      maxPurchaseQuantity: args.maxPurchaseQuantity ?? ownership.editablePurchased.quantity,
    })
  }

  if (rowActionVm.kind !== 'magic_item_grant') {
    const control: EquipmentPickerHeaderControl = { kind: 'none' }
    return { control, provenance: resolveProvenance({ ownership, control, workflowMode }) }
  }

  return resolveMagicItemPresentation({
    rowActionVm,
    equipment,
    ownership,
    workflowMode,
    magicItemGrantProgress: args.magicItemGrantProgress,
  })
}

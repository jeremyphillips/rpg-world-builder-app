import type { Equipment } from '../../../../content/equipment'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { EquipmentAcquisitionBuilderContext } from '../equipment/equipment-acquisition-types'
import { resolveEquipmentAcquisitionQuantityBounds } from '../equipment/resolve-equipment-acquisition-quantity-bounds'
import { resolveEquipmentPickerRowCapabilities } from '../equipment/resolve-equipment-picker-row-capabilities'
import { resolveMagicItemGrantEligibility } from '../equipment/resolve-magic-item-grant-eligibility'
import type { EquipmentPickerItem } from './equipment-picker-item'

export type MagicItemActionReason =
  | 'grant_available'
  | 'manageable'
  | 'no_matching_choice'
  | 'unavailable'

export type MagicItemActionState = {
  rank: number
  reason: MagicItemActionReason
  /** True when row is owned but outside focused rarity — sinks within manageable tier */
  outOfFocusedScope?: boolean
}

const MANAGEABLE_OUT_OF_SCOPE_RANK = 2

export function getMagicItemPickerActionRank(args: {
  equipment: Equipment
  draft: CharacterBuilderDraft
  context: EquipmentAcquisitionBuilderContext
  focusedAllowanceId?: string
  outOfFocusedScope?: boolean
}): MagicItemActionState {
  const eligibility = resolveMagicItemGrantEligibility({
    equipment: args.equipment,
    draft: args.draft,
    context: args.context,
    focusedAllowanceId: args.focusedAllowanceId,
  })
  const quantityBounds = resolveEquipmentAcquisitionQuantityBounds({
    equipment: args.equipment,
    draft: args.draft,
    context: args.context,
  })
  const capabilities = resolveEquipmentPickerRowCapabilities({
    equipment: args.equipment,
    draft: args.draft,
    eligibility,
    quantityBounds,
    context: args.context,
  })

  if (eligibility.eligible) {
    return { rank: 0, reason: 'grant_available' }
  }

  if (capabilities.canManage) {
    if (args.outOfFocusedScope) {
      return {
        rank: MANAGEABLE_OUT_OF_SCOPE_RANK,
        reason: 'manageable',
        outOfFocusedScope: true,
      }
    }

    return { rank: 1, reason: 'manageable' }
  }

  if (!capabilities.canExpand) {
    return { rank: 3, reason: 'unavailable' }
  }

  return { rank: 2, reason: 'no_matching_choice' }
}

export function compareMagicItemBestMatch(
  left: EquipmentPickerItem,
  right: EquipmentPickerItem,
): number {
  const leftAction = left.state.magicItemAction
  const rightAction = right.state.magicItemAction

  if (!leftAction && !rightAction) return 0
  if (!leftAction) return 1
  if (!rightAction) return -1

  return leftAction.rank - rightAction.rank
}

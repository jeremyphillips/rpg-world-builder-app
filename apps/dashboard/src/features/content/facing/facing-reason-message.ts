import type { FacingReason } from '@rpg/contracts'

import {
  formatMonsterActionAttackPreviewConfigureHint,
  formatMonsterActionMultiattackPreviewConfigureHint,
  MONSTER_MULTIATTACK_STEPS_LABEL,
} from '../monsters/lib/monster-form-labels'
import {
  attackInputFieldLabel,
  FACING_REASON_STATIC_MESSAGES,
  type FacingReasonStaticCode,
  facingCatalogErrorMessage,
  facingCatalogPendingMessage,
  TRAIT_ADD_DETAILS_MESSAGE,
} from './facing-reason-message.lib'

export { FACING_UNEXPECTED_MESSAGE } from './facing-reason-message.lib'

function staticFacingReasonMessage(code: FacingReasonStaticCode): string {
  return FACING_REASON_STATIC_MESSAGES[code]
}

/** Single sentence adapter for structured facing reasons — dashboard only. */
export function facingReasonMessage(reason: FacingReason): string {
  switch (reason.code) {
    case 'missing-attack-input':
      return formatMonsterActionAttackPreviewConfigureHint(
        reason.label ?? attackInputFieldLabel(reason.field),
      )
    case 'missing-multiattack-steps':
      return formatMonsterActionMultiattackPreviewConfigureHint(MONSTER_MULTIATTACK_STEPS_LABEL)
    case 'catalog-pending':
      return facingCatalogPendingMessage(reason.catalog)
    case 'catalog-error':
      return facingCatalogErrorMessage(reason.catalog)
    default:
      return staticFacingReasonMessage(reason.code)
  }
}

/** Trait draft rows with no title still use the add-details sentence. */
export function facingTraitReasonMessage(
  reason: FacingReason,
  options?: { emptyTitle?: boolean },
): string {
  if (reason.code === 'incomplete-trait' && options?.emptyTitle) {
    return TRAIT_ADD_DETAILS_MESSAGE
  }
  return facingReasonMessage(reason)
}

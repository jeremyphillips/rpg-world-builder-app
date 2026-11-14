import { defineMessage, formatFieldMessage } from '../../../../validation/define-message'

import type { RequirementTargetIncompatibilityReason } from './requirement-target-compatibility'

export type RequirementTargetMessageTone = 'validation' | 'option'

/** Row-level validation when a requirement does not apply to the selected target kind. */
export const RESOLUTION_REQUIREMENT_CREATURE_ONLY_VALIDATION =
  'Only applies to creatures. Select Creature targeting or remove this requirement.' as const

const creatureOnlyValidation = defineMessage(
  'validation.resolutionTarget.requirementCreatureOnly',
  () => RESOLUTION_REQUIREMENT_CREATURE_ONLY_VALIDATION,
)

const creatureOnlyOption = defineMessage(
  'validation.resolutionTarget.requirementCreatureOnlyOption',
  () => 'Only available for Creature targets',
)

/** Validation or menu copy for target-kind incompatibility. */
export function formatRequirementTargetIncompatibilityMessage(
  _reason: RequirementTargetIncompatibilityReason,
  tone: RequirementTargetMessageTone,
): string {
  if (tone === 'option') {
    return formatFieldMessage(creatureOnlyOption())
  }
  return formatFieldMessage(creatureOnlyValidation())
}

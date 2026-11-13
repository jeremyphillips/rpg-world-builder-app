import { defineMessage, formatFieldMessage } from '../../../../validation/define-message'

import type { RequirementCompatibilityInput } from './requirement-target-compatibility'
import type { RequirementTargetIncompatibilityReason } from './requirement-target-compatibility'

export type RequirementTargetMessageTone = 'validation' | 'option'

function requirementLabel(input: RequirementCompatibilityInput): string {
  switch (input.kind) {
    case 'sight':
      if (input.who === 'target') return 'It can see you'
      if (input.who === 'both') return 'You and the target can see each other'
      return 'You can see it'
    case 'size':
      return 'Creature size'
    case 'creature-type':
      return 'Creature type'
    case 'condition':
      return 'Condition'
    case 'willing':
      return 'Willing'
    case 'any-of':
      return 'Willing or has a condition'
    case 'written':
      return 'Custom requirement'
    default: {
      const _exhaustive: never = input
      return _exhaustive
    }
  }
}

const creatureOnlyValidation = defineMessage<{ requirement: string }>(
  'validation.resolutionTarget.requirementCreatureOnly',
  ({ requirement }) =>
    `${requirement} only applies to creatures. Select Creature targeting or remove this requirement.`,
)

const creatureOnlyOption = defineMessage(
  'validation.resolutionTarget.requirementCreatureOnlyOption',
  () => 'Only available for Creature targets',
)

/** Validation or menu copy for target-kind incompatibility. */
export function formatRequirementTargetIncompatibilityMessage(
  reason: RequirementTargetIncompatibilityReason,
  tone: RequirementTargetMessageTone,
): string {
  if (tone === 'option') {
    return formatFieldMessage(creatureOnlyOption())
  }
  return formatFieldMessage(creatureOnlyValidation({ requirement: requirementLabel(reason.input) }))
}

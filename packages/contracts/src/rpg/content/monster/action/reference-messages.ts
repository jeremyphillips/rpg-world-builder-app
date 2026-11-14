export const ACTION_REFERENCE_DUPLICATE_MESSAGE = 'Each action can be chosen only once.'

export const ACTION_REFERENCE_CHOOSE_FROM_ACTIONS = 'Choose an attack or ability from Actions.'

export function actionReferenceInvalidKindMessage(consumer: 'reaction' | 'legendary'): string {
  return consumer === 'reaction'
    ? "This action can't be used by a reaction."
    : "This action can't be used by a legendary action."
}

export const MULTIATTACK_REFERENCE_SELF_MESSAGE = 'A multiattack cannot reference itself.'

export const MULTIATTACK_REFERENCE_DUPLICATE_MESSAGE = 'Each attack can be referenced only once.'

export const MULTIATTACK_REFERENCE_MISSING_MESSAGE = 'Choose an attack from Actions.'

export const MULTIATTACK_REFERENCE_INVALID_KIND_MESSAGE = 'Choose an attack from Actions.'

export const MULTIATTACK_SECTION_MESSAGE = 'Multiattack is only valid in Actions.'

export const LEGENDARY_REFERENCE_ATTACK_CHOICE_MESSAGE = 'Only attacks can be offered as a choice.'

export const CHOOSE_ATTACK_FROM_ACTIONS = 'Choose an attack from Actions.'

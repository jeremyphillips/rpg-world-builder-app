const EXECUTABLE_ATTACK_KINDS = ['weapon', 'natural-weapon', 'attack'] as const

const EXECUTABLE_USE_KINDS = ['save', 'special', 'spell'] as const

const REPLACEMENT_CHOICE_KINDS = [...EXECUTABLE_ATTACK_KINDS, ...EXECUTABLE_USE_KINDS] as const

const PREREQUISITE_KINDS = [
  ...EXECUTABLE_ATTACK_KINDS,
  ...EXECUTABLE_USE_KINDS,
  'leap',
  'teleport',
  'take-actions',
] as const

export type MultiattackEligibilityPurpose =
  | 'executable-attack'
  | 'executable-use'
  | 'replacement-choice'
  | 'prerequisite'

export function multiattackEligibilityKinds(
  purpose: MultiattackEligibilityPurpose,
): readonly string[] {
  switch (purpose) {
    case 'executable-attack':
      return EXECUTABLE_ATTACK_KINDS
    case 'executable-use':
      return EXECUTABLE_USE_KINDS
    case 'replacement-choice':
      return REPLACEMENT_CHOICE_KINDS
    case 'prerequisite':
      return PREREQUISITE_KINDS
    default:
      return []
  }
}

export function multiattackRowEligibleForPurpose(
  row: { kind?: string; id?: string },
  purpose: MultiattackEligibilityPurpose,
  options?: { multiattackId?: string },
): boolean {
  if (!row.kind || !row.id) return false
  if (row.kind === 'multiattack' || row.kind === 'shape-shift') return false
  if (purpose !== 'prerequisite' && (row.kind === 'action-reference' || row.kind === 'parry')) {
    return false
  }
  if (options?.multiattackId && row.id === options.multiattackId) return false
  return multiattackEligibilityKinds(purpose).includes(row.kind)
}

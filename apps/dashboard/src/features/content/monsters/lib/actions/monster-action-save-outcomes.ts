import {
  ensureOutcomeSlotsForMethod,
  findOutcomeByResult,
  normalizeOutcomeOrder,
  RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  stripEmptyOutcomeSlots,
  type ResolutionApplicationAmount,
  type ResolutionOutcomeResult,
} from '@rpg/contracts'

export type MonsterSaveOutcome = {
  result: ResolutionOutcomeResult
  applications: { effectId: string; amount: ResolutionApplicationAmount }[]
  note?: string
}

const SAVING_THROW_METHOD = { kind: 'saving-throw' } as const

function isApplicationAmount(value: unknown): value is ResolutionApplicationAmount {
  return value === 'full' || value === 'half'
}

function isSaveOutcome(value: unknown): value is MonsterSaveOutcome {
  if (!value || typeof value !== 'object') return false
  const outcome = value as MonsterSaveOutcome
  return typeof outcome.result === 'string' && Array.isArray(outcome.applications)
}

export function readMonsterSaveOutcomes(value: unknown): MonsterSaveOutcome[] {
  if (!Array.isArray(value)) return []
  return value.filter(isSaveOutcome)
}

export function monsterSaveDamageEffectId(effects: unknown): string {
  if (!Array.isArray(effects)) return RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID
  const first = effects[0]
  if (
    first &&
    typeof first === 'object' &&
    'id' in first &&
    typeof first.id === 'string' &&
    first.id.length > 0
  ) {
    return first.id
  }
  return RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID
}

function slotSavingThrowOutcomes(outcomes: readonly MonsterSaveOutcome[]): MonsterSaveOutcome[] {
  return ensureOutcomeSlotsForMethod(SAVING_THROW_METHOD, outcomes, (result) => ({
    result,
    applications: [],
  }))
}

export function monsterSaveOutcomeAmount(
  outcomes: readonly MonsterSaveOutcome[],
): ResolutionApplicationAmount | '' {
  const outcome = findOutcomeByResult(outcomes, 'successful-save')
  const amount = outcome?.applications[0]?.amount
  return isApplicationAmount(amount) ? amount : ''
}

export function monsterSaveFailureNote(outcomes: readonly MonsterSaveOutcome[]): string {
  return findOutcomeByResult(outcomes, 'failed-save')?.note ?? ''
}

export function withMonsterSaveOutcomeAmount(
  outcomes: readonly MonsterSaveOutcome[],
  amount: ResolutionApplicationAmount,
  effectId: string,
): MonsterSaveOutcome[] {
  return slotSavingThrowOutcomes(outcomes).map((outcome) =>
    outcome.result === 'successful-save'
      ? { ...outcome, applications: [{ effectId, amount }] }
      : outcome,
  )
}

export function withMonsterSaveFailureNote(
  outcomes: readonly MonsterSaveOutcome[],
  note: string,
): MonsterSaveOutcome[] {
  const trimmed = note.trim()
  return slotSavingThrowOutcomes(outcomes).map((outcome) => {
    if (outcome.result !== 'failed-save') return outcome
    if (!trimmed) {
      const { note: _removed, ...rest } = outcome
      return rest
    }
    return { ...outcome, note: trimmed }
  })
}

/** Drops empty method slots and restores saving-throw order before draft validation. */
export function normalizeMonsterSaveOutcomes(value: unknown): MonsterSaveOutcome[] {
  return stripEmptyOutcomeSlots(
    normalizeOutcomeOrder(SAVING_THROW_METHOD, readMonsterSaveOutcomes(value)),
  )
}

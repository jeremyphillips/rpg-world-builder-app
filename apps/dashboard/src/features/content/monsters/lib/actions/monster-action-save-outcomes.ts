import {
  ensureOutcomeSlotsForMethod,
  findOutcomeByResult,
  hasMeaningfulOutcomeContent,
  hasMeaningfulRepeatSave,
  hasMeaningfulRepeatSaveSecondFailure,
  normalizeOutcomeOrder,
  RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  stripEmptyOutcomeSlots,
  type OrderedEffect,
  type RepeatSave,
  type ResolutionApplicationAmount,
  type ResolutionOutcomeResult,
} from '@rpg/contracts'

export type MonsterSaveOutcome = {
  result: ResolutionOutcomeResult
  applications: { effectId: string; amount: ResolutionApplicationAmount }[]
  note?: string
  effects?: OrderedEffect[]
  repeatSave?: RepeatSave
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

function migrateFailedSaveOutcomeNoteToEffects(outcome: MonsterSaveOutcome): MonsterSaveOutcome {
  if (outcome.result !== 'failed-save') return outcome
  const legacyNote = outcome.note?.trim()
  if (!legacyNote) return outcome
  const { note: _removed, ...rest } = outcome
  const effects = [...(rest.effects ?? [])]
  const alreadyMigrated = effects.some(
    (effect) => effect.kind === 'note' && effect.description.trim() === legacyNote,
  )
  if (!alreadyMigrated) {
    effects.push({ kind: 'note', description: legacyNote })
  }
  return { ...rest, effects }
}

function stripIncompleteRepeatSave(outcome: MonsterSaveOutcome): MonsterSaveOutcome {
  if (!outcome.repeatSave) return outcome
  if (hasMeaningfulRepeatSaveSecondFailure(outcome.repeatSave.secondFailure)) return outcome
  const { repeatSave: _removed, ...rest } = outcome
  return rest
}

/** Drops empty method slots and restores saving-throw order before draft validation. */
export function normalizeMonsterSaveOutcomes(value: unknown): MonsterSaveOutcome[] {
  return stripEmptyOutcomeSlots(
    normalizeOutcomeOrder(SAVING_THROW_METHOD, readMonsterSaveOutcomes(value)),
  )
    .map(migrateFailedSaveOutcomeNoteToEffects)
    .map(stripIncompleteRepeatSave)
}

/** Keeps required failed/success slots in the editor even when normalize would strip empties. */
export function ensureMonsterSaveOutcomeSlots(
  outcomes: readonly MonsterSaveOutcome[],
): MonsterSaveOutcome[] {
  return slotSavingThrowOutcomes(outcomes)
}

export function monsterSaveFailedOutcomeIndex(
  outcomes: readonly MonsterSaveOutcome[],
): number | undefined {
  const index = ensureMonsterSaveOutcomeSlots(outcomes).findIndex(
    (outcome) => outcome.result === 'failed-save',
  )
  return index >= 0 ? index : undefined
}

export function monsterSaveSuccessfulOutcomeIndex(
  outcomes: readonly MonsterSaveOutcome[],
): number | undefined {
  const index = ensureMonsterSaveOutcomeSlots(outcomes).findIndex(
    (outcome) => outcome.result === 'successful-save',
  )
  return index >= 0 ? index : undefined
}

export function monsterSaveFailureOrSuccessOutcomeIndex(
  outcomes: readonly MonsterSaveOutcome[],
): number | undefined {
  const index = readMonsterSaveOutcomes(outcomes).findIndex(
    (outcome) => outcome.result === 'failed-or-successful-save',
  )
  return index >= 0 ? index : undefined
}

export function precedingConditionIdsFromEffects(effects: unknown): string[] {
  if (!Array.isArray(effects)) return []
  const ids = new Set<string>()
  for (const entry of effects) {
    if (
      entry &&
      typeof entry === 'object' &&
      (entry as OrderedEffect).kind === 'condition' &&
      typeof (entry as OrderedEffect & { conditionId?: string }).conditionId === 'string'
    ) {
      ids.add((entry as OrderedEffect & { conditionId: string }).conditionId)
    }
  }
  return [...ids]
}

export function firstFailureOrderedEffectsIncludeConditionOrNote(effects: unknown): boolean {
  if (!Array.isArray(effects)) return false
  return effects.some(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      ((entry as OrderedEffect).kind === 'condition' || (entry as OrderedEffect).kind === 'note'),
  )
}

export function shouldShowSaveRepeatSaveAuthoring(
  failedEffects: unknown,
  repeatSave: unknown,
): boolean {
  if (hasMeaningfulRepeatSave(repeatSave as RepeatSave | undefined)) return true
  return firstFailureOrderedEffectsIncludeConditionOrNote(failedEffects)
}

export function resolutionEnvelopeHasDamageEffect(effects: unknown): boolean {
  if (!Array.isArray(effects)) return false
  return effects.some(
    (effect) =>
      effect && typeof effect === 'object' && (effect as { kind?: string }).kind === 'damage',
  )
}

export function monsterSaveFailureOrSuccessNote(outcomes: readonly MonsterSaveOutcome[]): string {
  return findOutcomeByResult(outcomes, 'failed-or-successful-save')?.note ?? ''
}

export function withMonsterSaveFailureOrSuccessOutcome(
  outcomes: readonly MonsterSaveOutcome[],
  note: string,
): MonsterSaveOutcome[] {
  const trimmed = note.trim()
  const slotted = slotSavingThrowOutcomes(outcomes)
  const existing = findOutcomeByResult(slotted, 'failed-or-successful-save')
  if (!trimmed) {
    return slotted.filter((outcome) => outcome.result !== 'failed-or-successful-save')
  }
  const next: MonsterSaveOutcome = {
    result: 'failed-or-successful-save',
    applications: [],
    ...(existing?.effects ? { effects: [...existing.effects] } : {}),
    note: trimmed,
  }
  const without = slotted.filter((outcome) => outcome.result !== 'failed-or-successful-save')
  return [...without, next]
}

export function withMonsterSaveRepeatSave(
  outcomes: readonly MonsterSaveOutcome[],
  repeatSave: RepeatSave | undefined,
): MonsterSaveOutcome[] {
  return slotSavingThrowOutcomes(outcomes).map((outcome) => {
    if (outcome.result !== 'failed-save') return outcome
    if (!repeatSave) {
      const { repeatSave: _removed, ...rest } = outcome
      return rest
    }
    return { ...outcome, repeatSave }
  })
}

export const DEFAULT_REPEAT_SAVE_TIMING: RepeatSave['timing'] = {
  participant: 'target',
  boundary: 'end',
  which: 'next',
}

export function defaultRepeatSaveShell(): RepeatSave {
  return {
    timing: DEFAULT_REPEAT_SAVE_TIMING,
    successOnRepeatEndsEffect: true,
    secondFailure: {},
  }
}

export function repeatSaveRemovalNeedsConfirm(repeatSave: RepeatSave | undefined): boolean {
  if (!repeatSave) return false
  return hasMeaningfulRepeatSaveSecondFailure(repeatSave.secondFailure)
}

export function failureOrSuccessRemovalNeedsConfirm(
  outcomes: readonly MonsterSaveOutcome[],
): boolean {
  const outcome = findOutcomeByResult(outcomes, 'failed-or-successful-save')
  if (!outcome) return false
  return hasMeaningfulOutcomeContent(outcome)
}

import {
  ensureOutcomeSlotsForMethod,
  findOutcomeByResult,
  getOutcomeResultsForMethod,
  hasMeaningfulOutcomeContent,
  hasMeaningfulRepeatSaveSecondFailure,
  normalizeOutcomeOrder,
  stripEmptyOutcomeSlots,
  type OrderedEffect,
  type RepeatSave,
  type ResolutionApplicationAmount,
  type ResolutionEffectId,
  type ResolutionOutcomeResult,
} from '@rpg/contracts'

export type MonsterSaveEffectReference = {
  kind: 'effect-reference'
  effectId: ResolutionEffectId
  amount: ResolutionApplicationAmount
}

export type MonsterSaveOutcome = {
  result: ResolutionOutcomeResult
  effects?: Array<MonsterSaveEffectReference | OrderedEffect>
  repeatSave?: RepeatSave
}

const SAVING_THROW_METHOD = { kind: 'saving-throw' } as const

const SAVING_THROW_RESULTS = getOutcomeResultsForMethod(SAVING_THROW_METHOD)

/** Stable only because `ensureOutcomeSlotsForMethod` rebuilds this order. */
export const MONSTER_SAVE_FAILED_OUTCOME_INDEX = SAVING_THROW_RESULTS.indexOf('failed-save')
export const MONSTER_SAVE_SUCCESS_OUTCOME_INDEX = SAVING_THROW_RESULTS.indexOf('successful-save')

export function monsterSaveOutcomeEffectsPath(outcomeIndex: number): string {
  return `resolution.outcomes.${outcomeIndex}.effects`
}

export const MONSTER_SAVE_FAILED_EFFECTS_PATH = monsterSaveOutcomeEffectsPath(
  MONSTER_SAVE_FAILED_OUTCOME_INDEX,
)
export const MONSTER_SAVE_SUCCESS_EFFECTS_PATH = monsterSaveOutcomeEffectsPath(
  MONSTER_SAVE_SUCCESS_OUTCOME_INDEX,
)
export const MONSTER_SAVE_REPEAT_PATH = `resolution.outcomes.${MONSTER_SAVE_FAILED_OUTCOME_INDEX}.repeatSave`
export const MONSTER_SAVE_SECOND_FAILURE_EFFECTS_PATH = `${MONSTER_SAVE_REPEAT_PATH}.secondFailure.effects`

export function saveOutcomesPath(namePrefix: string): string {
  return `${namePrefix}.resolution.outcomes`
}

export function saveWatchPath(namePrefix: string, suffix: string): string {
  return namePrefix ? `${namePrefix}.${suffix}` : suffix
}

function isSaveOutcome(value: unknown): value is MonsterSaveOutcome {
  if (!value || typeof value !== 'object') return false
  return typeof (value as MonsterSaveOutcome).result === 'string'
}

export function readMonsterSaveOutcomes(value: unknown): MonsterSaveOutcome[] {
  if (!Array.isArray(value)) return []
  return value.filter(isSaveOutcome)
}

function slotSavingThrowOutcomes(outcomes: readonly MonsterSaveOutcome[]): MonsterSaveOutcome[] {
  return ensureOutcomeSlotsForMethod(SAVING_THROW_METHOD, outcomes, (result) => ({
    result,
    effects: [],
  }))
}

type LibraryEffect = { id?: string; kind?: string; damageType?: string }

export function readResolutionEffects(effects: unknown): LibraryEffect[] {
  if (!Array.isArray(effects)) return []
  return effects.filter(
    (effect): effect is LibraryEffect => Boolean(effect) && typeof effect === 'object',
  )
}

function orderedEffectsIncludeKind(effects: unknown, kind: string): boolean {
  if (!Array.isArray(effects)) return false
  return effects.some(
    (entry) => entry && typeof entry === 'object' && (entry as { kind?: string }).kind === kind,
  )
}

/** Drops empty method slots and restores saving-throw order. Keeps dangling references. */
export function normalizeMonsterSaveOutcomes(value: unknown): MonsterSaveOutcome[] {
  return stripEmptyOutcomeSlots(
    normalizeOutcomeOrder(SAVING_THROW_METHOD, readMonsterSaveOutcomes(value)),
  )
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

export function firstFailureOrderedEffectsIncludeCondition(effects: unknown): boolean {
  return orderedEffectsIncludeKind(effects, 'condition')
}

/** An author-opened shell has timing. A mounted `{}` does not. */
export function repeatSaveShellIsOpen(repeatSave: unknown): boolean {
  if (!repeatSave || typeof repeatSave !== 'object') return false
  const timing = (repeatSave as RepeatSave).timing
  if (!timing || typeof timing !== 'object') return false
  return (
    typeof timing.participant === 'string' &&
    typeof timing.boundary === 'string' &&
    typeof timing.which === 'string'
  )
}

export function shouldShowSaveRepeatSaveAuthoring(
  failedEffects: unknown,
  repeatSave: unknown,
): boolean {
  if (repeatSaveShellIsOpen(repeatSave)) return true
  return firstFailureOrderedEffectsIncludeCondition(failedEffects)
}

function failureOrSuccessNote(outcome: MonsterSaveOutcome | undefined): string {
  const note = outcome?.effects?.find((effect) => effect.kind === 'note')
  return note && note.kind === 'note' ? note.description : ''
}

export function monsterSaveFailureOrSuccessNote(outcomes: readonly MonsterSaveOutcome[]): string {
  return failureOrSuccessNote(findOutcomeByResult(outcomes, 'failed-or-successful-save'))
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
  const rest = (existing?.effects ?? []).filter((effect) => effect.kind !== 'note')
  const next: MonsterSaveOutcome = {
    result: 'failed-or-successful-save',
    effects: [...rest, { kind: 'note', description: trimmed }],
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
  if (repeatSave.eligibilityNote?.trim()) return true
  return hasMeaningfulRepeatSaveSecondFailure(repeatSave.secondFailure)
}

export function failureOrSuccessRemovalNeedsConfirm(
  outcomes: readonly MonsterSaveOutcome[],
): boolean {
  const outcome = findOutcomeByResult(outcomes, 'failed-or-successful-save')
  if (!outcome) return false
  return hasMeaningfulOutcomeContent(outcome)
}

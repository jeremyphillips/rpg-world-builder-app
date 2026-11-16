import type { Ability } from '../../../vocab/ability'
import type { SpellResolutionAttackType } from '../../spell/resolution/vocab'
import {
  ensureOutcomeSlotsForMethod,
  getOutcomeResultsForMethod,
  hasMeaningfulOutcomeContent,
  type OutcomeLike,
} from './outcome-slots'
import { mapOutcomeResultBetweenMethodKinds } from './outcome-method-map'
import type { ResolutionOutcomeResult } from '../../../vocab/resolution'
import { applyMethodOptionPatch, stateAfterPatch, toMethodOption } from './selection-availability'
import type {
  ResolutionMethodOption,
  ResolutionOutcomeRef,
  ResolutionSelectionState,
} from './selection-types'

export type OutcomeMethodChangePlan = {
  /** Outcome branches with authored content that would be discarded */
  discardedBranches: readonly ResolutionOutcomeResult[]
  /** Next form outcomes after mapping, including empty method-derived slots */
  mappedOutcomes: ResolutionOutcomeRef[]
}

type OutcomePlanResolutionMethod =
  | { kind: 'automatic' }
  | { kind: 'saving-throw'; ability: Ability }
  | { kind: 'attack'; attackType: SpellResolutionAttackType }

function methodOptionToMethod(
  state: ResolutionSelectionState,
  option: ResolutionMethodOption,
): OutcomePlanResolutionMethod {
  if (option === 'automatic') return { kind: 'automatic' }
  if (option === 'saving-throw') {
    return { kind: 'saving-throw', ability: (state.saveAbility ?? 'con') as Ability }
  }
  return { kind: 'attack', attackType: option }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function copyOutcome<T extends OutcomeLike>(outcome: T): ResolutionOutcomeRef {
  return {
    result: outcome.result,
    ...(outcome.effects?.length
      ? { effects: cloneJson(outcome.effects) as ResolutionOutcomeRef['effects'] }
      : { effects: [] }),
    ...(outcome.repeatSave ? { repeatSave: cloneJson(outcome.repeatSave) } : {}),
  }
}

function emptyOutcome(result: ResolutionOutcomeResult): ResolutionOutcomeRef {
  return { result, effects: [] }
}

function withoutEffectReference<T extends { kind: string; effectId?: string }>(
  effects: readonly T[] | undefined,
  effectId: string,
): T[] | undefined {
  if (!effects) return effects
  return effects.filter(
    (effect) => effect.kind !== 'effect-reference' || effect.effectId !== effectId,
  )
}

function mapOutcomeBetweenMethods(
  source: ResolutionOutcomeRef,
  fromMethod: OutcomePlanResolutionMethod,
  toMethod: OutcomePlanResolutionMethod,
): ResolutionOutcomeRef | undefined {
  if (!hasMeaningfulOutcomeContent(source)) return undefined

  const remappedResult = mapOutcomeResultBetweenMethodKinds(fromMethod, toMethod, source.result)
  if (remappedResult) {
    return { ...source, result: remappedResult }
  }

  const allowed = new Set(getOutcomeResultsForMethod(toMethod))
  if (allowed.has(source.result)) {
    return source
  }

  return undefined
}

/** Plans outcome remapping and identifies branches that would lose authored content. */
export function planOutcomeMethodChange(
  before: ResolutionSelectionState,
  nextOption: ResolutionMethodOption,
): OutcomeMethodChangePlan {
  const currentOption = toMethodOption(before)
  const fromMethod = currentOption ? methodOptionToMethod(before, currentOption) : undefined
  const toMethod = methodOptionToMethod(
    stateAfterPatch(before, applyMethodOptionPatch(before, nextOption)),
    nextOption,
  )

  const currentOutcomes = before.outcomes ?? []
  const discardedBranches: ResolutionOutcomeResult[] = []
  const mappedByResult = new Map<ResolutionOutcomeResult, ResolutionOutcomeRef>()

  if (fromMethod) {
    for (const outcome of currentOutcomes) {
      if (!hasMeaningfulOutcomeContent(outcome)) continue

      const mapped = mapOutcomeBetweenMethods(copyOutcome(outcome), fromMethod, toMethod)
      if (!mapped) {
        discardedBranches.push(outcome.result)
        continue
      }

      const existing = mappedByResult.get(mapped.result)
      if (existing && hasMeaningfulOutcomeContent(existing)) {
        discardedBranches.push(outcome.result)
        continue
      }

      mappedByResult.set(mapped.result, mapped)
    }
  }

  const mappedOutcomes = ensureOutcomeSlotsForMethod(
    toMethod,
    [...mappedByResult.values()],
    emptyOutcome,
  )

  return { discardedBranches, mappedOutcomes }
}

function listReferencesEffect(
  effects: readonly { kind: string; effectId?: string }[] | undefined,
  effectId: string,
): boolean {
  return Boolean(
    effects?.some((effect) => effect.kind === 'effect-reference' && effect.effectId === effectId),
  )
}

export function outcomeReferencesEffect(
  outcomes: readonly ResolutionOutcomeRef[] | undefined,
  effectId: string,
): boolean {
  if (!outcomes?.length) return false

  return outcomes.some(
    (outcome) =>
      listReferencesEffect(outcome.effects, effectId) ||
      listReferencesEffect(outcome.repeatSave?.secondFailure.effects, effectId),
  )
}

export function stripEffectFromOutcomes(
  outcomes: readonly ResolutionOutcomeRef[],
  effectId: string,
): ResolutionOutcomeRef[] {
  return outcomes.map((outcome) => ({
    ...outcome,
    effects: withoutEffectReference(outcome.effects, effectId),
    ...(outcome.repeatSave
      ? {
          repeatSave: {
            ...outcome.repeatSave,
            secondFailure: {
              ...outcome.repeatSave.secondFailure,
              effects: withoutEffectReference(outcome.repeatSave.secondFailure.effects, effectId),
            },
          },
        }
      : {}),
  }))
}

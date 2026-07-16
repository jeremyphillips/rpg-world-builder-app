import type { Ability } from '../../../vocab/ability'
import type { SpellResolutionMethod } from './schema'
import {
  ensureOutcomeSlotsForMethod,
  getOutcomeResultsForMethod,
  hasMeaningfulOutcomeContent,
  type OutcomeLike,
} from './outcome-slots'
import { mapOutcomeResultBetweenMethodKinds } from './outcome-method-map'
import type { SpellResolutionOutcomeResult } from './vocab'
import { applyMethodOptionPatch, stateAfterPatch, toMethodOption } from './selection-availability'
import type {
  ResolutionMethodOption,
  ResolutionOutcomeRef,
  ResolutionSelectionState,
} from './selection-types'

export type OutcomeMethodChangePlan = {
  /** Outcome branches with authored content that would be discarded */
  discardedBranches: readonly SpellResolutionOutcomeResult[]
  /** Next form outcomes after mapping, including empty method-derived slots */
  mappedOutcomes: ResolutionOutcomeRef[]
}

function methodOptionToMethod(
  state: ResolutionSelectionState,
  option: ResolutionMethodOption,
): SpellResolutionMethod {
  if (option === 'automatic') return { kind: 'automatic' }
  if (option === 'saving-throw') {
    return { kind: 'saving-throw', ability: (state.saveAbility ?? 'con') as Ability }
  }
  return { kind: 'attack', attackType: option }
}

function copyOutcome<T extends OutcomeLike>(outcome: T): ResolutionOutcomeRef {
  return {
    result: outcome.result,
    applications: outcome.applications.map((application) => {
      const entry = application as { effectId: string; amount: string }
      return { effectId: entry.effectId, amount: entry.amount }
    }),
    ...(outcome.note?.trim() ? { note: outcome.note.trim() } : {}),
  }
}

function emptyOutcome(result: SpellResolutionOutcomeResult): ResolutionOutcomeRef {
  return { result, applications: [] }
}

function mapOutcomeBetweenMethods(
  source: ResolutionOutcomeRef,
  fromMethod: SpellResolutionMethod,
  toMethod: SpellResolutionMethod,
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
  const discardedBranches: SpellResolutionOutcomeResult[] = []
  const mappedByResult = new Map<SpellResolutionOutcomeResult, ResolutionOutcomeRef>()

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

export function outcomeApplicationsReferenceEffect(
  outcomes: readonly ResolutionOutcomeRef[] | undefined,
  effectId: string,
): boolean {
  if (!outcomes?.length) return false

  return outcomes.some((outcome) =>
    outcome.applications.some((application) => application.effectId === effectId),
  )
}

export function stripEffectFromOutcomes(
  outcomes: readonly ResolutionOutcomeRef[],
  effectId: string,
): ResolutionOutcomeRef[] {
  return outcomes.map((outcome) => ({
    ...outcome,
    applications: outcome.applications.filter((application) => application.effectId !== effectId),
  }))
}

import {
  getSpellAtomicEffectKindLabel,
  type SpellResolutionApplicationAmount,
  type SpellResolutionOutcomeResult,
} from '@rpg/contracts'
import type { ButtonDropdownItem } from '@rpg/ui'

import {
  formatResolutionEffectCompletenessMessage,
  getResolutionEffectCompleteness,
  defaultApplicationAmountForOutcome,
} from './resolution-effect-validity.lib'
import { RESOLUTION_SECTION_LABELS } from './resolution-form-labels'
import { readOutcomeApplications } from './resolution-outcome-applications.lib'
import { formatResolutionOutcomeEffectMenuLabel } from './resolution-outcome-display.lib'
import type { ResolutionEffectFormItem, ResolutionOutcomeFormItem } from './resolution-form-schema'

function appliedEffectIdsForOutcome(
  outcome: Pick<ResolutionOutcomeFormItem, 'applications'>,
): Set<string> {
  return new Set(
    readOutcomeApplications(outcome.applications).map((application) => application.effectId),
  )
}

export type OutcomeEffectUnsupportedReason = string

export type OutcomeEffectAvailability =
  | { status: 'eligible'; defaultAmount: SpellResolutionApplicationAmount }
  | {
      status: 'incomplete'
      reason: Extract<ReturnType<typeof getResolutionEffectCompleteness>, { complete: false }>
    }
  | { status: 'unsupported'; reason: OutcomeEffectUnsupportedReason }
  | { status: 'already-applied' }

export type OutcomeApplicationAddState =
  | { kind: 'no-authored-effects' }
  | { kind: 'all-incomplete'; unavailable: ButtonDropdownItem[] }
  | { kind: 'all-applied' }
  | {
      kind: 'ready'
      eligible: ButtonDropdownItem[]
      unavailable: ButtonDropdownItem[]
    }

export function getOutcomeEffectAvailability(
  effect: ResolutionEffectFormItem,
  context: {
    outcomeResult: SpellResolutionOutcomeResult
    appliedEffectIds: Set<string>
  },
): OutcomeEffectAvailability {
  if (context.appliedEffectIds.has(effect.id)) {
    return { status: 'already-applied' }
  }

  const completeness = getResolutionEffectCompleteness(effect)
  if (!completeness.complete) {
    return { status: 'incomplete', reason: completeness }
  }

  return {
    status: 'eligible',
    defaultAmount: defaultApplicationAmountForOutcome(effect, context.outcomeResult),
  }
}

function toUnavailableMenuItem(
  effect: ResolutionEffectFormItem,
  availability: Extract<OutcomeEffectAvailability, { status: 'incomplete' }>,
): ButtonDropdownItem {
  return {
    id: effect.id,
    label: getSpellAtomicEffectKindLabel(effect.kind),
    description: formatResolutionEffectCompletenessMessage(effect, availability.reason),
    groupId: 'unavailable',
    disabled: true,
  }
}

function toEligibleMenuItem(effect: ResolutionEffectFormItem): ButtonDropdownItem {
  return {
    id: effect.id,
    label: formatResolutionOutcomeEffectMenuLabel(effect),
    groupId: 'available',
  }
}

export function resolveOutcomeApplicationAddState(
  effects: readonly ResolutionEffectFormItem[],
  outcome: Pick<ResolutionOutcomeFormItem, 'applications'>,
  outcomeResult: SpellResolutionOutcomeResult,
): OutcomeApplicationAddState {
  if (effects.length === 0) {
    return { kind: 'no-authored-effects' }
  }

  const appliedEffectIds = appliedEffectIdsForOutcome(outcome)
  const eligible: ButtonDropdownItem[] = []
  const unavailable: ButtonDropdownItem[] = []

  for (const effect of effects) {
    const availability = getOutcomeEffectAvailability(effect, { outcomeResult, appliedEffectIds })

    switch (availability.status) {
      case 'eligible':
        eligible.push(toEligibleMenuItem(effect))
        break
      case 'incomplete':
        unavailable.push(toUnavailableMenuItem(effect, availability))
        break
      case 'already-applied':
      case 'unsupported':
        break
      default: {
        const _exhaustive: never = availability
        return _exhaustive
      }
    }
  }

  if (eligible.length === 0 && unavailable.length === 0) {
    return { kind: 'all-applied' }
  }

  if (eligible.length === 0) {
    return { kind: 'all-incomplete', unavailable }
  }

  return { kind: 'ready', eligible, unavailable }
}

export const OUTCOME_APPLICATION_MENU_GROUPS = [
  { id: 'available', label: RESOLUTION_SECTION_LABELS.outcomeAvailableGroup },
  { id: 'unavailable', label: RESOLUTION_SECTION_LABELS.outcomeUnavailableGroup },
] as const

import { cn } from '@rpg/ui'

import type { OutcomeApplicationAddState } from './resolution-outcome-effect-availability.lib'

export type OutcomeApplicationSectionChrome = {
  showPrimaryEmptySummary: boolean
  supportingCopyVisible: boolean
  showAddTrigger: boolean
  hintContainerClassName: string
  addTriggerWrapperClassName: string | undefined
}

export function resolveOutcomeApplicationSectionChrome(
  applicationsLength: number,
  addState: OutcomeApplicationAddState,
): OutcomeApplicationSectionChrome {
  const showPrimaryEmptySummary = outcomeApplicationShowPrimaryEmptySummary(
    applicationsLength,
    addState,
  )

  return {
    showPrimaryEmptySummary,
    supportingCopyVisible: addState.kind !== 'ready',
    showAddTrigger: addState.kind !== 'no-authored-effects' && addState.kind !== 'all-applied',
    hintContainerClassName: outcomeApplicationHintContainerClassName(
      addState,
      showPrimaryEmptySummary,
    ),
    addTriggerWrapperClassName:
      outcomeApplicationAddTriggerWrapperClassName(showPrimaryEmptySummary),
  }
}

export function outcomeApplicationShowPrimaryEmptySummary(
  applicationsLength: number,
  addState: OutcomeApplicationAddState,
): boolean {
  return (
    applicationsLength === 0 && (addState.kind === 'all-incomplete' || addState.kind === 'ready')
  )
}

export function outcomeApplicationHintContainerClassName(
  addState: OutcomeApplicationAddState,
  showPrimaryEmptySummary: boolean,
): string {
  return cn(
    'space-y-1',
    addState.kind === 'all-applied' ? undefined : showPrimaryEmptySummary ? undefined : 'mt-2',
    addState.kind === 'no-authored-effects' && 'mb-2',
  )
}

export function outcomeApplicationAddTriggerWrapperClassName(
  showPrimaryEmptySummary: boolean,
): string | undefined {
  return showPrimaryEmptySummary ? undefined : 'mt-2'
}

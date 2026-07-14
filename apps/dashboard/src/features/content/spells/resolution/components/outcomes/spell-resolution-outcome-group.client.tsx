'use client'

import { SpellResolutionOutcomeCollapsedMiss } from './spell-resolution-outcome-collapsed-miss.client'
import { SpellResolutionOutcomeGroupBody } from './spell-resolution-outcome-group-body.client'
import type { SpellResolutionOutcomeGroupProps } from './spell-resolution-outcome-group.types'
import { useSpellResolutionOutcomeGroup } from './use-spell-resolution-outcome-group.client'

export type { SpellResolutionOutcomeGroupProps } from './spell-resolution-outcome-group.types'

/** One method-derived outcome branch with applications, add menu, and optional note. */
export function SpellResolutionOutcomeGroup(props: SpellResolutionOutcomeGroupProps) {
  const state = useSpellResolutionOutcomeGroup(props)
  if (!state) return null

  if (state.collapsedMiss) {
    return (
      <SpellResolutionOutcomeCollapsedMiss
        headingId={state.headingId}
        result={state.result}
        onExpand={state.onExpandMiss}
      />
    )
  }

  return <SpellResolutionOutcomeGroupBody {...state} />
}

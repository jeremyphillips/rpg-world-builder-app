'use client'

import { getSpellResolutionOutcomeAuthoringLabel } from '@rpg/contracts'
import { Button, Heading, Text } from '@rpg/ui'

import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'

export type SpellResolutionOutcomeCollapsedMissProps = {
  headingId: string
  result: Parameters<typeof getSpellResolutionOutcomeAuthoringLabel>[0]
  onExpand: () => void
}

/** Collapsed placeholder for an empty miss outcome branch. */
export function SpellResolutionOutcomeCollapsedMiss({
  headingId,
  result,
  onExpand,
}: SpellResolutionOutcomeCollapsedMissProps) {
  return (
    <section aria-labelledby={headingId} className="space-y-2 rounded-md border border-border p-3">
      <Heading variant="group" as="h3" id={headingId}>
        {getSpellResolutionOutcomeAuthoringLabel(result)}
      </Heading>
      <Text variant="muted" className="text-sm">
        {RESOLUTION_SECTION_LABELS.outcomeEmptySummary}
      </Text>
      <Button type="button" variant="outline" size="sm" onClick={onExpand}>
        {RESOLUTION_SECTION_LABELS.configureMissOutcome}
      </Button>
    </section>
  )
}

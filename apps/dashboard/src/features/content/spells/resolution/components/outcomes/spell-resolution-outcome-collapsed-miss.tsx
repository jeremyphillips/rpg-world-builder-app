import { getSpellResolutionOutcomeAuthoringLabel } from '@rpg/contracts'
import { Button, Card, CardContent, Heading, Text } from '@rpg/ui'

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
    <Card tone="subtle" density="compact" aria-labelledby={headingId}>
      <CardContent className="flex flex-col gap-2">
        <Heading variant="group" as="h3" id={headingId}>
          {getSpellResolutionOutcomeAuthoringLabel(result)}
        </Heading>
        <Text variant="muted" className="text-sm">
          {RESOLUTION_SECTION_LABELS.outcomeEmptySummary}
        </Text>
        <Button type="button" variant="outline" size="sm" onClick={onExpand}>
          {RESOLUTION_SECTION_LABELS.configureMissOutcome}
        </Button>
      </CardContent>
    </Card>
  )
}

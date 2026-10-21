import { getSpellResolutionOutcomeAuthoringLabel } from '@rpg/contracts'
import {
  Button,
  Heading,
  InsetPanel,
  Text,
  emptyStateWellSupportingClasses,
  emptyStateWellTitleClasses,
} from '@rpg/ui'

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
    <InsetPanel size="md" className="flex flex-col gap-2" aria-labelledby={headingId}>
      <Heading variant="group" as="h3" id={headingId} className={emptyStateWellTitleClasses}>
        {getSpellResolutionOutcomeAuthoringLabel(result)}
      </Heading>
      <Text as="p" className={emptyStateWellSupportingClasses}>
        {RESOLUTION_SECTION_LABELS.outcomeEmptySummary}
      </Text>
      <Button type="button" variant="outline" size="sm" onClick={onExpand}>
        {RESOLUTION_SECTION_LABELS.configureMissOutcome}
      </Button>
    </InsetPanel>
  )
}

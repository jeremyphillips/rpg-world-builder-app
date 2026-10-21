import { getSpellResolutionOutcomeAuthoringLabel } from '@rpg/contracts'
import { Card, CardContent, Heading } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'

import { outcomeBranchBodyFields } from '../../lib/form/resolution-outcome-form-fields'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'

export type SpellResolutionOutcomeGroupBodyProps = {
  headingId: string
  result: Parameters<typeof getSpellResolutionOutcomeAuthoringLabel>[0]
  outcomeIndex: number
}

/** Expanded outcome editor with applications, add menu, and note. */
export function SpellResolutionOutcomeGroupBody({
  headingId,
  result,
  outcomeIndex,
}: SpellResolutionOutcomeGroupBodyProps) {
  return (
    <Card tone="subtle" density="compact" aria-labelledby={headingId}>
      <CardContent className="flex flex-col gap-3">
        <Heading variant="group" as="h3" id={headingId}>
          {getSpellResolutionOutcomeAuthoringLabel(result)}
        </Heading>

        <FormItems
          items={outcomeBranchBodyFields(outcomeIndex, true)}
          idPrefix={`resolution-outcome-${outcomeIndex}`}
          namePrefix={`${RESOLUTION_FIELD_NAME}.outcomes.${outcomeIndex}`}
        />
      </CardContent>
    </Card>
  )
}

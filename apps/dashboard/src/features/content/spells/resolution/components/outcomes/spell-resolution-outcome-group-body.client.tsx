'use client'

import { getSpellResolutionOutcomeAuthoringLabel } from '@rpg/contracts'
import { Heading } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'
import { useWatch } from 'react-hook-form'

import { outcomeBranchBodyFields } from '../../lib/form/resolution-outcome-form-fields'
import { readOutcomeApplications } from '../../lib/form/resolution-outcome-applications.lib'
import type { ResolutionOutcomeFormItem } from '../../lib/form/resolution-form-schema'
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
  const outcome = useWatch({
    name: `${RESOLUTION_FIELD_NAME}.outcomes.${outcomeIndex}`,
  }) as ResolutionOutcomeFormItem | undefined
  const applications = readOutcomeApplications(outcome?.applications)

  return (
    <section aria-labelledby={headingId} className="rounded-md border border-border p-3">
      <Heading variant="group" as="h3" id={headingId}>
        {getSpellResolutionOutcomeAuthoringLabel(result)}
      </Heading>

      <FormItems
        items={outcomeBranchBodyFields(outcomeIndex, applications.length > 0)}
        idPrefix={`resolution-outcome-${outcomeIndex}`}
        namePrefix={`${RESOLUTION_FIELD_NAME}.outcomes.${outcomeIndex}`}
      />
    </section>
  )
}

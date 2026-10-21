import { getSpellResolutionOutcomeAuthoringLabel } from '@rpg/contracts'
import { cn, Heading } from '@rpg/ui'
import { FormItems } from '@rpg/ui/form'

import { collectionPanelNestedBodyClasses } from '@/lib/collection-panel/collection-panel-shell.variants'

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
    <div className={cn(collectionPanelNestedBodyClasses, 'gap-3')} aria-labelledby={headingId}>
      {/* TODO(panel): replace this ad hoc shell with shared panel treatment. */}
      <Heading variant="group" as="h3" id={headingId}>
        {getSpellResolutionOutcomeAuthoringLabel(result)}
      </Heading>

      <FormItems
        items={outcomeBranchBodyFields(outcomeIndex, true)}
        idPrefix={`resolution-outcome-${outcomeIndex}`}
        namePrefix={`${RESOLUTION_FIELD_NAME}.outcomes.${outcomeIndex}`}
      />
    </div>
  )
}

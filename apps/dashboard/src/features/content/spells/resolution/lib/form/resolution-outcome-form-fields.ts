import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import { SpellOutcomeApplicationStatus } from '../../components/outcomes/spell-outcome-application-status'

import { embeddedArrayResolverField } from '../../../../lib/forms/validation/tabbed-form-resolver-fields'
import { spellOutcomeEffectsArray } from './spell-outcome-effects-array'
import {
  outcomeApplicationsFieldPath,
  outcomeApplicationsResolverItemFields,
} from './resolution-outcome-applications-form-fields'
import { RESOLUTION_SECTION_LABELS } from './resolution-form-labels'

const MAX_OUTCOME_BRANCHES = 3

export {
  amountOptionsForEffect,
  createOutcomeApplicationAppendValue,
  formatOutcomeApplicationRowLabel,
  outcomeApplicationsFieldPath,
  outcomeApplicationsResolverItemFields,
  outcomeApplicationAmountField,
  outcomeApplicationEffectIdField,
  outcomeApplicationAmountOptions,
} from './resolution-outcome-applications-form-fields'

/** Applications section for one outcome branch body. */
export function outcomeBranchBodyFields(
  outcomeIndex: number,
  _includeApplications: boolean,
): FormItem[] {
  return [
    {
      kind: 'group',
      fields: [
        {
          kind: 'slot',
          name: '_outcomeApplicationStatus',
          render: () => createElement(SpellOutcomeApplicationStatus, { outcomeIndex }),
        },
        spellOutcomeEffectsArray(outcomeIndex),
      ],
    },
  ]
}

/** Resolver-only configs for embedded outcome application arrays on the spell tab. */
export function resolutionOutcomeApplicationsResolverFields(): FormItem[] {
  const itemFields = outcomeApplicationsResolverItemFields()

  return Array.from({ length: MAX_OUTCOME_BRANCHES }, (_, outcomeIndex) =>
    embeddedArrayResolverField(
      outcomeApplicationsFieldPath(outcomeIndex),
      RESOLUTION_SECTION_LABELS.appliedEffects,
      {
        itemFields,
      },
    ),
  )
}

import type { ResolutionOutcomeResult } from '@rpg/contracts'
import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import { SpellResolutionOutcomeApplicationSection } from '../../components/outcomes/spell-resolution-outcome-application-section'

import { embeddedArrayResolverField } from '../../../../lib/forms/validation/tabbed-form-resolver-fields'
import { readOutcomeApplications } from './resolution-outcome-applications.lib'
import {
  formatEffectReferenceTitle,
  resolveEffectReference,
} from './resolution-effect-reference.lib'
import {
  outcomeApplicationsFieldPath,
  outcomeApplicationsResolverItemFields,
} from './resolution-outcome-applications-form-fields'
import { RESOLUTION_SECTION_LABELS } from './resolution-form-labels'
import type { ResolutionEffectFormItem, ResolutionOutcomeFormItem } from './resolution-form-schema'

const MAX_OUTCOME_BRANCHES = 3

export type ResolutionOutcomeEffectMenuItem = {
  id: string
  label: string
  effectId: string
}

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

export function appliedEffectIdsForOutcome(
  outcome: Pick<ResolutionOutcomeFormItem, 'effects'>,
): Set<string> {
  return new Set(
    readOutcomeApplications(outcome.effects).map((application) => application.effectId),
  )
}

/** Effects available to add via the application menu for one outcome branch. */
export function eligibleEffectsForOutcomeApplication(
  effects: readonly ResolutionEffectFormItem[],
  outcome: Pick<ResolutionOutcomeFormItem, 'effects'>,
): ResolutionEffectFormItem[] {
  const applied = appliedEffectIdsForOutcome(outcome)
  return effects.filter((effect) => !applied.has(effect.id))
}

export function buildOutcomeEffectApplicationMenuItems(
  effects: readonly ResolutionEffectFormItem[],
  outcome: Pick<ResolutionOutcomeFormItem, 'effects'>,
): ResolutionOutcomeEffectMenuItem[] {
  return eligibleEffectsForOutcomeApplication(effects, outcome).map((effect) => ({
    id: effect.id,
    effectId: effect.id,
    label: formatEffectReferenceTitle(resolveEffectReference(effect)),
  }))
}

export function findOutcomeIndexByResult(
  outcomes: readonly ResolutionOutcomeFormItem[],
  result: ResolutionOutcomeResult,
): number {
  return outcomes.findIndex((outcome) => outcome.result === result)
}

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
          name: '_outcomeApplicationSection',
          render: () => createElement(SpellResolutionOutcomeApplicationSection, { outcomeIndex }),
        },
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

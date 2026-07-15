import { supportsPartialApplicationForEffectKind } from '@rpg/contracts'
import type { SpellResolutionOutcomeResult } from '@rpg/contracts'
import { createElement } from 'react'
import type { FieldOption, FormItem } from '@rpg/ui/form'

import { SpellResolutionOutcomeApplicationAddControl } from '../../components/outcomes/spell-resolution-outcome-application-add-control.client'
import { SpellResolutionOutcomeApplicationEffectIdField } from '../../components/outcomes/spell-resolution-outcome-application-effect-id.client'

import { embeddedArrayResolverField } from '../../../../lib/forms/tabbed-form-resolver-fields'
import { readOutcomeApplications } from './resolution-outcome-applications.lib'
import {
  findResolutionEffectById,
  formatResolutionOutcomeEffectMenuLabel,
} from './resolution-outcome-display.lib'
import {
  RESOLUTION_FIELD_LABELS,
  RESOLUTION_OUTCOME_AMOUNT_OPTIONS,
  RESOLUTION_SECTION_LABELS,
} from './resolution-form-labels'
import type {
  ResolutionEffectFormItem,
  ResolutionOutcomeApplicationFormItem,
  ResolutionOutcomeFormItem,
} from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

const RESOLUTION_EFFECTS_FIELD = `${RESOLUTION_FIELD_NAME}.effects` as const
const MAX_OUTCOME_BRANCHES = 3

export type ResolutionOutcomeEffectMenuItem = {
  id: string
  label: string
  effectId: string
}

export function appliedEffectIdsForOutcome(
  outcome: Pick<ResolutionOutcomeFormItem, 'applications'>,
): Set<string> {
  return new Set(
    readOutcomeApplications(outcome.applications).map((application) => application.effectId),
  )
}

/** Effects available to add via the application menu for one outcome branch. */
export function eligibleEffectsForOutcomeApplication(
  effects: readonly ResolutionEffectFormItem[],
  outcome: Pick<ResolutionOutcomeFormItem, 'applications'>,
): ResolutionEffectFormItem[] {
  const applied = appliedEffectIdsForOutcome(outcome)
  return effects.filter((effect) => !applied.has(effect.id))
}

export function buildOutcomeEffectApplicationMenuItems(
  effects: readonly ResolutionEffectFormItem[],
  outcome: Pick<ResolutionOutcomeFormItem, 'applications'>,
): ResolutionOutcomeEffectMenuItem[] {
  return eligibleEffectsForOutcomeApplication(effects, outcome).map((effect) => ({
    id: effect.id,
    effectId: effect.id,
    label: formatResolutionOutcomeEffectMenuLabel(effect),
  }))
}

export function formatOutcomeApplicationRowLabel(
  effects: readonly ResolutionEffectFormItem[],
  application: ResolutionOutcomeApplicationFormItem,
): string {
  const effect = findResolutionEffectById(effects, application.effectId)
  if (!effect) return application.effectId
  return formatResolutionOutcomeEffectMenuLabel(effect)
}

export function createOutcomeApplicationAppendValue(
  effectId: string,
): ResolutionOutcomeApplicationFormItem {
  return { effectId, amount: 'full' }
}

export function findOutcomeIndexByResult(
  outcomes: readonly ResolutionOutcomeFormItem[],
  result: SpellResolutionOutcomeResult,
): number {
  return outcomes.findIndex((outcome) => outcome.result === result)
}

export function amountOptionsForEffect(
  effect: ResolutionEffectFormItem | undefined,
): FieldOption[] {
  if (!effect || !supportsPartialApplicationForEffectKind(effect.kind)) {
    return RESOLUTION_OUTCOME_AMOUNT_OPTIONS.filter((option) => option.value === 'full').map(
      (option) => ({ ...option }),
    )
  }

  return RESOLUTION_OUTCOME_AMOUNT_OPTIONS.map((option) => ({ ...option }))
}

export function outcomeApplicationsFieldPath(
  outcomeIndex: number,
): `${typeof RESOLUTION_FIELD_NAME}.outcomes.${number}.applications` {
  return `${RESOLUTION_FIELD_NAME}.outcomes.${outcomeIndex}.applications`
}

function outcomeApplicationAmountOptions({
  arrayItems,
  rowIndex,
  fieldName,
  options,
  watchedValues,
}: {
  arrayItems: unknown[]
  rowIndex: number
  fieldName: string
  options: FieldOption[]
  watchedValues: Record<string, unknown>
}): FieldOption[] {
  if (fieldName !== 'amount') return [...options]

  const row = arrayItems[rowIndex] as ResolutionOutcomeApplicationFormItem
  const effects = (watchedValues[RESOLUTION_EFFECTS_FIELD] as ResolutionEffectFormItem[]) ?? []
  const effect = findResolutionEffectById(effects, row.effectId)
  return amountOptionsForEffect(effect)
}

/** Per-row fields for `resolution.outcomes[n].applications[]`. */
export function outcomeApplicationsArrayItemFields(): FormItem[] {
  return [
    {
      kind: 'slot',
      name: 'effectId',
      render: () => createElement(SpellResolutionOutcomeApplicationEffectIdField),
    },
    {
      type: 'select',
      name: 'amount',
      label: RESOLUTION_FIELD_LABELS.outcomeApplicationAmount,
      options: RESOLUTION_OUTCOME_AMOUNT_OPTIONS.map((option) => ({ ...option })),
      width: 'lg',
    },
  ]
}

/** Embedded array config for one outcome branch's effect applications. */
export function outcomeApplicationsArrayFields(): FormItem[] {
  return [
    {
      kind: 'array',
      name: 'applications',
      legend: RESOLUTION_SECTION_LABELS.appliedEffects,
      hideAddAction: true,
      reorder: false,
      itemVariant: 'detailed',
      itemHeader: {
        srOnly: true,
        fallback: (index) => `Application ${index + 1}`,
        summaryDependsOn: [RESOLUTION_EFFECTS_FIELD],
        summary: (values, _index, watched) =>
          formatOutcomeApplicationRowLabel(
            (watched?.[RESOLUTION_EFFECTS_FIELD] as ResolutionEffectFormItem[] | undefined) ?? [],
            values as ResolutionOutcomeApplicationFormItem,
          ),
      },
      filterSelectDependsOn: [RESOLUTION_EFFECTS_FIELD],
      filterSelectOptions: outcomeApplicationAmountOptions,
      fields: outcomeApplicationsArrayItemFields(),
    },
  ]
}

/** Optional prose for one outcome branch (`resolution.outcomes[n].note`). */
export function outcomeNoteFields(): FormItem[] {
  return [
    {
      type: 'textarea',
      name: 'note',
      label: RESOLUTION_FIELD_LABELS.hitNote,
      rows: 3,
      width: 'full',
      size: 'sm',
    },
  ]
}

/** Applications array (optional), external add slot, and note for one outcome branch body. */
export function outcomeBranchBodyFields(
  outcomeIndex: number,
  includeApplications: boolean,
): FormItem[] {
  return [
    {
      kind: 'group',
      legend: '',
      fields: [
        ...(includeApplications ? outcomeApplicationsArrayFields() : []),
        {
          kind: 'slot',
          name: '_outcomeApplicationAdd',
          render: () =>
            createElement(SpellResolutionOutcomeApplicationAddControl, { outcomeIndex }),
        },
        ...outcomeNoteFields(),
      ],
    },
  ]
}

/** Resolver-only configs for embedded outcome application arrays on the spell tab. */
export function resolutionOutcomeApplicationsResolverFields(): FormItem[] {
  const itemFields = outcomeApplicationsArrayItemFields()

  return Array.from({ length: MAX_OUTCOME_BRANCHES }, (_, outcomeIndex) =>
    embeddedArrayResolverField(
      outcomeApplicationsFieldPath(outcomeIndex),
      RESOLUTION_SECTION_LABELS.appliedEffects,
      itemFields,
    ),
  )
}

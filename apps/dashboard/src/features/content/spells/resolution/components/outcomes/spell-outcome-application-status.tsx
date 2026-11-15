import { Text } from '@rpg/ui'
import { useFormContext, useWatch } from 'react-hook-form'

import { resolveOutcomeApplicationSectionChrome } from '../../lib/form/resolution-outcome-application-section.lib'
import { resolveOutcomeApplicationAddState } from '../../lib/form/resolution-outcome-effect-availability.lib'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import type {
  ResolutionFormValues,
  ResolutionOutcomeFormItem,
} from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'
import { resolutionFormToSelectionContext } from '../../lib/selection/resolution-selection-context.lib'
import { SpellResolutionOutcomeApplicationSupportingCopy } from './spell-resolution-outcome-application-supporting-copy'

function outcomeApplicationStatus(
  resolution: ResolutionFormValues | undefined,
  outcomeIndex: number,
) {
  const outcome = resolution?.outcomes?.[outcomeIndex]
  const effects = resolution?.effects ?? []
  return {
    addState: resolveOutcomeApplicationAddState(
      effects,
      { effects: (outcome?.effects ?? []) as ResolutionOutcomeFormItem['effects'] },
      outcome?.result ?? 'hit',
      resolutionFormToSelectionContext(resolution),
    ),
    effectCount: outcome?.effects?.length ?? 0,
  }
}

/** Empty-state and availability copy beside the shared outcome effect array. */
export function SpellOutcomeApplicationStatus({ outcomeIndex }: { outcomeIndex: number }) {
  const { getValues } = useFormContext()
  const watched = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const resolution =
    watched ?? (getValues(RESOLUTION_FIELD_NAME) as ResolutionFormValues | undefined)
  const { addState, effectCount } = outcomeApplicationStatus(resolution, outcomeIndex)
  const chrome = resolveOutcomeApplicationSectionChrome(effectCount, addState)

  return (
    <>
      {chrome.showPrimaryEmptySummary ? (
        <Text variant="supporting">{RESOLUTION_SECTION_LABELS.outcomeEmptySummary}</Text>
      ) : null}
      {chrome.supportingCopyVisible ? (
        <SpellResolutionOutcomeApplicationSupportingCopy addState={addState} />
      ) : null}
    </>
  )
}

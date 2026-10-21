import { Text } from '@rpg/ui'

import type { OutcomeApplicationAddState } from '../../lib/form/resolution-outcome-effect-availability.lib'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'

export function SpellResolutionOutcomeApplicationSupportingCopy({
  addState,
}: {
  addState: OutcomeApplicationAddState
}) {
  switch (addState.kind) {
    case 'no-authored-effects':
      return (
        <>
          <Text variant="supporting">
            {RESOLUTION_SECTION_LABELS.outcomeNoAuthoredEffectsAvailable}
          </Text>
          <Text variant="supporting">{RESOLUTION_SECTION_LABELS.outcomeAuthorEffectsHint}</Text>
        </>
      )
    case 'all-incomplete':
      return (
        <>
          <Text variant="supporting">
            {RESOLUTION_SECTION_LABELS.outcomeNoCompleteEffectsAvailable}
          </Text>
          <Text variant="supporting">{RESOLUTION_SECTION_LABELS.outcomeCompleteEffectsHint}</Text>
        </>
      )
    case 'all-applied':
      return (
        <Text variant="supporting" className="my-2">
          {RESOLUTION_SECTION_LABELS.outcomeAllEffectsApplied}
        </Text>
      )
    default:
      return null
  }
}

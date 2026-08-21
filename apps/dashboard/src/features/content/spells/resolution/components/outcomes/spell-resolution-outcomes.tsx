import {
  hasMeaningfulOutcomeContent,
  isOutcomeEmpty,
  SPELL_RESOLUTION_CONVENTIONAL_PRIMARY_OUTCOME,
  type SpellResolutionOutcomeResult,
} from '@rpg/contracts'
import { Alert, Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import { getOutcomeResultsForFormMethod } from '../../lib/form/resolution-outcome-slots.lib'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'
import { SpellResolutionOutcomeGroup } from './spell-resolution-outcome-group'

function shouldWarnPrimaryOutcomeEmpty(resolution: ResolutionFormValues): boolean {
  const primaryResult =
    SPELL_RESOLUTION_CONVENTIONAL_PRIMARY_OUTCOME[
      resolution.methodKind as keyof typeof SPELL_RESOLUTION_CONVENTIONAL_PRIMARY_OUTCOME
    ]
  if (!primaryResult) return false

  const outcomes = resolution.outcomes ?? []
  const primary = outcomes.find((outcome) => outcome.result === primaryResult)
  const primaryEmpty = !primary || isOutcomeEmpty(primary)
  if (!primaryEmpty) return false

  return outcomes.some(
    (outcome) => outcome.result !== primaryResult && hasMeaningfulOutcomeContent(outcome),
  )
}

function outcomeIndexForResult(
  outcomes: ResolutionFormValues['outcomes'],
  result: SpellResolutionOutcomeResult,
): number {
  return outcomes?.findIndex((outcome) => outcome.result === result) ?? -1
}

/** Interactive outcomes editor with method-derived outcome groups. */
export function SpellResolutionOutcomes() {
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined

  if (!resolution?.outcomes?.length) return null

  const slotResults = getOutcomeResultsForFormMethod(resolution)
  const showPrimaryWarning = shouldWarnPrimaryOutcomeEmpty(resolution)

  return (
    <div className="space-y-3">
      {showPrimaryWarning ? (
        <Alert variant="warning" title="Review outcomes" role="status">
          <Text variant="muted" className="text-sm">
            {RESOLUTION_SECTION_LABELS.primaryOutcomeEmptyWarning}
          </Text>
        </Alert>
      ) : null}

      <div className="space-y-3">
        {slotResults.map((result) => {
          const outcomeIndex = outcomeIndexForResult(resolution.outcomes, result)
          if (outcomeIndex < 0) return null

          return (
            <SpellResolutionOutcomeGroup key={result} outcomeIndex={outcomeIndex} result={result} />
          )
        })}
      </div>
    </div>
  )
}

import { useId, useState } from 'react'
import { isOutcomeEmpty, type SpellResolutionOutcomeResult } from '@rpg/contracts'
import { useWatch } from 'react-hook-form'

import { readOutcomeApplications } from '../../lib/form/resolution-outcome-applications.lib'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'

type UseSpellResolutionOutcomeGroupArgs = {
  outcomeIndex: number
  result: SpellResolutionOutcomeResult
}

export function useSpellResolutionOutcomeGroup({
  outcomeIndex,
  result,
}: UseSpellResolutionOutcomeGroupArgs) {
  const headingId = useId()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const outcome = resolution?.outcomes?.[outcomeIndex]
  const applications = readOutcomeApplications(outcome?.applications)

  const collapsibleMiss = result === 'miss'
  const [expanded, setExpanded] = useState(
    () => !collapsibleMiss || !isOutcomeEmpty(outcome ?? { result, applications }),
  )

  if (!resolution || !outcome) return null

  return {
    headingId,
    result,
    outcomeIndex,
    collapsedMiss: collapsibleMiss && !expanded,
    onExpandMiss: () => setExpanded(true),
  }
}

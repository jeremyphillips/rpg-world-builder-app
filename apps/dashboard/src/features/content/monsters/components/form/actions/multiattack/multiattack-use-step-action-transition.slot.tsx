import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { MONSTER_FORM_WRITE_OPTIONS } from '../../../../lib/monster-form-write-options'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'
import {
  multiattackActionKindById,
  multiattackSectionRowsPathFromStepPrefix,
} from '../../../../lib/actions/multiattack/monster-multiattack-use-repetition.lib'
import { multiattackUseStepShouldClearRepetitionOnActionChange } from '../../../../lib/actions/multiattack/monster-multiattack-use-action-transition.lib'

export function MonsterMultiattackUseStepActionTransitionSlot({
  namePrefix,
  fallbackActionRows,
}: {
  namePrefix?: string
  fallbackActionRows?: readonly MonsterActionDraftRow[]
}) {
  if (!namePrefix) return null
  return (
    <MonsterMultiattackUseStepActionTransitionSlotBound
      namePrefix={namePrefix}
      fallbackActionRows={fallbackActionRows}
    />
  )
}

function MonsterMultiattackUseStepActionTransitionSlotBound({
  namePrefix,
  fallbackActionRows,
}: {
  namePrefix: string
  fallbackActionRows?: readonly MonsterActionDraftRow[]
}) {
  const form = useFormContext()
  const { setValue } = form
  const actionId = useWatch({ name: `${namePrefix}.actionId` })
  const sectionRowsPath = multiattackSectionRowsPathFromStepPrefix(namePrefix)
  const liveActionRows = useWatch({ name: sectionRowsPath }) as MonsterActionDraftRow[] | undefined

  const previousActionIdRef = useRef<string | undefined>(undefined)
  const skipTransitionRef = useRef(true)

  useEffect(() => {
    const nextId = typeof actionId === 'string' && actionId.trim() !== '' ? actionId : undefined
    const previousId = previousActionIdRef.current

    if (skipTransitionRef.current) {
      skipTransitionRef.current = false
      previousActionIdRef.current = nextId
      return
    }

    const actionRows =
      liveActionRows && liveActionRows.length > 0 ? liveActionRows : (fallbackActionRows ?? [])
    const nextKind = multiattackActionKindById(nextId, actionRows)
    const shouldClear = multiattackUseStepShouldClearRepetitionOnActionChange({
      previousActionId: previousId,
      nextActionId: nextId,
      nextActionKind: nextKind,
      count: form.getValues(`${namePrefix}.count`),
    })

    previousActionIdRef.current = nextId

    if (!shouldClear) return

    const step = form.getValues(namePrefix) as Record<string, unknown>
    if (!step || typeof step !== 'object') return
    const { count: _removed, ...rest } = step
    setValue(namePrefix, rest, MONSTER_FORM_WRITE_OPTIONS)
  }, [actionId, fallbackActionRows, form, liveActionRows, namePrefix, setValue])

  return null
}

'use client'

import { useId, useState } from 'react'
import { isOutcomeEmpty, type SpellResolutionOutcomeResult } from '@rpg/contracts'
import type { ButtonDropdownItem } from '@rpg/ui'
import { useController, useFormContext, useWatch } from 'react-hook-form'

import { buildOutcomeEffectApplicationMenuItems } from '../../lib/form/resolution-outcome-form-fields'
import {
  appendOutcomeApplication,
  readOutcomeApplications,
  removeOutcomeApplication,
} from '../../lib/form/resolution-outcome-applications.lib'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'

const OUTCOMES_FIELD = `${RESOLUTION_FIELD_NAME}.outcomes` as const

type UseSpellResolutionOutcomeGroupArgs = {
  outcomeIndex: number
  result: SpellResolutionOutcomeResult
}

export function useSpellResolutionOutcomeGroup({
  outcomeIndex,
  result,
}: UseSpellResolutionOutcomeGroupArgs) {
  const noteId = useId()
  const headingId = useId()
  const { control, getValues, setValue } = useFormContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const outcome = resolution?.outcomes?.[outcomeIndex]
  const effects = resolution?.effects ?? []
  const applications = readOutcomeApplications(outcome?.applications)
  const { field: noteField, fieldState: noteFieldState } = useController({
    control,
    name: `${OUTCOMES_FIELD}.${outcomeIndex}.note` as const,
  })

  const collapsibleMiss = result === 'miss'
  const [expanded, setExpanded] = useState(
    () => !collapsibleMiss || !isOutcomeEmpty(outcome ?? { result, applications: [] }),
  )

  if (!resolution || !outcome) return null

  const menuItems: ButtonDropdownItem[] = buildOutcomeEffectApplicationMenuItems(
    effects,
    outcome,
  ).map((item) => ({ id: item.id, label: item.label }))

  return {
    noteId,
    headingId,
    result,
    outcomeIndex,
    applications,
    effects,
    menuItems,
    noteValue: noteField.value ?? '',
    noteError: noteFieldState.error?.message,
    onNoteChange: noteField.onChange,
    onNoteBlur: noteField.onBlur,
    collapsedMiss: collapsibleMiss && !expanded,
    onExpandMiss: () => setExpanded(true),
    onAppendApplication: (effectId: string) =>
      appendOutcomeApplication(getValues, setValue, outcomeIndex, effectId),
    onRemoveApplication: (applicationIndex: number) =>
      removeOutcomeApplication(getValues, setValue, outcomeIndex, applicationIndex),
  }
}

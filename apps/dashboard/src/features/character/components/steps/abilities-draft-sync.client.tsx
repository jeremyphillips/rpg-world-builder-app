'use client'

import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { CharacterBuilderDraft, CharacterBuilderDraftAbilities } from '@rpg/contracts'

import type { AbilitiesFormValues } from '../../lib/steps/abilities-form-fields'
import {
  abilitiesDraftToFormValues,
  abilitiesFormValuesToDraft,
  areAbilitiesDraftsEqual,
} from '../../lib/steps/abilities-form-values'

type AbilitiesDraftSyncProps = {
  draftAbilities: CharacterBuilderDraftAbilities
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

/** Keeps abilities form state and the persisted builder draft in sync (both directions). */
export function AbilitiesDraftSync({ draftAbilities, onDraftChange }: AbilitiesDraftSyncProps) {
  const { control, reset } = useFormContext<AbilitiesFormValues>()
  const method = useWatch({ control, name: 'method' })
  const str = useWatch({ control, name: 'str' })
  const dex = useWatch({ control, name: 'dex' })
  const con = useWatch({ control, name: 'con' })
  const intScore = useWatch({ control, name: 'int' })
  const wis = useWatch({ control, name: 'wis' })
  const cha = useWatch({ control, name: 'cha' })
  const onDraftChangeRef = useRef(onDraftChange)
  const priorDraftRef = useRef(draftAbilities)

  onDraftChangeRef.current = onDraftChange

  useEffect(() => {
    const previousDraft = priorDraftRef.current
    const draftChanged = !areAbilitiesDraftsEqual(previousDraft, draftAbilities)
    const formAbilities = abilitiesFormValuesToDraft({
      method: method ?? 'standard-array',
      str,
      dex,
      con,
      int: intScore,
      wis,
      cha,
    })

    if (draftChanged) {
      priorDraftRef.current = draftAbilities
      if (!areAbilitiesDraftsEqual(draftAbilities, formAbilities)) {
        reset(abilitiesDraftToFormValues(draftAbilities))
      }
      return
    }

    if (!areAbilitiesDraftsEqual(draftAbilities, formAbilities)) {
      onDraftChangeRef.current({ abilities: formAbilities })
    }
  }, [cha, con, dex, draftAbilities, intScore, method, reset, str, wis])

  return null
}

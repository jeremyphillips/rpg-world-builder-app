'use client'

import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  resolveAbilityGenerationMethod,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderDraftAbilities,
} from '@rpg/contracts'

import type { AbilitiesFormValues } from '../../lib/steps/abilities-form-fields'
import {
  abilitiesDraftToFormValues,
  abilitiesFormValuesToDraft,
  areAbilitiesDraftsEqual,
} from '../../lib/steps/abilities-form-values'

type AbilitiesDraftSyncProps = {
  context: CharacterBuildContext
  draftAbilities: CharacterBuilderDraftAbilities
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

/**
 * Keeps abilities form state and the persisted builder draft in sync (both directions).
 * Method is context-derived but stored on the draft for validation and finalization.
 */
export function AbilitiesDraftSync({
  context,
  draftAbilities,
  onDraftChange,
}: AbilitiesDraftSyncProps) {
  const { control, reset } = useFormContext<AbilitiesFormValues>()
  const str = useWatch({ control, name: 'str' })
  const dex = useWatch({ control, name: 'dex' })
  const con = useWatch({ control, name: 'con' })
  const intScore = useWatch({ control, name: 'int' })
  const wis = useWatch({ control, name: 'wis' })
  const cha = useWatch({ control, name: 'cha' })
  const onDraftChangeRef = useRef(onDraftChange)
  const priorDraftRef = useRef(draftAbilities)
  const resolvedMethod = resolveAbilityGenerationMethod(
    context.characterCreationRules.abilityGeneration,
  )

  onDraftChangeRef.current = onDraftChange

  useEffect(() => {
    const previousDraft = priorDraftRef.current
    const draftChanged = !areAbilitiesDraftsEqual(previousDraft, draftAbilities)
    const formAbilities = abilitiesFormValuesToDraft(
      { str, dex, con, int: intScore, wis, cha },
      resolvedMethod,
    )

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
  }, [cha, con, dex, draftAbilities, intScore, reset, resolvedMethod, str, wis])

  return null
}

'use client'

import { useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  resolveAbilityGenerationMethod,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderDraftAbilities,
} from '@rpg/contracts'

import type { AbilitiesFormValues } from '../../../../lib/steps/abilities-form-fields'
import {
  abilitiesDraftToFormValues,
  abilitiesFormValuesToDraft,
  areAbilitiesDraftsEqual,
} from '../../../../lib/steps/abilities-form-values'
import { AbilitiesScoreFieldRegistry } from './abilities-score-field-registry.client'

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
  const { control, getValues, reset } = useFormContext<AbilitiesFormValues>()
  const watchedValues = useWatch({ control }) as AbilitiesFormValues | undefined
  const onDraftChangeRef = useRef(onDraftChange)
  const priorDraftRef = useRef(draftAbilities)
  const draftAbilitiesRef = useRef(draftAbilities)
  const resolvedMethod = resolveAbilityGenerationMethod(
    context.characterCreationRules.abilityGeneration,
  )

  useEffect(() => {
    onDraftChangeRef.current = onDraftChange
    draftAbilitiesRef.current = draftAbilities
  })

  useEffect(() => {
    const previousDraft = priorDraftRef.current
    const draftChanged = !areAbilitiesDraftsEqual(previousDraft, draftAbilities)
    const formValues = watchedValues ?? getValues()
    const formAbilities = abilitiesFormValuesToDraft(formValues, resolvedMethod)

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
  }, [draftAbilities, getValues, reset, resolvedMethod, watchedValues])

  useEffect(() => {
    return () => {
      const formAbilities = abilitiesFormValuesToDraft(getValues(), resolvedMethod)
      if (areAbilitiesDraftsEqual(draftAbilitiesRef.current, formAbilities)) return
      onDraftChangeRef.current({ abilities: formAbilities })
    }
  }, [getValues, resolvedMethod])

  return <AbilitiesScoreFieldRegistry />
}

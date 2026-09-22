import * as React from 'react'
import { useWatch, type FieldPath, type PathValue, type UseFormReturn } from 'react-hook-form'

import type { CharacterBuildContext, CharacterGender } from '@rpg/contracts'
import type { TrailingFieldActionConfig } from '@rpg/ui/form'

import {
  generateCharacterSpeciesName,
  resolveCharacterSpeciesNameGenerationSupport,
} from '../lib/naming/character-species-name-generation.lib'
import { generateNameActionIcon } from '../lib/naming/species-name-generation-action-icon'
import {
  GENERATE_NAME_ACTION_LABEL,
  SPECIES_NAME_GENERATION_FAILED,
  SPECIES_REQUIRED_FOR_NAME_GENERATION_HINT,
} from '../lib/naming/species-name-generation-labels'

function resolveFormGender(gender: unknown): CharacterGender | undefined {
  if (gender === 'male' || gender === 'female') {
    return gender
  }
  return undefined
}

export function useSpeciesNameTrailingAction<T extends { name: string; gender?: string }>({
  speciesId,
  buildContext,
  form,
}: {
  speciesId: string
  buildContext: CharacterBuildContext
  form: UseFormReturn<T>
}) {
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const genderValue = useWatch({ control: form.control, name: 'gender' as FieldPath<T> })
  const gender = resolveFormGender(genderValue)

  const generationSupport = React.useMemo(
    () => resolveCharacterSpeciesNameGenerationSupport({ speciesId, context: buildContext }),
    [buildContext, speciesId],
  )

  const handleGenerate = React.useCallback(async () => {
    if (!speciesId || pending || !generationSupport.enabled) return
    setPending(true)
    setError(null)
    try {
      const result = await generateCharacterSpeciesName({
        speciesId,
        context: buildContext,
        gender,
      })
      if (!result.ok) {
        setError(result.kind === 'unsupported' ? result.reason : SPECIES_NAME_GENERATION_FAILED)
        return
      }
      form.setValue('name' as FieldPath<T>, result.name as PathValue<T, FieldPath<T>>, {
        shouldDirty: true,
        shouldValidate: true,
      })
    } finally {
      setPending(false)
    }
  }, [buildContext, form, gender, generationSupport.enabled, pending, speciesId])

  const trailingAction = React.useMemo(
    (): TrailingFieldActionConfig => ({
      label: GENERATE_NAME_ACTION_LABEL,
      icon: generateNameActionIcon,
      onAction: handleGenerate,
      disabled: !speciesId || !generationSupport.enabled,
      pending,
      error: error ?? undefined,
    }),
    [error, generationSupport.enabled, handleGenerate, pending, speciesId],
  )

  const nameHint = !speciesId
    ? SPECIES_REQUIRED_FOR_NAME_GENERATION_HINT
    : generationSupport.disabledReason && !generationSupport.enabled
      ? generationSupport.disabledReason
      : undefined

  return { trailingAction, nameHint }
}

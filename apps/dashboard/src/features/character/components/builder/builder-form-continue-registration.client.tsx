'use client'

import { useEffect, useRef } from 'react'
import { useFormContext, type FieldValues } from 'react-hook-form'

import type { CharacterBuilderDraft, CharacterBuilderStepId } from '@rpg/contracts'

import { registerBuilderFormContinueHandler } from '../../lib/builder-form-continue-registry'

export type BuilderFormContinueRegistrationProps<TFieldValues extends FieldValues> = {
  stepId: CharacterBuilderStepId
  toDraftPatch: (values: TFieldValues) => Partial<CharacterBuilderDraft>
  onStepComplete: (patch: Partial<CharacterBuilderDraft>) => void
  onContinueValidationFailed: (patch: Partial<CharacterBuilderDraft>) => void
}

/** Registers a footer Continue handler that validates the step form before advancing. */
export function BuilderFormContinueRegistration<TFieldValues extends FieldValues>({
  stepId,
  toDraftPatch,
  onStepComplete,
  onContinueValidationFailed,
}: BuilderFormContinueRegistrationProps<TFieldValues>) {
  const form = useFormContext<TFieldValues>()
  const onStepCompleteRef = useRef(onStepComplete)
  const onContinueValidationFailedRef = useRef(onContinueValidationFailed)
  const toDraftPatchRef = useRef(toDraftPatch)

  onStepCompleteRef.current = onStepComplete
  onContinueValidationFailedRef.current = onContinueValidationFailed
  toDraftPatchRef.current = toDraftPatch

  useEffect(() => {
    return registerBuilderFormContinueHandler(stepId, async () => {
      const valid = await form.trigger()
      const patch = toDraftPatchRef.current(form.getValues())

      if (valid) {
        onStepCompleteRef.current(patch)
        return
      }

      onContinueValidationFailedRef.current(patch)
    })
  }, [form, stepId])

  return null
}

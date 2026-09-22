import { useController, useFormContext } from 'react-hook-form'

import type { CharacterBuildContext, CharacterBuilderDraft } from '@rpg/contracts'
import { TextField } from '@rpg/ui'

import { useSpeciesNameTrailingAction } from '../../../../hooks/use-species-name-trailing-action'
import { BUILDER_STEP_FORM_IDS } from '../../../../lib/steps/builder-step-form-ids'
import type { IdentityFormValues } from '../../../../lib/steps/identity-form-fields'

export type IdentityNameFieldProps = {
  buildContext: CharacterBuildContext
  draft: CharacterBuilderDraft
}

export function IdentityNameField({ buildContext, draft }: IdentityNameFieldProps) {
  const form = useFormContext<IdentityFormValues>()
  const speciesId = draft.species.speciesId ?? ''
  const { trailingAction, nameHint } = useSpeciesNameTrailingAction({
    speciesId,
    buildContext,
    form,
  })
  const { field, fieldState } = useController({ name: 'name', control: form.control })
  const id = `${BUILDER_STEP_FORM_IDS.identity}-name`

  return (
    <TextField
      id={id}
      label="Character name"
      labelVisibility="visible"
      required
      width="full"
      placeholder="Enter a name"
      trailingAction={trailingAction}
      hint={nameHint}
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      ref={field.ref}
      error={fieldState.error?.message}
      invalid={Boolean(fieldState.error)}
    />
  )
}

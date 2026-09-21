import { useController, useFormContext } from 'react-hook-form'

import type { CharacterBuildContext, CharacterBuilderDraft } from '@rpg/contracts'
import { TextField } from '@rpg/ui'

import { useSpeciesNameTrailingAction } from '../../../../hooks/use-species-name-trailing-action'
import { BUILDER_STEP_FORM_IDS } from '../../../../lib/steps/builder-step-form-ids'
import type { IdentityFormValues } from '../../../../lib/steps/identity-form-fields'
import { IdentityNamingSpeciesSelect } from './identity-naming-species-select'

export type IdentityNameFieldProps = {
  buildContext: CharacterBuildContext
  draft: CharacterBuilderDraft
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function IdentityNameField({ buildContext, draft, onDraftChange }: IdentityNameFieldProps) {
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
    <div className="flex w-full min-w-0 flex-col gap-4">
      {!speciesId ? (
        <IdentityNamingSpeciesSelect
          buildContext={buildContext}
          draft={draft}
          onDraftChange={onDraftChange}
        />
      ) : null}
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
    </div>
  )
}

'use client'

import { useMemo } from 'react'
import {
  resolveAbilityGenerationMethod,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
} from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import {
  abilitiesFormSchema,
  buildAbilitiesStepFormFields,
  type AbilitiesFormValues,
} from '../../lib/steps/abilities-form-fields'
import {
  abilitiesDraftToFormValues,
  abilitiesFormValuesToDraft,
} from '../../lib/steps/abilities-form-values'
import { BUILDER_STEP_FORM_IDS } from '../../lib/steps/builder-step-form-ids'
import { BuilderFormContinueRegistration } from '../builder/builder-form-continue-registration.client'
import { AbilitiesDraftSync } from './abilities-draft-sync.client'
import { BuilderStepFrame } from './builder-step-frame.client'
import { StandardArrayAssignment } from './standard-array-assignment.client'

export type AbilitiesStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onStepComplete: (patch: Partial<CharacterBuilderDraft>) => void
  onFormContinueValidationFailed: (patch: Partial<CharacterBuilderDraft>) => void
}

export function AbilitiesStep({
  context,
  draft,
  validationIssues,
  onDraftChange,
  onStepComplete,
  onFormContinueValidationFailed,
}: AbilitiesStepProps) {
  const abilityGeneration = context.characterCreationRules.abilityGeneration
  const resolvedMethod = resolveAbilityGenerationMethod(abilityGeneration)

  const fields = useMemo(
    () =>
      buildAbilitiesStepFormFields({
        method: resolvedMethod,
        renderStandardArrayAssignment: () => (
          <StandardArrayAssignment standardArray={abilityGeneration.standardArray} />
        ),
        renderDraftSync: () => (
          <AbilitiesDraftSync
            context={context}
            draftAbilities={draft.abilities}
            onDraftChange={onDraftChange}
          />
        ),
        renderContinueRegistration: () => (
          <BuilderFormContinueRegistration<AbilitiesFormValues>
            stepId="abilities"
            toDraftPatch={(values) => ({
              abilities: abilitiesFormValuesToDraft(values, resolvedMethod),
            })}
            onStepComplete={onStepComplete}
            onContinueValidationFailed={onFormContinueValidationFailed}
          />
        ),
      }),
    [
      abilityGeneration.standardArray,
      context,
      draft.abilities,
      onDraftChange,
      onFormContinueValidationFailed,
      onStepComplete,
      resolvedMethod,
    ],
  )

  return (
    <BuilderStepFrame stepId="abilities" validationIssues={validationIssues}>
      <Form
        id={BUILDER_STEP_FORM_IDS.abilities}
        schema={abilitiesFormSchema}
        fields={fields}
        defaultValues={abilitiesDraftToFormValues(draft.abilities)}
        mode="onChange"
        onSubmit={(values) => {
          onStepComplete({ abilities: abilitiesFormValuesToDraft(values, resolvedMethod) })
        }}
      />
    </BuilderStepFrame>
  )
}

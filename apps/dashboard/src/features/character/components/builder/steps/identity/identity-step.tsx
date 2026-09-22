import { useMemo } from 'react'
import type { CharacterBuildContext, CharacterBuilderDraft } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Form } from '@rpg/ui/form'

import {
  buildIdentityStepFormFields,
  identityFormSchema,
} from '../../../../lib/steps/identity-form-fields'
import type { IdentityFormValues } from '../../../../lib/steps/identity-form-fields'
import {
  identityDraftToFormValues,
  identityFormValuesToDraft,
} from '../../../../lib/steps/identity-form-values'
import { BUILDER_STEP_FORM_IDS } from '../../../../lib/steps/builder-step-form-ids'
import { BuilderFormContinueRegistration } from '../../builder-form-continue-registration'
import { IdentityDraftSync } from './identity-draft-sync'
import { IdentityNameField } from './identity-name-field'
import { BuilderStepFrame } from '../shared/builder-step-frame'

export type IdentityStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onStepComplete: (patch: Partial<CharacterBuilderDraft>) => void
  onFormContinueValidationFailed: (patch: Partial<CharacterBuilderDraft>) => void
}

export function IdentityStep({
  context,
  draft,
  validationIssues,
  onDraftChange,
  onStepComplete,
  onFormContinueValidationFailed,
}: IdentityStepProps) {
  const fields = useMemo(
    () =>
      buildIdentityStepFormFields({
        renderNameField: () => <IdentityNameField buildContext={context} draft={draft} />,
        renderDraftSync: () => (
          <IdentityDraftSync draftIdentity={draft.identity} onDraftChange={onDraftChange} />
        ),
        renderContinueRegistration: () => (
          <BuilderFormContinueRegistration<IdentityFormValues>
            stepId="identity"
            toDraftPatch={(values) => ({ identity: identityFormValuesToDraft(values) })}
            onStepComplete={onStepComplete}
            onContinueValidationFailed={onFormContinueValidationFailed}
          />
        ),
      }),
    [context, draft, onDraftChange, onFormContinueValidationFailed, onStepComplete],
  )

  return (
    <BuilderStepFrame stepId="identity" validationIssues={validationIssues}>
      <Form
        id={BUILDER_STEP_FORM_IDS.identity}
        schema={identityFormSchema}
        fields={fields}
        defaultValues={identityDraftToFormValues(draft.identity)}
        mode="onChange"
        onSubmit={(values) => {
          onStepComplete({ identity: identityFormValuesToDraft(values) })
        }}
      />
    </BuilderStepFrame>
  )
}

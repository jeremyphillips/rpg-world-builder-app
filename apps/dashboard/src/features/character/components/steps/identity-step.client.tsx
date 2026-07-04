'use client'

import type { CharacterBuilderDraft, CharacterBuildValidationIssue } from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import { identityFormFields, identityFormSchema } from '../../lib/steps/identity-form-fields'
import {
  identityDraftToFormValues,
  identityFormValuesToDraft,
} from '../../lib/steps/identity-form-values'
import { BUILDER_STEP_FORM_IDS } from '../../lib/steps/builder-step-form-ids'
import { BuilderStepFrame } from './builder-step-frame.client'

export type IdentityStepProps = {
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onStepComplete: (patch: Partial<CharacterBuilderDraft>) => void
}

export function IdentityStep({ draft, validationIssues, onStepComplete }: IdentityStepProps) {
  return (
    <BuilderStepFrame stepId="identity" validationIssues={validationIssues}>
      <Form
        id={BUILDER_STEP_FORM_IDS.identity}
        schema={identityFormSchema}
        fields={identityFormFields}
        defaultValues={identityDraftToFormValues(draft.identity)}
        mode="onChange"
        onSubmit={(values) => {
          onStepComplete({ identity: identityFormValuesToDraft(values) })
        }}
      />
    </BuilderStepFrame>
  )
}

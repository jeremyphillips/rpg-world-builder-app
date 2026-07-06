'use client'

import { useMemo } from 'react'
import type { CharacterBuilderDraft, CharacterBuildValidationIssue } from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import { identityFormFields, identityFormSchema } from '../../lib/steps/identity-form-fields'
import {
  identityDraftToFormValues,
  identityFormValuesToDraft,
} from '../../lib/steps/identity-form-values'
import { BUILDER_STEP_FORM_IDS } from '../../lib/steps/builder-step-form-ids'
import { IdentityDraftSync } from './identity-draft-sync.client'
import { BuilderStepFrame } from './builder-step-frame.client'

export type IdentityStepProps = {
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onStepComplete: (patch: Partial<CharacterBuilderDraft>) => void
}

export function IdentityStep({
  draft,
  validationIssues,
  onDraftChange,
  onStepComplete,
}: IdentityStepProps) {
  const fields = useMemo(
    () => [
      ...identityFormFields,
      {
        kind: 'slot' as const,
        name: '_identityDraftSync',
        render: () => (
          <IdentityDraftSync draftIdentity={draft.identity} onDraftChange={onDraftChange} />
        ),
      },
    ],
    [draft.identity, onDraftChange],
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

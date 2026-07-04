'use client'

import type { CharacterBuilderDraft, CharacterBuildValidationIssue } from '@rpg/contracts'
import { Form } from '@rpg/ui/form'

import { abilitiesFormFields, abilitiesFormSchema } from '../../lib/steps/abilities-form-fields'
import {
  abilitiesDraftToFormValues,
  abilitiesFormValuesToDraft,
} from '../../lib/steps/abilities-form-values'
import { BUILDER_STEP_FORM_IDS } from '../../lib/steps/builder-step-form-ids'
import { BuilderStepFrame } from './builder-step-frame.client'

export type AbilitiesStepProps = {
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onStepComplete: (patch: Partial<CharacterBuilderDraft>) => void
}

export function AbilitiesStep({ draft, validationIssues, onStepComplete }: AbilitiesStepProps) {
  return (
    <BuilderStepFrame stepId="abilities" validationIssues={validationIssues}>
      <Form
        id={BUILDER_STEP_FORM_IDS.abilities}
        schema={abilitiesFormSchema}
        fields={abilitiesFormFields}
        defaultValues={abilitiesDraftToFormValues(draft.abilities)}
        mode="onChange"
        onSubmit={(values) => {
          onStepComplete({ abilities: abilitiesFormValuesToDraft(values) })
        }}
      />
    </BuilderStepFrame>
  )
}
